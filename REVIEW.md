# 🔁 I Rebuilt REDITOR from Scratch in Under 24 Hours — with AI

A few months ago, I shared **REDITOR** here — an idea for a CLI tool to edit server files from the browser.
👉 [Original post](https://www.linkedin.com/feed/update/urn:li:activity:7437949769785729024/)

Back then, it was more concept than product. This time, I rebuilt everything from scratch — and in **under 24 hours** I have a functional, published program that anyone can test with a single command.

---

## 📊 The Numbers

| Metric | Value |
|---|---|
| Total time | ~21 hours (Mar 12 16:29 → Mar 13 13:16) |
| Commits | **52** |
| Files created/changed | **104** |
| Lines inserted | **+11,397** |
| Lines of code (backend + frontend) | **~3,620** |
| Lines of tests | **~1,243** |
| Code files | **69** |
| AI Skills written | **5** (766 lines) |
| AGENTS.md (architecture instructions) | **356 lines** |

---

## 🧠 How the AI Interaction Worked

I **didn't ask the AI to "create a project"**. I architected everything first:

1. **Created `AGENTS.md`** — a 356-line document defining the hexagonal architecture, coding conventions (FP over OOP, `type` instead of `interface`, discriminated unions, winston logger), folder structure, dependency rules, CSS patterns (BEM), and testing workflow.

2. **Wrote 5 Skills** — specialized `.md` instruction files that the AI learns to execute:
   - **`commit.md`** — how to create descriptive, semantic commits
   - **`update-readme.md`** — keep the README in sync with the code
   - **`http-scenarios.md`** — generate/update `.http` files for each endpoint
   - **`status.md`** — maintain AI usage disclosure in the README
   - **`version.md`** — version bump following SemVer

3. **I set the parameters and the AI executed** — it created the files, followed conventions, wrote tests, and I reviewed and steered.

---

## 🔄 Mid-Course Changes

Not everything was linear. Several decisions changed during the process:

- **Adding React** — I started with plain HTML, but it quickly became clear I needed components. I migrated to React + Vite mid-development.
- **esbuild instead of tsc** — to produce a lightweight artifact that could be used directly with `npx`, I switched the backend build to esbuild. The result is a minified bundle that runs without installing dependencies.
- **Mid-flight refactors** — I renamed modules, changed the web directory structure, and redesigned the UI more than once.

---

## 🤖 Not All AI Is Equal — What I Learned Testing Different Models

This project was a real stress test of different AI models for programming:

- **Claude Sonnet** — the most balanced. Understood the skills, followed `AGENTS.md` conventions, produced consistent code, and was economical with tokens.
- **Claude Opus** — powerful, but devoured all my tokens. For long tasks it was too expensive without a proportional quality gain.
- **Claude Haiku** — couldn't handle complex tasks. Also failed to interpret the skills correctly, reverting to generic patterns.
- **Codex (OpenAI)** — I tested it too, but it didn't understand the skills system. It ignored `AGENTS.md` and generated code outside the defined conventions.

### The Failure Moments

There were **many moments** where the AI started to degrade:

- Context too long → generic responses, ignoring conventions
- I had to **clear context multiple times** — close the session and start a new one
- Sometimes the model "forgot" what had already been done and proposed unnecessary refactors
- More complex skills (like build + deploy) required manual intervention

The lesson: **AI is a tool, not autopilot**. The outcome depends directly on the quality of the instructions and human supervision.

---

## 🚀 What REDITOR Does Today

- **Browser editor** with automatic syntax highlighting (via `prism-code-editor`)
- **Secure by default** — OTP displayed in terminal + JWT RS256
- **Rate limiting** — 3 wrong OTP attempts and the server shuts down
- **HTTPS** with auto-generated certificate
- **Version history** — side drawer with versions saved during the session
- **File creation** — `--create` flag to create non-existent files
- **Zero installation** — runs directly with `npx`

---

## 🧪 Try It Now

No installation needed. Just Node.js ≥ 18:

```bash
# Edit an existing file
npx github:arielpchara/reditor-refactored serve ./any-file.txt

# Create a new file
npx github:arielpchara/reditor-refactored serve ./new.yaml --create

# With a custom port
npx github:arielpchara/reditor-refactored serve ./config.json --port 8080
```

The OTP appears in the terminal. Paste it in the browser. Done.

📦 Repository: [github.com/arielpchara/reditor-refactored](https://github.com/arielpchara/reditor-refactored)

---

## 💡 The Takeaway

In under 24 hours, with the right AI and well-written instructions, it's possible to go from zero to a functional, published product. But the differentiator wasn't the AI — it was knowing **what to ask**, **how to structure**, and **when to intervene**.

The skills and `AGENTS.md` were the real productivity multiplier. AI without direction produces generic code. With well-defined architecture and conventions, it becomes a real extension of your thinking.

---

*52 commits. 69 files. ~3,600 lines of code. ~1,200 lines of tests. 5 skills. 1 AGENTS.md. Under 24 hours.*

#AI #CopilotAgent #CLI #DevTools #NodeJS #React #TypeScript #OpenSource #DeveloperProductivity
