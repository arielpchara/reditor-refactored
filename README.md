# reditor

> Edit files from your server in the browser. Run `npx reditor serve` on any machine and access a web-based file editor from any browser — with optional HTTPS and OTP-secured access.

## Features

No domain implemented yet. Add your first module under `src/core/<domain>/`.

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
| `--enable-security` | `false` | Enable HTTPS and generate a one-time password (OTP) for web access |
| `-h, --help` | — | Display help |

### Examples

```bash
# Start with plain HTTP on default port
npx reditor serve

# Start on a custom port
npx reditor serve --port 8080

# Enable HTTPS + OTP
npx reditor serve --enable-security
```

When `--enable-security` is set, the OTP is printed to the console at startup:

```
  🔐 Security enabled
  🔑 One-Time Password: 482910
     Use this code to access the web interface.
```

## HTTP API

### `GET /health`

Returns `{ "status": "ok" }` when the server is running.

```bash
curl https://localhost:3000/health
# → {"status":"ok"}
```

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
npm run test:coverage # tests + coverage report
```

## Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters).
See [AGENTS.md](./AGENTS.md) for full conventions and contribution guidelines.

```
src/
├── core/
│   └── security/  # OTP generation
├── adapters/      # cli + http ports
├── config/        # app configuration
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
| Total AI sessions | 1 |
| Total AI time | 2h 22m |
| AI commits | 4 |
| Models used | Claude Sonnet 4.6 (`claude-sonnet-4.6`) via GitHub Copilot CLI |
| Tokens (input / output) | Not available from the GitHub Copilot CLI interface |
| Last session | 2026-03-12 |

### Session Log

| Date | Model | Duration | Commits | Summary |
|---|---|---|---|---|
| 2026-03-12 | Claude Sonnet 4.6 | 2h 22m | 4 | Full project bootstrap: scaffold, Hexagonal Architecture, Express HTTPS server, CLI with commander.js, `--enable-security` OTP, git hooks, agent skills |

## License

ISC
