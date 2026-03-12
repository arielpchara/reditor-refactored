# Skill: status

## Purpose

Maintain the **AI & Copilot Usage** section in `README.md`.
This section informs readers that the project was built with AI assistance,
that generated content may contain errors, and which areas were AI-generated.

---

## When to activate this skill

Activate when:

- A significant new feature or module is added by an AI agent
- The scope of AI involvement changes
- The project reaches a new milestone
- Any human reviewer asks for clarification on what was AI-generated

---

## How to execute this skill

### Step 1 — Inventory AI contributions

Scan the git log and source files to identify what has been generated or heavily influenced by AI:

```bash
git log --oneline
```

Look for the `Co-authored-by: Copilot` trailer in commits to identify AI-authored changes.

### Step 2 — Write or update the section

Add or update the following section in `README.md`, **after the Architecture section and before the License section**.

Use this exact heading and structure:

```markdown
## ⚠️ AI & Copilot Usage

This project was built with the assistance of **GitHub Copilot** and other AI tools.

> **Disclaimer:** AI-generated content may contain errors, security vulnerabilities,
> incorrect logic, or outdated practices. All code, configuration, and documentation
> in this repository should be reviewed and validated by a qualified human developer
> before being used in any production environment.

### What was AI-generated

List the areas of the codebase that were generated or significantly shaped by AI:

<!-- Update this list to reflect the current state of the project -->
| Area | Status |
|---|---|
| Project scaffold (tsconfig, jest, prettier, nodemon) | 🤖 AI-generated |
| Hexagonal Architecture structure | 🤖 AI-generated |
| Express HTTPS server (`src/adapters/http/`) | 🤖 AI-generated |
| CLI entry point with commander.js (`src/bin.ts`, `src/adapters/cli/`) | 🤖 AI-generated |
| OTP generation (`src/core/security/`) | 🤖 AI-generated |
| Git hooks (husky, lint-staged, cspell) | 🤖 AI-generated |
| Unit tests | 🤖 AI-generated |
| This README | 🤖 AI-generated |
| AGENTS.md and skills/ | 🤖 AI-generated |

### Status icons

| Icon | Meaning |
|---|---|
| 🤖 AI-generated | Written entirely by an AI agent |
| 👤 Human-written | Written entirely by a human |
| 🔀 Mixed | Combination of AI and human authorship |
| ✅ Human-reviewed | AI-generated but reviewed and approved by a human |
```

### Step 3 — Keep the table current

Every time a new module or file is added:
- Add a row to the table with the correct status icon
- Change `🤖 AI-generated` to `✅ Human-reviewed` once a human has reviewed that area

---

## Quality rules

- Never remove this section — it must always be present once added
- Keep the disclaimer text verbatim — do not soften or remove it
- Update the table on every significant AI contribution
- Be honest: if something was human-written, mark it `👤 Human-written`
