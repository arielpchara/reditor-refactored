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

### Scenarios
A DevOps should edit a complex config file, the shell editor sucks, REDITOR came to resolve this providing a web interface safely to edit this file with a fancy interface, and helpful tools.

- is a CLI program
- runs using npx
- runs without clone and build the code
- is published in npm repo
- `npm reditor <filename> [options]`
- when installed should no require internet, only local network

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
├── src/
│   ├── components/              # One directory per React component
│   │   ├── App/                 # App.tsx · App.css · index.ts
│   │   ├── Editor/              # Editor.tsx · Editor.css · index.ts
│   │   ├── OtpDialog/           # OtpDialog.tsx · OtpDialog.css · index.ts
│   │   └── Toolbar/             # Toolbar.tsx · Toolbar.css · index.ts
│   ├── __tests__/               # Vitest tests mirroring src/
│   ├── otpApi.ts                # Pure OTP exchange logic (no UI)
│   ├── main.tsx                 # ReactDOM.createRoot entry point
│   └── style.css                # Global: design tokens, reset, html/body
└── index.html                   # Vite entry point
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

## Web Frontend

The `web/` directory is a standalone **Vite + React** application. Its conventions are independent of the server-side TypeScript rules above.

### Directory structure

```
web/src/
├── components/                # One directory per UI component
│   └── ComponentName/
│       ├── ComponentName.tsx  # component (function declaration)
│       ├── ComponentName.css  # BEM styles (omit if component has no styles)
│       └── index.ts           # barrel — re-exports the component and its types
├── __tests__/
│   ├── components/            # mirrors components/ structure
│   │   └── ComponentName.test.tsx
│   ├── otpApi.test.ts         # pure-function tests (no DOM)
│   └── setup.ts               # jest-dom matchers + afterEach cleanup
├── otpApi.ts                  # pure API utilities — no UI
├── main.tsx                   # entry point — ReactDOM.createRoot
└── style.css                  # global only: design tokens (:root), reset, html/body
```

### Component rules

**Use function declarations, not arrow functions:**

```tsx
// ✅ Good
export function Toolbar({ filename, isDirty }: ToolbarProps): JSX.Element {
  return <div className="toolbar">...</div>;
}

// ❌ Bad
export const Toolbar = (...): JSX.Element => <div />;
```

**`forwardRef` wraps a named inner function:**

```tsx
export const Editor = forwardRef<EditorHandle, EditorProps>(
  function Editor({ language, initialContent, onChange }, ref) { ... },
);
```

**Props type named `<Component>Props`:**

```tsx
// ✅ Good
type ToolbarProps = {
  filename: string;
  isDirty: boolean;
};

export function Toolbar({ filename, isDirty }: ToolbarProps): JSX.Element { ... }

// ❌ Bad — anonymous inline type
export function Toolbar({ filename }: { filename: string }) { ... }
```

**Each component imports its own CSS at the top of the file:**

```tsx
import './Toolbar.css';
```

### CSS — BEM

Each component has its own `.css` file. Classes follow [BEM](https://getbem.com/):

- **Block** — the component root: `.toolbar`
- **Element** — a child inside the block: `.toolbar__filename`, `.toolbar__save`
- **Modifier** — a state or variant: `.toolbar__status--ok`, `.toolbar__status--error`

Rules:

- **Never use `!important`** — fix specificity by restructuring, never by forcing
- All design tokens (colours, spacing, fonts) come from CSS custom properties defined in `style.css`
- One CSS file per component; no cross-component style sharing

```css
/* ✅ Good — BEM, uses design tokens */
.toolbar { display: flex; height: var(--toolbar-height); background: var(--widget__bg); }
.toolbar__filename { flex: 1; }
.toolbar__status--ok { color: var(--color-success-text); }

/* ❌ Bad — !important, non-BEM, hardcoded values */
#toolbar .filename { color: #0f0 !important; }
```

### Testing

- **Vitest** with **jsdom** environment (configured in `web/vite.config.ts`)
- **React Testing Library** (`@testing-library/react`) for component tests
- **Always query by accessible role, label, or text** — never by CSS class or id

```tsx
// ✅ Good — role / label / text queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/enter otp/i);
screen.getByText(/session terminated/i);

// ❌ Bad — couples tests to implementation details
document.querySelector('#otp-submit');
document.querySelector('.otp__submit');
```

### Adding a new component

1. Create `web/src/components/<Name>/`
2. Write `<Name>.tsx` — function declaration, `<Name>Props` type, import `./<Name>.css`
3. Write `<Name>.css` — BEM classes, use `:root` tokens from `style.css`
4. Write `index.ts` — `export { Name } from './<Name>';`
5. Write `web/src/__tests__/components/<Name>.test.tsx` — RTL tests, query by role/label/text

---



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
