/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a distributed rate limiter
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Check rate limit for a given identifier (e.g., IP address or user ID)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = identifier

  let entry = rateLimitStore.get(key)

  // If no entry exists or window has expired, create a new one
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, entry)
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime: entry.resetTime,
    }
  }

  // Check if limit is exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment counter
  entry.count++
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // Fallback to a hash of user-agent + some other headers
  const userAgent = request.headers.get("user-agent") || "unknown"
  return `ua:${userAgent.substring(0, 50)}`
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers()
  headers.set("X-RateLimit-Remaining", result.remaining.toString())
  headers.set("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000).toString())
  return headers
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // HS Classification: 10 requests per minute (as specified in CLAUDE.md)
  hsClassification: { limit: 10, windowSeconds: 60 },
  // Party screening: 20 requests per minute
  partyScreening: { limit: 20, windowSeconds: 60 },
  // General API: 100 requests per minute
  general: { limit: 100, windowSeconds: 60 },
} as const
