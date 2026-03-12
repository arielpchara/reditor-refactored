# reditor

> Edit files from your server in the browser. Run `npx reditor serve` on any machine and access a web-based file editor from any browser — with optional HTTPS and OTP-secured access.

## Features

- **HTTPS server** with auto-generated self-signed certificate
- **OTP-secured access** — prints a one-time password at startup
- **JWT authentication** — exchange OTP for a signed RS256 JWT token
- **Configurable token TTL** — default 5 minutes, customisable via CLI
- **Persistent RSA signing keys** — generated once, reused across restarts

No file-editing UI yet. Add your first module under `src/core/<domain>/`.

## Installation

```bash
npm install
npm run build
```

## CLI Usage

```bash
npx reditor serve [options]
```

| Option | Default | Description |
|---|---|---|
| `-p, --port <port>` | `3000` | Port the server listens on |
| `-H, --host <host>` | `localhost` | Host the server binds to |
| `--enable-security` | `false` | Enable HTTPS, OTP, and JWT authentication |
| `--token-ttl <seconds>` | `300` | JWT token time-to-live in seconds |
| `--keys-dir <path>` | `.reditor/keys` | Directory to store RSA signing key pair |
| `-h, --help` | — | Display help |

### Examples

```bash
# Start with plain HTTP on default port
npx reditor serve

# Start on a custom port
npx reditor serve --port 8080

# Enable HTTPS + OTP + JWT with 10-minute tokens
npx reditor serve --enable-security --token-ttl 600
```

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

## Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters).
See [AGENTS.md](./AGENTS.md) for full conventions and contribution guidelines.

```
src/
├── core/
│   └── security/  # OTP generation, RSA key pair, JWT signing
├── adapters/      # cli (commander) + http (express)
├── config/        # app configuration (AppConfig)
└── bin.ts         # CLI entry point (npx)
web/               # browser UI (served as static files)
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
