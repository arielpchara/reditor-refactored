# Skill: status

## Purpose

Maintain two things in the repository:
1. **`ai-sessions.json`** — a machine-readable log of every AI session
2. **The AI & Copilot Usage section in `README.md`** — a human-readable summary
   with disclosure, metrics, and per-area authorship status

---

## When to activate this skill

Activate at the **end of every AI session** (before the final commit), or when:
- A new AI session starts and the previous one wasn't logged
- The LLM being used changes mid-session
- A human reviewer asks for an up-to-date usage report

---

## How to execute this skill

### Step 1 — Gather session data

Collect the following information:

| Field | How to get it |
|---|---|
| `date` | Today's date (`date -I`) |
| `llm` | The model currently in use (ask the AI agent itself: "which model are you?") |
| `session_start` | Timestamp of the first commit in this session (`git log --reverse --format="%ai" \| head -1`) |
| `session_end` | Timestamp of the latest commit (`git log -1 --format="%ai"`) |
| `duration_minutes` | Difference between start and end in minutes |
| `commits` | All commit SHAs with `Co-authored-by: Copilot` in this session |
| `tokens_input` | Total input tokens if exposed by the AI tool; otherwise `null` |
| `tokens_output` | Total output tokens if exposed by the AI tool; otherwise `null` |
| `summary` | One sentence describing what was built this session |

> Token counts are **not always available** from the AI tool interface.
> Record them when known; set to `null` otherwise and note "Not available from this interface".

### Step 2 — Update `ai-sessions.json`

Append a new entry to the sessions array:

```json
{
  "date": "YYYY-MM-DD",
  "llm": "<model name and ID>",
  "session_start": "YYYY-MM-DDTHH:MM:SS",
  "session_end": "YYYY-MM-DDTHH:MM:SS",
  "duration_minutes": 0,
  "tokens_input": null,
  "tokens_output": null,
  "commits": ["<sha1>", "<sha2>"],
  "summary": "<one sentence>"
}
```

### Step 3 — Compute cumulative stats

From `ai-sessions.json` calculate:
- **Total sessions** — count of entries
- **Total duration** — sum of all `duration_minutes`
- **Total commits** — count of all commits across all sessions
- **Models used** — unique list of `llm` values
- **Total tokens** — sum of known tokens; note "partial" if any sessions have `null`

### Step 4 — Update the README section

Replace the full **⚠️ AI & Copilot Usage** section with this template:

```markdown
## ⚠️ AI & Copilot Usage

This project was built with the assistance of **GitHub Copilot** and other AI tools.

> **Disclaimer:** AI-generated content may contain errors, security vulnerabilities,
> incorrect logic, or outdated practices. All code, configuration, and documentation
> in this repository should be reviewed and validated by a qualified human developer
> before being used in any production environment.

### AI Session Summary

| Metric | Value |
|---|---|
| Total AI sessions | N |
| Total AI time | Xh Ym |
| AI commits | N |
| Models used | list |
| Tokens (input / output) | X / Y — or "Not available from this interface" |
| Last session | YYYY-MM-DD |

### Session Log

| Date | Model | Duration | Commits | Summary |
|---|---|---|---|---|
| YYYY-MM-DD | model | Xm | N | summary |

### Codebase Authorship

| Area | Status |
|---|---|
| ... | 🤖 / 👤 / 🔀 / ✅ |

### Status icons

| Icon | Meaning |
|---|---|
| 🤖 AI-generated | Written entirely by an AI agent |
| 👤 Human-written | Written entirely by a human |
| 🔀 Mixed | Combination of AI and human authorship |
| ✅ Human-reviewed | AI-generated but reviewed and approved by a human |
```

---

## Quality rules

- Never remove this section once added
- Keep the disclaimer verbatim — never soften it
- Token counts: always be honest — `null` is better than a guess
- Update authorship table on every significant AI contribution
- `ai-sessions.json` is the source of truth — README is derived from it
