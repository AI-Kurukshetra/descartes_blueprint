# ⚙️ CLAUDE CODE CLI — COMPLETE SETUP GUIDE
# Do ALL of this BEFORE hackathon day.

---

## STEP 1 — INSTALL CLAUDE CODE

```bash
npm install -g @anthropic-ai/claude-code

# Verify
claude --version
```

---

## STEP 2 — AUTHENTICATE

Since Bacancy is providing an API key:

```bash
# Option A — Environment variable (recommended)
export ANTHROPIC_API_KEY="sk-ant-..."

# Make it permanent
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
source ~/.zshrc

# Option B — Claude CLI login (if they give account access)
claude
# It will prompt you to authenticate on first run
```

**On hackathon day — Bacancy shares the key:**
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
# Then just run: claude
```

---

## STEP 3 — LAUNCH AND VERIFY

```bash
mkdir test-project && cd test-project
git init
claude
# Should open the interactive TUI
# Type: "Create a hello.ts that logs Hello Claude"
# It should create the file autonomously
```

Key commands inside Claude Code:
```
/help          → see all commands
/status        → current config + model
/clear         → clear conversation
/exit or ESC   → exit
```

---

## STEP 4 — UNDERSTAND THE MODES

Claude Code asks for approval on file edits by default.
For hackathon speed, you want auto-accept mode:

```bash
# Start with auto-accept (never ask for approval)
claude --dangerously-skip-permissions

# OR — inside Claude Code session, accept all with:
# Press 'a' when prompted to always accept
```

> Note: `--dangerously-skip-permissions` is fine for a controlled hackathon environment.
> It skips the "approve this edit?" prompts on every file.

---

## STEP 5 — HACKATHON LAUNCH COMMAND

This is the exact command to start every Claude Code session on hackathon day:

```bash
cd your-project-folder
claude --dangerously-skip-permissions
```

Once inside, Claude Code reads your CLAUDE.md automatically and knows all your standards.

---

## STEP 6 — KEY BEHAVIORS TO KNOW

### CLAUDE.md is your power
- Place CLAUDE.md in the project root
- Claude Code reads it at session start, every time
- This is what makes it build to YOUR standards

### Claude Code can run terminal commands
- It will run `npm install`, `npx`, `git` etc. directly
- No network sandbox issues unlike Codex
- Let it run — don't interrupt

### Resume sessions
```bash
# Continue where you left off
claude --continue
```

### Multi-file context
Claude Code reads your full codebase before responding.
The bigger your project gets, the smarter its suggestions become.

---

## TROUBLESHOOTING

### "Permission denied" or approval prompts slowing you
```bash
# Use the skip flag
claude --dangerously-skip-permissions
```

### "API key not valid"
```bash
echo $ANTHROPIC_API_KEY  # verify it's set
# If empty: export ANTHROPIC_API_KEY="sk-ant-..."
```

### "Claude going in wrong direction"
```
Stop. Read CLAUDE.md again from top to bottom.
Then do ONLY: [specific task]. Nothing else.
```

### "Made unwanted changes"
```bash
git diff          # see what changed
git checkout .    # undo all uncommitted changes
```

---

## PRE-HACKATHON CHECKLIST

- [ ] `claude --version` works
- [ ] API key structure ready (paste key on day)
- [ ] Test run on dummy project completed
- [ ] `claude --dangerously-skip-permissions` tested
- [ ] CLAUDE.md ready to drop into project root
