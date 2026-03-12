# Skill: commit

## Purpose

Create a well-described git commit that accurately summarises the changes made, so the project history is readable and useful without needing to diff every commit.

---

## When to activate this skill

Activate when:

- A feature has been fully implemented and tested
- A bug has been fixed
- A refactor is complete
- Documentation has been updated (README, AGENTS.md, skills/)
- Configuration or tooling has changed

Do **not** commit:
- Broken builds or failing tests — run `npm run build` and `npm test` first
- Incomplete work — finish the task before committing
- Unrelated changes bundled together — one commit per logical change

---

## How to execute this skill

### Step 1 — Verify the working tree is ready

```bash
npm run build   # must succeed with no errors
npm test        # must pass
```

If either fails, fix the issue before proceeding.

### Step 2 — Stage the right files

Stage only files related to the current change:

```bash
git add <file1> <file2> ...
```

Never blindly run `git add .` — review what has changed first:

```bash
git status
git diff --staged
```

### Step 3 — Determine the commit type

Choose the type that best describes the change:

| Type | When to use |
|---|---|
| `feat` | A new feature or capability visible to users |
| `fix` | A bug fix |
| `refactor` | Code restructure with no behaviour change |
| `chore` | Tooling, config, dependencies, CI |
| `docs` | README, AGENTS.md, skills/, comments only |
| `test` | Adding or updating tests only |
| `style` | Formatting, whitespace (no logic change) |

### Step 4 — Write the commit message

Follow this format exactly:

```
<type>(<scope>): <short summary>

<body — what changed and why, if not obvious>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

#### Rules for the subject line (`<type>(<scope>): <summary>`)

- Use **imperative mood**: "add", "remove", "update", "fix" — not "added", "removes", "updated"
- Maximum **72 characters**
- **Lowercase** after the colon
- No period at the end
- The `<scope>` is the module or area changed: `cli`, `http`, `config`, `security`, `readme`, `deps`, `core/<domain>`, etc.

#### Rules for the body

- Wrap at 100 characters per line
- Explain **what** changed and **why** — not how (the diff shows how)
- Omit if the subject line is self-explanatory
- Separate from subject with a blank line

#### Examples

```
feat(cli): add --enable-security flag with OTP generation

Adds commander.js option --enable-security to the serve command.
When set, enables HTTPS and prints a 6-digit OTP to the console
for future use in web access control.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

```
docs(readme): update domain description and CLI usage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

```
chore(deps): add commander and selfsigned packages

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

### Step 5 — Commit

```bash
git commit -m "<subject>" -m "<body>" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Or use a file for multi-line messages:

```bash
git commit -F <(cat <<'EOF'
feat(security): add OTP generation in core/security

...body...

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
EOF
)
```

---

## Scope reference

| Changed area | Scope to use |
|---|---|
| `src/core/<domain>/` | `core/<domain>` |
| `src/adapters/cli/` | `cli` |
| `src/adapters/http/` | `http` |
| `src/config/` | `config` |
| `src/bin.ts` | `cli` |
| `src/index.ts` | `api` |
| `web/` | `web` |
| `skills/` | `skills` |
| `README.md` | `readme` |
| `AGENTS.md` | `agents` |
| `package.json`, `tsconfig`, tooling | `chore` (no scope needed) |
| Multiple unrelated areas | omit scope |

---

## Quality rules

- One commit = one logical change
- The subject line alone must tell the story without reading the diff
- Never force-push to shared branches
- The `Co-authored-by` trailer is **always required**
