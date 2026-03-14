# TradeGuard - Session Progress Reference

**Date:** March 14, 2026
**Session Summary:** Vercel deployment + Role-based access control implementation

---

## 1. VERCEL DEPLOYMENT (Completed)

### Actions Taken:
- Installed Vercel CLI globally: `npm install -g vercel`
- Logged in to Vercel (user: `padmanavakarmakar-5303`)
- Linked project to Vercel: `vercel link --yes`
- Connected to GitHub repo: `AI-Kurukshetra/descartes_blueprint`

### Environment Variables Added (Production):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

### Deployment URLs:
- **Production:** https://tradeguard-two.vercel.app
- **Inspect:** https://vercel.com/padmanavakarmakar-5303s-projects/tradeguard

---

## 2. ROLE-BASED ACCESS CONTROL (Completed)

### Requirement Source:
- Blueprint PDF Feature #16: "User Role Management"
- Priority: Important | Complexity: Low
- Description: "Granular permissions and role-based access control for different user types"

### Database Changes:

#### New Enums:
```sql
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'analyst', 'viewer');
CREATE TYPE profile_status AS ENUM ('active', 'pending', 'inactive');
```

#### New Table - `profiles`:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  role user_role DEFAULT 'viewer',
  status profile_status DEFAULT 'active',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### RLS Policies Added:
- Users can view/update own profile
- Admins can view/update/insert/delete all profiles

#### Triggers Added:
- `on_auth_user_created` - Auto-creates profile when user signs up
- `update_profiles_updated_at` - Updates timestamp on profile changes

#### Helper Functions:
- `get_user_role(user_id)` - Returns user's role
- `is_admin(user_id)` - Returns boolean if user is admin
- `has_permission(user_id, required_roles[])` - Checks role permissions

### Files Modified/Created:

1. **supabase/schema.sql**
   - Added enums, profiles table, indexes, RLS policies, triggers, helper functions

2. **supabase/migrations/20260314100000_add_profiles.sql**
   - Full migration file for profiles table

3. **lib/types.ts**
   - Added: `UserRole`, `ProfileStatus`, `Profile` types
   - Added: `ROLE_PERMISSIONS` constant

4. **app/dashboard/settings/page.tsx**
   - Updated to fetch/save profile data from Supabase
   - Admins can view all team members
   - Admins can change user roles
   - Non-admins see only their own profile
   - Real-time role changes persist to database

### Migration Applied:
```bash
supabase db push --linked
# Applied: 20260314100000_add_profiles.sql
```

### Profiles Created for Existing Users:
- padmanavakarmakar148@gmail.com → admin
- padmanava.karmakar@bacancy.com → admin
- demo@tradeguard.com → admin

---

## 3. ROLE PERMISSIONS MATRIX

| Role    | Permissions                                                    |
|---------|----------------------------------------------------------------|
| admin   | all                                                            |
| manager | shipments, documents, products, compliance, team               |
| analyst | shipments, documents, products, reports, hs-classifier, duty-calculator |
| viewer  | dashboard, reports                                             |

---

## 4. COMMANDS REFERENCE

```bash
# Vercel
vercel login
vercel link --yes
vercel env add <NAME> production --value "<VALUE>" --yes
vercel env ls
vercel --prod --yes

# Supabase
supabase projects list
supabase db push --linked

# Build
npm run build
```

---

## 5. NEXT STEPS (Not Done Yet)

- [ ] Add role-based route protection middleware
- [ ] Add role checks in API routes
- [ ] Implement team invitation email flow
- [ ] Add role-based sidebar menu filtering
- [ ] Update Vercel with new deployment after changes

---

## 6. IMPORTANT NOTES

- First user to sign up gets `admin` role (via trigger)
- Subsequent users get `viewer` role by default
- Only admins can change other users' roles
- Users cannot change their own role
- Profiles are auto-created on signup via database trigger
