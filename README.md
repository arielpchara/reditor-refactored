# reditor

> Edit files from your server in the browser. Run `npx reditor serve <file>` on any machine and access a web-based file editor from any browser — with optional HTTPS and OTP-secured access.

## Features

- **HTTPS server** with auto-generated self-signed certificate
- **OTP-secured access** — prints a one-time password at startup
- **JWT authentication** — exchange OTP for a signed RS256 JWT token
- **Configurable token TTL** — default 5 minutes, customisable via CLI
- **Persistent RSA signing keys** — generated once, reused across restarts
- **Winston logging** — structured logs to console and `logs/reditor-<timestamp>.log`

No file-editing UI yet. Add your first module under `src/core/<domain>/`.

## Installation

```bash
npm install
npm run build
```

## CLI Usage

```bash
npx reditor serve <file> [options]
```

| Argument / Option | Default | Description |
|---|---|---|
| `<file>` | **required** | Path to the file to edit in the browser |
| `-p, --port <port>` | `3000` | Port the server listens on |
| `-H, --host <host>` | `localhost` | Host the server binds to |
| `--enable-security` | `false` | Enable HTTPS, OTP, and JWT authentication |
| `--token-ttl <seconds>` | `300` | JWT token time-to-live in seconds |
| `--keys-dir <path>` | `.reditor/keys` | Directory to store RSA signing key pair |
| `--force-otp <otp>` | — | **[TEST ONLY]** Override the generated OTP with a fixed value |
| `-h, --help` | — | Display help |

### Examples

```bash
# Edit a file (plain HTTP)
npx reditor serve ./config/server.conf

# Edit a file on a custom port
npx reditor serve ./config/server.conf --port 8080

# Edit a file with HTTPS + OTP security and 10-minute tokens
npx reditor serve ./config/server.conf --enable-security --token-ttl 600
```

> If `<file>` is omitted or the path does not exist or is a directory, the program prints an error and exits without starting the server.

When `--enable-security` is set, startup output includes:

```
  🔐 Security enabled
  🔑 One-Time Password: 482910
  ⏱  Token TTL: 300s
     POST /auth/exchange-token with { "otp": "<code>" } to get a JWT.
```

## HTTP API

### `GET /health`

Returns `{ "status": "ok" }` when the server is running.

```bash
curl https://localhost:3000/health
# → {"status":"ok"}
```

### `POST /auth/exchange-token` *(requires `--enable-security`)*

Exchange the OTP printed at startup for a signed RS256 JWT token.

**Request:**

```json
{ "otp": "482910" }
```

**Response (200):**

```json
{ "token": "<JWT>", "expiresIn": 300 }
```

**Errors:**

| Status | Reason |
|---|---|
| `401` | Missing or incorrect OTP |
| `403` | Security is not enabled |
| `500` | Signing key not available |

Use the returned `token` as a `Bearer` header for subsequent requests.

### `GET /file`

Returns the raw content of the file configured at startup (`<file>` argument). Requires a valid JWT in the `Authorization` header when `--enable-security` is active.

```bash
# Without security
curl https://localhost:3000/file

# With security
curl https://localhost:3000/file \
  -H "Authorization: Bearer <token>"
```

**Validations:**

| Status | Condition |
|---|---|
| `200` | File is readable, ASCII, within size limit |
| `401` | Security enabled and token missing or invalid |
| `404` | File no longer exists on disk |
| `413` | File exceeds 512 KB (prism-code-editor performance limit) |
| `422` | File contains non-ASCII bytes |
| `500` | Unexpected read error |

> **Why 512 KB?** [prism-code-editor](https://github.com/jonpyt/prism-code-editor) starts to slow down beyond ~1000 LOC on most hardware. 512 KB gives comfortable headroom for that many lines.

## Security

When `--enable-security` is used:

1. An **RSA-2048 key pair** is generated (or loaded if it already exists) from `--keys-dir`.
2. A **6-digit OTP** is generated using `crypto.randomInt` (cryptographically secure).
3. The OTP is only valid for the current process lifetime.
4. Tokens are signed with **RS256** and expire after `--token-ttl` seconds.

## Configuration

Environment variables (all optional — CLI flags take precedence):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `HOST` | `localhost` | Hostname the server binds to |
| `USE_TLS` | `true` | Set to `false` to use plain HTTP (overridden by `--enable-security`) |
| `CERT_PATH` | — | Path to TLS certificate file (PEM). If unset, a self-signed cert is generated |
| `KEY_PATH` | — | Path to TLS private key file (PEM) |

## Development

```bash
npm run dev           # start server with live reload (nodemon + ts-node)
npm test              # run unit tests
npm run test:coverage # tests + coverage report
npm run build         # compile TypeScript → dist/
npm run format        # auto-format with Prettier
npm run typecheck     # TypeScript type-check without emit
```

Runtime logs are written to:

```bash
logs/reditor-<ISO_TIMESTAMP>.log
```

## Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters).
See [AGENTS.md](./AGENTS.md) for full conventions and contribution guidelines.

```
src/
├── core/
│   ├── security/  # OTP generation, RSA key pair, JWT signing
│   └── files/     # file reading, ASCII validation, size validation
├── adapters/      # cli (commander) + http (express) + logger (winston)
├── config/        # app configuration (AppConfig)
└── bin.ts         # CLI entry point (npx)
web/               # browser UI (served as static files)
rest/              # REST Client .http scenario files (one per controller)
logs/              # runtime logs (gitignored)
```

## ⚠️ AI & Copilot Usage

This project was built with the assistance of **GitHub Copilot** and other AI tools.

> **Disclaimer:** AI-generated content may contain errors, security vulnerabilities,
> incorrect logic, or outdated practices. All code, configuration, and documentation
> in this repository should be reviewed and validated by a qualified human developer
> before being used in any production environment.

### AI Session Summary

| Metric | Value |
|---|---|
| Total AI sessions | 2 |
| Total AI time | ~4h |
| AI commits | 6 |
| Models used | Claude Sonnet 4.6 (`claude-sonnet-4.6`) via GitHub Copilot CLI |
| Tokens (input / output) | Not available from the GitHub Copilot CLI interface |
| Last session | 2026-03-12 |

### Session Log

| Date | Model | Duration | Commits | Summary |
|---|---|---|---|---|
| 2026-03-12 | Claude Sonnet 4.6 | 2h 22m | 4 | Full project bootstrap: scaffold, Hexagonal Architecture, Express HTTPS server, CLI with commander.js, `--enable-security` OTP, git hooks, agent skills |
| 2026-03-12 | Claude Sonnet 4.6 | ~1.5h | 2 | Security feature: `POST /auth/exchange-token`, RSA-2048 key pair generation, RS256 JWT signing, `--token-ttl`, `--keys-dir` CLI params, 23 unit tests |

## License

ISC
