# Skill: update-readme

## Purpose

Maintain `README.md` as the living, human-facing documentation of this project.
Every time you add a feature, change a domain, add a command, or modify a configuration option — **rewrite the relevant README sections** before considering the task done.

---

## When to activate this skill

Activate **automatically** when any of these conditions are met:

- A new domain module is added under `src/core/`
- A new CLI command is added to `src/bin.ts`
- A new HTTP route is added to `src/adapters/http/routes.ts`
- The server configuration changes (`src/config/`)
- A new npm script is added to `package.json`
- The public API exported from `src/index.ts` changes
- The `web/index.html` UI gains or loses a feature
- Any existing behaviour described in the README is changed

---

## How to execute this skill

### Step 1 — Gather context

Before writing, read the following sources to understand the current state of the project:

| Source | What to extract |
|---|---|
| `package.json` | `name`, `version`, `description`, `bin`, `scripts` |
| `src/index.ts` | All public exports (library API) |
| `src/bin.ts` | All CLI commands and their usage |
| `src/adapters/http/routes.ts` | All HTTP endpoints |
| `src/core/**/types.ts` | Domain types (infer domain description from these) |
| `src/config/types.ts` | All configurable environment variables |
| `AGENTS.md` | Architecture pattern and project conventions |

### Step 2 — Rewrite the domain description

The domain description is the first human-readable section of the README.
It must answer: **What does this project do, and for whom?**

Rules:
- Write in plain English, no jargon
- 2–4 sentences maximum
- Derived from the actual domain types and functions in `src/core/`
- If `src/core/` is empty, write: *"No domain implemented yet. Add your first module under `src/core/<domain>/`."*
- Do **not** invent capabilities that don't exist in code

### Step 3 — Rewrite the Features section

For each domain module in `src/core/<domain>/`:
- Name the feature with a `###` heading
- Describe what it does (1–2 sentences)
- Show a real usage example (TypeScript import or CLI command)

If there are no domains yet, omit this section entirely.

### Step 4 — Update the CLI Usage section

Read `src/bin.ts` and document every command with:
- The exact command syntax
- What it does
- Any relevant options or environment variables

### Step 5 — Update the HTTP API section

Read `src/adapters/http/routes.ts` and for each route document:
- Method + path
- Request body (if POST/PUT)
- Response shape
- Error responses

### Step 6 — Update the Configuration section

Read `src/config/types.ts` and list every env var with:
- Variable name
- Type and default value
- Description

### Step 7 — Write/update the README

Apply the template below, replacing only the sections that changed. Do not change sections unrelated to your edit.
Preserve the existing tone and formatting style.

---

## README template

Use this exact structure. Do not add or remove top-level sections unless the project scope changes.

```markdown
# <name from package.json>

> <domain description — 2–4 sentences>

## Features

<!-- One ### per domain module. Omit section if src/core/ is empty. -->

## Installation

\`\`\`bash
npm install
npm run build
\`\`\`

## CLI Usage

\`\`\`bash
npx <bin-name> <command> [options]
\`\`\`

| Command | Description |
|---|---|
<!-- One row per command in src/bin.ts -->

## HTTP API

### `GET /health`
Returns `{ "status": "ok" }` when the server is running.

<!-- One section per route in routes.ts -->

## Configuration

Environment variables (all optional):

| Variable | Default | Description |
|---|---|---|
<!-- One row per field in AppConfig -->

## Development

\`\`\`bash
npm run dev          # start server with live reload
npm test             # run unit tests
npm run test:coverage # tests + coverage report
npm run build        # compile to dist/
npm run format       # auto-format with Prettier
\`\`\`

## Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters).
See [AGENTS.md](./AGENTS.md) for full conventions and contribution guidelines.

\`\`\`
src/
├── core/        # pure domain logic
├── adapters/    # cli + http ports
├── config/      # app configuration
└── bin.ts       # CLI entry point
web/             # browser UI
\`\`\`

## License

<license from package.json>
```

---

## Quality rules

- Every code example in the README must actually work with the current codebase
- Never document a feature that hasn't been implemented yet
- Never leave stale examples from deleted features
- Use `bash` fences for shell commands, `ts` fences for TypeScript
- Keep the README scannable — prefer tables and short sentences over paragraphs
