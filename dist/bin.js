#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/bin.ts
var import_path8 = __toESM(require("path"));

// src/adapters/cli/program.ts
var import_commander = require("commander");
var buildProgram = () => {
  const program2 = new import_commander.Command();
  program2.name("reditor").description("Edit files from your server in the browser.");
  program2.command("serve", { isDefault: true }).description("Start the web server").argument("[file]", "Path to the file to edit in the browser").option("-p, --port <port>", "Port to listen on", "3000").option("-H, --host <host>", "Host to bind to", "localhost").option(
    "--force-disable-security",
    "[DANGER] Disable OTP and JWT auth \u2014 anyone on the network can access the file",
    false
  ).option("--token-ttl <seconds>", "JWT token time-to-live in seconds", "300").option("--keys-dir <path>", "Directory to store RSA signing keys", ".reditor/keys").option("--force-otp <otp>", "[TEST ONLY] Override the generated OTP with a fixed value").action(() => {
  });
  return program2;
};

// src/adapters/http/server.ts
var import_express = __toESM(require("express"));
var import_https = __toESM(require("https"));
var import_http = __toESM(require("http"));
var import_path6 = __toESM(require("path"));
var import_fs6 = __toESM(require("fs"));
var import_selfsigned = __toESM(require("selfsigned"));

// src/adapters/logger/logger.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_winston = __toESM(require("winston"));
var LOG_DIR = import_path.default.resolve(process.cwd(), "logs");
import_fs.default.mkdirSync(LOG_DIR, { recursive: true });
var LOG_FILE_ID = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
var logFilePath = import_path.default.join(LOG_DIR, `reditor-${LOG_FILE_ID}.log`);
var consoleFormat = import_winston.default.format.combine(
  import_winston.default.format.colorize(),
  import_winston.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  import_winston.default.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaSuffix = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level}]: ${message}${metaSuffix}`;
  })
);
var logger = import_winston.default.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  transports: [
    new import_winston.default.transports.Console({
      format: consoleFormat
    }),
    new import_winston.default.transports.File({
      filename: logFilePath,
      format: import_winston.default.format.combine(import_winston.default.format.timestamp(), import_winston.default.format.json())
    })
  ]
});

// src/adapters/http/handlers.ts
var makeHealthHandler = (config2) => {
  return (_req, res) => {
    logger.debug("Health check requested");
    res.json({ status: "ok", securityEnabled: config2.securityEnabled });
  };
};

// src/core/security/jwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var createToken = (privateKey, ttlSeconds) => {
  const now = Math.floor(Date.now() / 1e3);
  const payload = {
    sub: "reditor",
    iat: now,
    exp: now + ttlSeconds
  };
  return import_jsonwebtoken.default.sign(payload, privateKey, { algorithm: "RS256" });
};
var verifyToken = (token, publicKey) => {
  try {
    const payload = import_jsonwebtoken.default.verify(token, publicKey, { algorithms: ["RS256"] });
    return { ok: true, token, expiresIn: payload.exp - payload.iat };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};
var buildTokenResult = (keys, ttlSeconds) => ({
  token: createToken(keys.privateKey, ttlSeconds),
  expiresIn: ttlSeconds
});

// src/adapters/http/authHandlers.ts
var MAX_OTP_ATTEMPTS = 3;
var makeExchangeTokenHandler = (config2, deps = {}) => {
  const exit = deps.exit ?? ((code) => process.exit(code));
  let failedAttempts = 0;
  return (req, res) => {
    if (!config2.securityEnabled || !config2.otp) {
      logger.warn("Token exchange rejected because security is disabled");
      res.status(403).json({ error: "Security is not enabled" });
      return;
    }
    const { otp: otp2 } = req.body;
    if (!otp2 || otp2 !== config2.otp) {
      failedAttempts += 1;
      const remaining = MAX_OTP_ATTEMPTS - failedAttempts;
      logger.warn("Token exchange rejected due to invalid OTP", {
        hasOtp: Boolean(otp2),
        ip: req.ip,
        failedAttempts,
        remaining
      });
      if (failedAttempts >= MAX_OTP_ATTEMPTS) {
        logger.error(
          `OTP max attempts (${MAX_OTP_ATTEMPTS}) exceeded \u2014 shutting down for security`,
          { ip: req.ip }
        );
        res.status(401).json({ error: "Invalid OTP. Maximum attempts exceeded \u2014 server is shutting down." });
        setTimeout(() => exit(1), 200);
        return;
      }
      res.status(401).json({ error: "Invalid OTP", attemptsLeft: remaining });
      return;
    }
    if (!config2.jwtPrivateKey) {
      logger.error("Token exchange failed: signing key not available");
      res.status(500).json({ error: "Signing key not available" });
      return;
    }
    const result = buildTokenResult(
      { privateKey: config2.jwtPrivateKey, publicKey: config2.jwtPublicKey ?? "" },
      config2.tokenTtl
    );
    logger.info("Token exchange succeeded", { ip: req.ip, ttlSeconds: config2.tokenTtl });
    res.json(result);
  };
};

// src/adapters/http/fileHandlers.ts
var import_path4 = __toESM(require("path"));

// src/core/files/reader.ts
var import_fs3 = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));

// src/core/files/types.ts
var MAX_FILE_SIZE_BYTES = 524288;

// src/core/files/validator.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var isTextBuffer = (buf) => {
  if (buf.includes(0)) return false;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buf);
    return true;
  } catch {
    return false;
  }
};
var isWithinRoot = (rootDir, resolvedFilePath) => {
  const normalRoot = import_path2.default.resolve(rootDir) + import_path2.default.sep;
  const normalFile = import_path2.default.resolve(resolvedFilePath);
  return normalFile.startsWith(normalRoot) || normalFile === import_path2.default.resolve(rootDir);
};
var isWithinSizeLimit = (sizeBytes, maxBytes = MAX_FILE_SIZE_BYTES) => sizeBytes <= maxBytes;
var validateFile = (absolutePath) => {
  if (!import_fs2.default.existsSync(absolutePath)) {
    return { ok: false, error: { kind: "NOT_FOUND", path: absolutePath } };
  }
  const stat = import_fs2.default.statSync(absolutePath);
  if (stat.isDirectory()) {
    return { ok: false, error: { kind: "IS_DIRECTORY", path: absolutePath } };
  }
  if (!isWithinSizeLimit(stat.size)) {
    return {
      ok: false,
      error: {
        kind: "TOO_LARGE",
        path: absolutePath,
        sizeBytes: stat.size,
        maxBytes: MAX_FILE_SIZE_BYTES
      }
    };
  }
  let buf;
  try {
    buf = import_fs2.default.readFileSync(absolutePath);
  } catch (e) {
    return {
      ok: false,
      error: { kind: "READ_ERROR", path: absolutePath, message: e.message }
    };
  }
  if (!isTextBuffer(buf)) {
    return { ok: false, error: { kind: "NOT_TEXT", path: absolutePath } };
  }
  return { ok: true };
};

// src/core/files/reader.ts
var readFile = (rootDir, relativePath) => {
  const resolvedPath = import_path3.default.resolve(rootDir, relativePath);
  if (!isWithinRoot(rootDir, resolvedPath)) {
    return { ok: false, error: { kind: "PATH_TRAVERSAL", path: relativePath } };
  }
  if (!import_fs3.default.existsSync(resolvedPath)) {
    return { ok: false, error: { kind: "NOT_FOUND", path: relativePath } };
  }
  const stat = import_fs3.default.statSync(resolvedPath);
  if (stat.isDirectory()) {
    return { ok: false, error: { kind: "IS_DIRECTORY", path: relativePath } };
  }
  if (!isWithinSizeLimit(stat.size)) {
    return {
      ok: false,
      error: {
        kind: "TOO_LARGE",
        path: relativePath,
        sizeBytes: stat.size,
        maxBytes: MAX_FILE_SIZE_BYTES
      }
    };
  }
  let buf;
  try {
    buf = import_fs3.default.readFileSync(resolvedPath);
  } catch (e) {
    return {
      ok: false,
      error: { kind: "READ_ERROR", path: relativePath, message: e.message }
    };
  }
  if (!isTextBuffer(buf)) {
    return { ok: false, error: { kind: "NOT_TEXT", path: relativePath } };
  }
  return {
    ok: true,
    file: { path: relativePath, content: buf.toString("utf8"), sizeBytes: stat.size }
  };
};

// src/core/files/writer.ts
var import_fs4 = __toESM(require("fs"));
var writeFile = (absolutePath, content) => {
  const sizeBytes = Buffer.byteLength(content, "utf8");
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: { kind: "TOO_LARGE", path: absolutePath, sizeBytes, maxBytes: MAX_FILE_SIZE_BYTES }
    };
  }
  try {
    import_fs4.default.writeFileSync(absolutePath, content, "utf8");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: { kind: "WRITE_ERROR", path: absolutePath, message: e.message }
    };
  }
};

// src/adapters/http/fileHandlers.ts
var makeFileHandler = (config2) => {
  return (_req, res) => {
    const result = readFile(import_path4.default.dirname(config2.file), import_path4.default.basename(config2.file));
    if (!result.ok) {
      const { error } = result;
      switch (error.kind) {
        case "NOT_FOUND":
          logger.warn("Configured file not found when handling /file request", {
            file: error.path
          });
          res.status(404).json({ error: `File not found: ${error.path}` });
          return;
        case "NOT_TEXT":
          logger.warn("Configured file is not readable as text", { file: error.path });
          res.status(422).json({ error: "File is not readable as text" });
          return;
        case "TOO_LARGE":
          logger.warn("Configured file exceeds size limit", {
            file: error.path,
            sizeBytes: error.sizeBytes,
            maxBytes: error.maxBytes
          });
          res.status(413).json({
            error: `File too large for editor (${error.sizeBytes} bytes, max ${error.maxBytes} bytes)`
          });
          return;
        case "IS_DIRECTORY":
          logger.warn("Configured file path is a directory", { file: error.path });
          res.status(422).json({ error: "Path points to a directory, not a file" });
          return;
        case "READ_ERROR":
          logger.error("Failed to read configured file", {
            file: error.path,
            error: error.message
          });
          res.status(500).json({ error: `Could not read file: ${error.message}` });
          return;
        case "PATH_TRAVERSAL":
          logger.error("Path traversal detected for configured file", { file: error.path });
          res.status(500).json({ error: "Internal configuration error" });
          return;
      }
    }
    logger.info("Served configured file content", {
      file: config2.file,
      sizeBytes: result.file.sizeBytes
    });
    res.type("text/plain").send(result.file.content);
  };
};

// src/adapters/http/fileSaveHandler.ts
var makeFileSaveHandler = (config2) => {
  return (req, res) => {
    const { content } = req.body;
    if (typeof content !== "string") {
      res.status(400).json({ error: 'Request body must contain a "content" string field' });
      return;
    }
    const result = writeFile(config2.file, content);
    if (!result.ok) {
      const { error } = result;
      switch (error.kind) {
        case "TOO_LARGE":
          logger.warn("Save rejected: content exceeds size limit", {
            file: config2.file,
            sizeBytes: error.sizeBytes,
            maxBytes: error.maxBytes
          });
          res.status(413).json({
            error: `Content too large (${error.sizeBytes} bytes, max ${error.maxBytes} bytes)`
          });
          return;
        case "WRITE_ERROR":
          logger.error("Failed to write file", { file: config2.file, error: error.message });
          res.status(500).json({ error: `Could not write file: ${error.message}` });
          return;
      }
    }
    logger.info("File saved successfully", {
      file: config2.file,
      sizeBytes: Buffer.byteLength(content, "utf8")
    });
    res.status(204).send();
  };
};

// src/adapters/http/fileMetaHandler.ts
var import_fs5 = __toESM(require("fs"));
var import_path5 = __toESM(require("path"));
var MIME_MAP = {
  ts: "text/typescript",
  tsx: "text/tsx",
  js: "text/javascript",
  jsx: "text/jsx",
  mjs: "text/javascript",
  cjs: "text/javascript",
  json: "application/json",
  html: "text/html",
  xml: "text/xml",
  svg: "image/svg+xml",
  css: "text/css",
  scss: "text/x-scss",
  sh: "text/x-shellscript",
  bash: "text/x-shellscript",
  zsh: "text/x-shellscript",
  yml: "text/yaml",
  yaml: "text/yaml",
  md: "text/markdown",
  mdx: "text/mdx",
  py: "text/x-python",
  rs: "text/x-rust",
  go: "text/x-go",
  sql: "text/x-sql",
  txt: "text/plain",
  env: "text/plain",
  toml: "text/x-toml",
  ini: "text/x-ini",
  conf: "text/plain"
};
var getMimeType = (filepath) => {
  const ext = import_path5.default.extname(filepath).replace(".", "").toLowerCase();
  return MIME_MAP[ext] ?? "text/plain";
};
var detectShebang = (filepath) => {
  try {
    const fd = import_fs5.default.openSync(filepath, "r");
    const buf = Buffer.alloc(2);
    const bytesRead = import_fs5.default.readSync(fd, buf, 0, 2, 0);
    import_fs5.default.closeSync(fd);
    return bytesRead === 2 && buf[0] === 35 && buf[1] === 33;
  } catch {
    return false;
  }
};
var makeFileMetaHandler = (config2) => {
  return (_req, res) => {
    const fullpath = import_path5.default.resolve(config2.file);
    const filename = import_path5.default.basename(fullpath);
    let size = 0;
    try {
      size = import_fs5.default.statSync(fullpath).size;
    } catch {
    }
    const type = getMimeType(fullpath);
    const hasShebang = detectShebang(fullpath);
    logger.debug("Served file metadata", { filename, fullpath, size, type, hasShebang });
    res.json({ filename, fullpath, size, type, hasShebang });
  };
};

// src/adapters/http/authMiddleware.ts
var makeAuthMiddleware = (config2) => (req, res, next) => {
  if (!config2.securityEnabled) {
    next();
    return;
  }
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    logger.warn("Request blocked: missing or malformed Authorization header", {
      path: req.path,
      ip: req.ip
    });
    res.status(401).json({ error: "Authorization header missing or malformed" });
    return;
  }
  const token = authHeader.slice(7);
  const result = verifyToken(token, config2.jwtPublicKey ?? "");
  if (!result.ok) {
    logger.warn("Request blocked: invalid or expired JWT token", {
      path: req.path,
      ip: req.ip
    });
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  logger.debug("Request authorized via JWT", { path: req.path, ip: req.ip });
  next();
};

// src/adapters/http/routes.ts
var registerRoutes = (app, config2) => {
  app.get("/health", makeHealthHandler(config2));
  logger.info("Registered route: GET /health");
  if (config2.securityEnabled) {
    app.post("/auth/exchange-token", makeExchangeTokenHandler(config2));
    logger.info("Registered route: POST /auth/exchange-token (security enabled)");
  }
  const auth = makeAuthMiddleware(config2);
  app.get("/file-meta", auth, makeFileMetaHandler(config2));
  logger.info("Registered route: GET /file-meta", { authRequired: config2.securityEnabled });
  app.get("/file", auth, makeFileHandler(config2));
  logger.info("Registered route: GET /file", {
    authRequired: config2.securityEnabled,
    file: config2.file
  });
  app.put("/file", auth, makeFileSaveHandler(config2));
  logger.info("Registered route: PUT /file", { authRequired: config2.securityEnabled });
};

// src/adapters/http/server.ts
var createApp = (config2) => {
  logger.info("Initialising Express app", { useTls: config2.useTls, file: config2.file });
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  const webDir = __filename.endsWith(".ts") ? import_path6.default.resolve(process.cwd(), "dist/web") : import_path6.default.resolve(__dirname, "../../web");
  app.use(import_express.default.static(webDir));
  app.use((req, _res, next) => {
    logger.info("Incoming request", { method: req.method, path: req.path, ip: req.ip });
    next();
  });
  registerRoutes(app, config2);
  return app;
};
var resolveTlsOptions = async (config2) => {
  if (config2.certPath && config2.keyPath) {
    logger.info("Using configured TLS certificate and key", {
      certPath: config2.certPath,
      keyPath: config2.keyPath
    });
    return {
      cert: import_fs6.default.readFileSync(config2.certPath, "utf8"),
      key: import_fs6.default.readFileSync(config2.keyPath, "utf8")
    };
  }
  logger.info("No TLS cert configured; generating self-signed certificate for development");
  const attrs = [{ name: "commonName", value: config2.host }];
  const pems = await import_selfsigned.default.generate(attrs, { algorithm: "sha256" });
  return { key: pems.private, cert: pems.cert };
};
var startServer = (config2) => new Promise((resolve, reject) => {
  const app = createApp(config2);
  if (config2.useTls) {
    resolveTlsOptions(config2).then((tlsOptions) => {
      const server = import_https.default.createServer(tlsOptions, app);
      server.listen(config2.port, config2.host, () => {
        logger.info("Server listening", {
          protocol: "https",
          host: config2.host,
          port: config2.port
        });
        resolve(server);
      });
      server.on("error", reject);
    }).catch((err) => {
      logger.error("Failed to resolve TLS options", { error: err.message, stack: err.stack });
      reject(err);
    });
  } else {
    const server = import_http.default.createServer(app);
    server.listen(config2.port, config2.host, () => {
      logger.info("Server listening", {
        protocol: "http",
        host: config2.host,
        port: config2.port
      });
      resolve(server);
    });
    server.on("error", reject);
  }
});

// src/core/security/otp.ts
var import_crypto = require("crypto");
var generateOtp = () => String((0, import_crypto.randomInt)(1e5, 999999));

// src/core/security/keys.ts
var import_crypto2 = require("crypto");
var import_fs7 = __toESM(require("fs"));
var import_path7 = __toESM(require("path"));
var PRIVATE_KEY_FILE = "private.pem";
var PUBLIC_KEY_FILE = "public.pem";
var generateKeyPair = () => {
  const { privateKey, publicKey } = (0, import_crypto2.generateKeyPairSync)("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" }
  });
  return { privateKey, publicKey };
};
var saveKeyPair = (keyPair2, keysDir) => {
  import_fs7.default.mkdirSync(keysDir, { recursive: true });
  import_fs7.default.writeFileSync(import_path7.default.join(keysDir, PRIVATE_KEY_FILE), keyPair2.privateKey, { mode: 384 });
  import_fs7.default.writeFileSync(import_path7.default.join(keysDir, PUBLIC_KEY_FILE), keyPair2.publicKey, { mode: 420 });
};
var loadKeyPair = (keysDir) => {
  const privatePath = import_path7.default.join(keysDir, PRIVATE_KEY_FILE);
  const publicPath = import_path7.default.join(keysDir, PUBLIC_KEY_FILE);
  if (!import_fs7.default.existsSync(privatePath) || !import_fs7.default.existsSync(publicPath)) return void 0;
  return {
    privateKey: import_fs7.default.readFileSync(privatePath, "utf8"),
    publicKey: import_fs7.default.readFileSync(publicPath, "utf8")
  };
};

// src/config/index.ts
var loadConfig = (overrides = {}) => ({
  port: overrides.port ?? Number(process.env.PORT ?? 3e3),
  host: overrides.host ?? process.env.HOST ?? "localhost",
  securityEnabled: overrides.securityEnabled ?? true,
  useTls: overrides.securityEnabled ?? process.env.USE_TLS !== "false",
  certPath: process.env.CERT_PATH,
  keyPath: process.env.KEY_PATH,
  otp: overrides.otp,
  tokenTtl: overrides.tokenTtl ?? 300,
  keysDir: overrides.keysDir ?? ".reditor/keys",
  jwtPrivateKey: overrides.jwtPrivateKey,
  jwtPublicKey: overrides.jwtPublicKey,
  file: overrides.file ?? ""
});

// src/bin.ts
var program = buildProgram();
program.parse(process.argv);
var serveCmd = program.commands.find((c) => c.name() === "serve");
var opts = serveCmd?.opts() ?? {
  port: "3000",
  host: "localhost",
  forceDisableSecurity: false,
  tokenTtl: "300",
  keysDir: ".reditor/keys",
  forceOtp: void 0
};
var rawFile = serveCmd?.args[0];
if (!rawFile) {
  logger.error("Missing required file path. Usage: reditor serve <file>");
  process.exit(1);
}
var absoluteFile = import_path8.default.resolve(rawFile);
var validation = validateFile(absoluteFile);
if (!validation.ok) {
  const { error } = validation;
  switch (error.kind) {
    case "NOT_FOUND":
      logger.error("File not found", { file: absoluteFile });
      break;
    case "IS_DIRECTORY":
      logger.error("Path points to a directory, not a file", { file: absoluteFile });
      break;
    case "TOO_LARGE":
      logger.error("File exceeds maximum size for editor", {
        file: absoluteFile,
        sizeBytes: error.sizeBytes,
        maxBytes: error.maxBytes
      });
      break;
    case "NOT_TEXT":
      logger.error("File is not readable as text (binary content detected)", {
        file: absoluteFile
      });
      break;
    case "READ_ERROR":
      logger.error("Could not read file", { file: absoluteFile, error: error.message });
      break;
    case "PATH_TRAVERSAL":
      logger.error("Path traversal detected", { file: absoluteFile });
      break;
  }
  process.exit(1);
}
var securityEnabled = !opts.forceDisableSecurity;
var isForced = securityEnabled && opts.forceOtp !== void 0;
var otp = securityEnabled ? opts.forceOtp ?? generateOtp() : void 0;
var tokenTtl = Number(opts.tokenTtl);
if (opts.forceDisableSecurity) {
  logger.warn("--force-disable-security is active: OTP and JWT auth are DISABLED");
  process.stdout.write("\n");
  process.stdout.write("  \u26A0\uFE0F  WARNING: Security is DISABLED via --force-disable-security\n");
  process.stdout.write("     Anyone with network access to this server can read the file.\n");
  process.stdout.write("     Never use this flag in production or on untrusted networks.\n");
  process.stdout.write("\n");
}
if (otp) {
  logger.info("OTP generated for session", { forced: isForced });
}
var keyPair;
if (securityEnabled) {
  const existing = loadKeyPair(opts.keysDir);
  if (existing) {
    keyPair = existing;
    logger.info("Loaded existing RSA signing keys", { keysDir: opts.keysDir });
  } else {
    keyPair = generateKeyPair();
    saveKeyPair(keyPair, opts.keysDir);
    logger.info("Generated new RSA-2048 signing keys", { keysDir: opts.keysDir });
  }
}
var config = loadConfig({
  port: Number(opts.port),
  host: opts.host,
  securityEnabled,
  otp,
  tokenTtl,
  keysDir: opts.keysDir,
  jwtPrivateKey: keyPair?.privateKey,
  jwtPublicKey: keyPair?.publicKey,
  file: absoluteFile
});
if (config.securityEnabled && otp) {
  logger.info("Security mode enabled", { tokenTtlSeconds: tokenTtl });
  if (isForced) {
    logger.warn("--force-otp is set; OTP is predictable and should never be used in production");
  }
  process.stdout.write("\n");
  process.stdout.write("  \u{1F510} Security enabled\n");
  process.stdout.write(`  \u{1F511} One-Time Password: ${otp}
`);
  process.stdout.write(`  \u23F1  Token TTL: ${tokenTtl}s
`);
  process.stdout.write('     POST /auth/exchange-token with { "otp": "<code>" } to get a JWT.\n');
  process.stdout.write("\n");
}
logger.info("Starting reditor server", {
  host: config.host,
  port: config.port,
  useTls: config.useTls,
  file: config.file,
  logFilePath
});
startServer(config).catch((err) => {
  logger.error("Failed to start server", { error: err.message, stack: err.stack });
  process.exit(1);
});
