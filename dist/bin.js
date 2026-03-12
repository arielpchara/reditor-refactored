#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const program_1 = require("./adapters/cli/program");
const http_1 = require("./adapters/http");
const security_1 = require("./core/security");
const config_1 = require("./config");
const logger_1 = require("./adapters/logger");
const files_1 = require("./core/files");
const program = (0, program_1.buildProgram)();
program.parse(process.argv);
const serveCmd = program.commands.find((c) => c.name() === 'serve');
const opts = serveCmd?.opts() ?? {
    port: '3000',
    host: 'localhost',
    forceDisableSecurity: false,
    tokenTtl: '300',
    keysDir: '.reditor/keys',
    forceOtp: undefined,
};
// ── File validation (must happen before server starts) ─────────────────────
const rawFile = serveCmd?.args[0];
if (!rawFile) {
    logger_1.logger.error('Missing required file path. Usage: reditor serve <file>');
    process.exit(1);
}
const absoluteFile = path_1.default.resolve(rawFile);
const validation = (0, files_1.validateFile)(absoluteFile);
if (!validation.ok) {
    const { error } = validation;
    switch (error.kind) {
        case 'NOT_FOUND':
            logger_1.logger.error('File not found', { file: absoluteFile });
            break;
        case 'IS_DIRECTORY':
            logger_1.logger.error('Path points to a directory, not a file', { file: absoluteFile });
            break;
        case 'TOO_LARGE':
            logger_1.logger.error('File exceeds maximum size for editor', {
                file: absoluteFile,
                sizeBytes: error.sizeBytes,
                maxBytes: error.maxBytes,
            });
            break;
        case 'NOT_TEXT':
            logger_1.logger.error('File is not readable as text (binary content detected)', {
                file: absoluteFile,
            });
            break;
        case 'READ_ERROR':
            logger_1.logger.error('Could not read file', { file: absoluteFile, error: error.message });
            break;
        case 'PATH_TRAVERSAL':
            logger_1.logger.error('Path traversal detected', { file: absoluteFile });
            break;
    }
    process.exit(1);
}
// ──────────────────────────────────────────────────────────────────────────
const securityEnabled = !opts.forceDisableSecurity;
const isForced = securityEnabled && opts.forceOtp !== undefined;
const otp = securityEnabled ? (opts.forceOtp ?? (0, security_1.generateOtp)()) : undefined;
const tokenTtl = Number(opts.tokenTtl);
if (opts.forceDisableSecurity) {
    logger_1.logger.warn('--force-disable-security is active: OTP and JWT auth are DISABLED');
    process.stdout.write('\n');
    process.stdout.write('  ⚠️  WARNING: Security is DISABLED via --force-disable-security\n');
    process.stdout.write('     Anyone with network access to this server can read the file.\n');
    process.stdout.write('     Never use this flag in production or on untrusted networks.\n');
    process.stdout.write('\n');
}
if (otp) {
    logger_1.logger.info('OTP generated for session', { forced: isForced });
}
let keyPair;
if (securityEnabled) {
    const existing = (0, security_1.loadKeyPair)(opts.keysDir);
    if (existing) {
        keyPair = existing;
        logger_1.logger.info('Loaded existing RSA signing keys', { keysDir: opts.keysDir });
    }
    else {
        keyPair = (0, security_1.generateKeyPair)();
        (0, security_1.saveKeyPair)(keyPair, opts.keysDir);
        logger_1.logger.info('Generated new RSA-2048 signing keys', { keysDir: opts.keysDir });
    }
}
const config = (0, config_1.loadConfig)({
    port: Number(opts.port),
    host: opts.host,
    securityEnabled,
    otp,
    tokenTtl,
    keysDir: opts.keysDir,
    jwtPrivateKey: keyPair?.privateKey,
    jwtPublicKey: keyPair?.publicKey,
    file: absoluteFile,
});
if (config.securityEnabled && otp) {
    logger_1.logger.info('Security mode enabled', { tokenTtlSeconds: tokenTtl });
    if (isForced) {
        logger_1.logger.warn('--force-otp is set; OTP is predictable and should never be used in production');
    }
    process.stdout.write('\n');
    process.stdout.write('  🔐 Security enabled\n');
    process.stdout.write(`  🔑 One-Time Password: ${otp}\n`);
    process.stdout.write(`  ⏱  Token TTL: ${tokenTtl}s\n`);
    process.stdout.write('     POST /auth/exchange-token with { "otp": "<code>" } to get a JWT.\n');
    process.stdout.write('\n');
}
logger_1.logger.info('Starting reditor server', {
    host: config.host,
    port: config.port,
    useTls: config.useTls,
    file: config.file,
    logFilePath: logger_1.logFilePath,
});
(0, http_1.startServer)(config).catch((err) => {
    logger_1.logger.error('Failed to start server', { error: err.message, stack: err.stack });
    process.exit(1);
});
//# sourceMappingURL=bin.js.map