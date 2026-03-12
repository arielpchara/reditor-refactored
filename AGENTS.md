# AGENTS.md

Guidelines for AI agents (GitHub Copilot, Claude, ChatGPT, etc.) contributing code to this project.

---

## Skills

Reusable agent skills live in `skills/`. Each skill is a self-contained instruction file that defines a specific responsibility.

| Skill file | Responsibility | When to run |
|---|---|---|
| [`skills/update-readme.md`](./skills/update-readme.md) | Keep `README.md` in sync with the codebase | After every feature, domain change, new command, or API change |
| [`skills/commit.md`](./skills/commit.md) | Create descriptive git commits | After every completed task, before closing work |
| [`skills/status.md`](./skills/status.md) | Maintain the AI & Copilot usage disclosure in `README.md` | After any significant AI-generated contribution |
| [`skills/http-scenarios.md`](./skills/http-scenarios.md) | Write/update `rest/<controller>.http` scenario files | Every time an HTTP endpoint is created, changed, or removed |

**When you finish a task that changes any user-facing behaviour, always run the `update-readme` and `http-scenarios` skills before closing the task. Then run the `commit` skill to commit the work.**

---

## Project Overview

**reditor** — edit files from your server in the browser.

A Node.js CLI tool that spins up a local HTTPS server and exposes a browser-based file editor. Run `npx reditor serve` on any machine and edit its files from any browser, with optional OTP-secured access.

The project follows **Hexagonal Architecture** to enforce a strict separation of concerns.

```
src/
├── core/                        # Domain logic — pure functions, no side effects
│       ├── types.ts             # Domain types only (no logic)
│       ├── operations.ts        # Pure FP functions
│       └── index.ts             # Barrel export
├── adapters/                    # Ports — bridge between core and the outside world
│   ├── cli/                     # CLI port (npx / terminal)
│   │   ├── types.ts
│   │   ├── parser.ts            # parseArgs(argv): CliArgs
│   │   ├── runner.ts            # runCommand(args): string
│   │   └── index.ts
│   └── http/                    # HTTP port (Express + HTTPS server)
│       ├── types.ts
│       ├── handlers.ts          # Express route handlers (one per handler)
│       ├── routes.ts            # registerRoutes(app): void
│       ├── server.ts            # createApp(), startServer(config)
│       └── index.ts
├── config/                      # App configuration
│   ├── types.ts                 # AppConfig type
│   └── index.ts                 # loadConfig(): AppConfig
├── bin.ts                       # CLI entry point (#!/usr/bin/env node)
└── index.ts                     # Public library API (re-exports from core)
web/
└── index.html                   # Browser UI served as static files
```

### Dependency rule (strictly enforced)
```
adapters → core        ✅
core → adapters        ❌ never
adapters → adapters    ❌ never
config → core          ❌ never
bin.ts → adapters      ✅
bin.ts → config        ✅
```

---

## Running the project

| Command | Description |
|---|---|
| `npm run dev` | Start HTTPS server with live reload (nodemon + ts-node) |
| `npm run build` | Compile TypeScript → `dist/` (excludes tests) |
| `npm test` | Run all unit tests |
| `npm run test:coverage` | Tests + coverage report |
| `npm run format` | Auto-format with Prettier |
| `npm run test:coverage` | Tests + coverage report |

### CLI usage (after build)
```bash
node dist/bin.js add 10 5           # → 15
node dist/bin.js divide 10 3        # → 3.333...
node dist/bin.js serve              # → start HTTPS server
npx reditor multiply 3 4            # → 12 (after npm publish)
```

### Server (HTTPS)
- Default: `https://localhost:3000`
- Self-signed cert generated automatically in dev
- Set `USE_TLS=false` for plain HTTP
- Set `CERT_PATH` / `KEY_PATH` to use your own certs
- Set `PORT` / `HOST` to override defaults
- Serves `web/index.html` at `/`
- API endpoints: `GET /health`, `POST /calculate`

---

## Code conventions

### Functional Programming (FP preferred over OOP)

- **Use pure functions** — same input always produces same output, no side effects
- **Use `type`** instead of `interface` everywhere
- **Avoid classes** — use plain functions and data
- Prefer `const` for everything; `let` only when mutation is necessary
- Never use `var`
- Prefer immutable data — avoid mutating arguments

```ts
// ✅ Good — pure function with explicit types
export const add = (a: number, b: number): number => a + b;

// ❌ Bad — class with mutable state
  add(a: number, b: number) { return a + b; }
}
```

### TypeScript

- **Strict mode is on** — no implicit `any`, no unchecked nulls
- Use `type` not `interface`
- Never use `any` — use `unknown` and narrow with type guards
- Do not suppress errors with `@ts-ignore` without an explanatory comment
- Return types must be explicit on all exported functions
- Use discriminated unions for results: `{ ok: true; value: T } | { ok: false; error: string }`

### Logging

- Use **winston** as the project logger (no ad-hoc `console.log` for runtime logging)
- Log important flow events, warnings, and failures — do not be shy about logging when it helps observability
- Include actionable context in logs (endpoint, file path, status, error name/message), but never secrets/tokens

### Single Responsibility

Each file has **one reason to change**:
- `types.ts` — type definitions only, no logic
- `operations.ts` — pure computation only
- `handlers.ts` — HTTP concerns only
- `parser.ts` — argument parsing only
- `runner.ts` — command orchestration only

Do **not** add unrelated logic to an existing file. Create a new file instead.

### Code style (Prettier)

| Rule | Value |
|---|---|
| Semicolons | yes |
| Quotes | single |
| Trailing commas | all |
| Print width | 100 |
| Tab width | 2 spaces |
| Arrow parens | always |

Always run `npm run format` before finishing.

---

## Adding a new domain module

1. Create `src/core/<domain>/types.ts` — types only
2. Create `src/core/<domain>/operations.ts` — pure functions
3. Create `src/core/<domain>/index.ts` — barrel export
4. Create `src/adapters/cli/<domain>.ts` if it has CLI commands
5. Create `src/adapters/http/<domain>Handlers.ts` if it has HTTP endpoints
6. Register new routes in `src/adapters/http/routes.ts`
7. Write tests in `src/__tests__/core/<domain>.test.ts` and `src/__tests__/adapters/`
8. Export from `src/index.ts` if it's part of the public library API

---

## Testing

- Framework: **Jest** with **ts-jest**
- Test files live in `src/__tests__/` mirroring the `src/` structure:

```
src/__tests__/
├── core/
└── adapters/
    ├── cli/
    │   ├── parser.test.ts
    │   └── runner.test.ts
    └── http/
        └── handlers.test.ts
```

- Tests are **excluded** from the production build
- Every exported function must have unit tests
- Test both happy path and error/edge cases

### Test conventions

```ts
describe('functionName', () => {
  it('does X when Y', () => { ... });
  it('throws when Z', () => { ... });
});
```

---

## Dos and Don'ts

**Do:**
- Keep `core/` free of any framework or I/O dependency
- Write tests for every new function
- Run `npm run format` and `npm test` before considering work done
- Use discriminated union result types for operations that can fail
- Export all public API from `src/index.ts`

**Don't:**
- Import from `adapters/` inside `core/`
- Add `"type": "module"` to `package.json` — the project uses CommonJS
- Edit files in `dist/` directly
- Use `require()` directly in `.ts` source files
- Commit failing tests or a broken build
