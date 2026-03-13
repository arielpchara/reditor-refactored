import path from 'path';
import { buildProgram } from './adapters/cli/program';
import { startServer } from './adapters/http';
import { generateOtp, generateKeyPair, loadKeyPair, saveKeyPair } from './core/security';
import { loadConfig } from './config';
import { ServeOptions } from './adapters/cli/program';
import { logger, logFilePath } from './adapters/logger';
import { validateFile, createFile } from './core/files';
import { promptCreateFile } from './adapters/cli/promptCreate';

async function main(): Promise<void> {
  const program = buildProgram();
  program.parse(process.argv);

  const serveCmd = program.commands.find((c) => c.name() === 'serve');
  const opts = serveCmd?.opts<ServeOptions>() ?? {
    port: '3000',
    host: 'localhost',
    forceDisableSecurity: false,
    tokenTtl: '300',
    keysDir: '.reditor/keys',
    forceOtp: undefined,
    create: false,
  };

  // ── File validation (must happen before server starts) ─────────────────────
  const rawFile: string | undefined = serveCmd?.args[0];

  if (!rawFile) {
    logger.error('Missing required file path. Usage: reditor serve <file>');
    process.exit(1);
  }

  const absoluteFile = path.resolve(rawFile);
  const validation = validateFile(absoluteFile);

  if (!validation.ok) {
    const { error } = validation;

    if (error.kind === 'NOT_FOUND') {
      if (opts.create) {
        // --create flag: skip prompt, create immediately
        const created = createFile(absoluteFile);
        if (!created.ok) {
          logger.error('Failed to create file', {
            file: absoluteFile,
            error: created.error.message,
          });
          process.exit(1);
        }
        logger.info('File created', { file: absoluteFile });
      } else {
        // No flag: always ask
        const confirmed = await promptCreateFile(absoluteFile);
        if (!confirmed) {
          process.stdout.write('\n  Aborted.\n\n');
          process.exit(0);
        }
        const created = createFile(absoluteFile);
        if (!created.ok) {
          logger.error('Failed to create file', {
            file: absoluteFile,
            error: created.error.message,
          });
          process.exit(1);
        }
        logger.info('File created', { file: absoluteFile });
      }
    } else {
      switch (error.kind) {
        case 'IS_DIRECTORY':
          logger.error('Path points to a directory, not a file', { file: absoluteFile });
          break;
        case 'TOO_LARGE':
          logger.error('File exceeds maximum size for editor', {
            file: absoluteFile,
            sizeBytes: error.sizeBytes,
            maxBytes: error.maxBytes,
          });
          break;
        case 'NOT_TEXT':
          logger.error('File is not readable as text (binary content detected)', {
            file: absoluteFile,
          });
          break;
        case 'READ_ERROR':
          logger.error('Could not read file', { file: absoluteFile, error: error.message });
          break;
        case 'PATH_TRAVERSAL':
          logger.error('Path traversal detected', { file: absoluteFile });
          break;
      }
      process.exit(1);
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  const securityEnabled = !opts.forceDisableSecurity;
  const isForced = securityEnabled && opts.forceOtp !== undefined;
  const otp = securityEnabled ? (opts.forceOtp ?? generateOtp()) : undefined;
  const tokenTtl = Number(opts.tokenTtl);

  if (opts.forceDisableSecurity) {
    logger.warn('--force-disable-security is active: OTP and JWT auth are DISABLED');
    process.stdout.write('\n');
    process.stdout.write('  ⚠️  WARNING: Security is DISABLED via --force-disable-security\n');
    process.stdout.write('     Anyone with network access to this server can read the file.\n');
    process.stdout.write('     Never use this flag in production or on untrusted networks.\n');
    process.stdout.write('\n');
  }

  if (otp) {
    logger.info('OTP generated for session', { forced: isForced });
  }

  let keyPair: { privateKey: string; publicKey: string } | undefined;
  if (securityEnabled) {
    const existing = loadKeyPair(opts.keysDir);
    if (existing) {
      keyPair = existing;
      logger.info('Loaded existing RSA signing keys', { keysDir: opts.keysDir });
    } else {
      keyPair = generateKeyPair();
      saveKeyPair(keyPair, opts.keysDir);
      logger.info('Generated new RSA-2048 signing keys', { keysDir: opts.keysDir });
    }
  }

  const config = loadConfig({
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
    logger.info('Security mode enabled', { tokenTtlSeconds: tokenTtl });
    if (isForced) {
      logger.warn('--force-otp is set; OTP is predictable and should never be used in production');
    }
    process.stdout.write('\n');
    process.stdout.write('  🔐 Security enabled\n');
    process.stdout.write(`  🔑 One-Time Password: ${otp}\n`);
    process.stdout.write(`  ⏱  Token TTL: ${tokenTtl}s\n`);
    process.stdout.write('     POST /auth/exchange-token with { "otp": "<code>" } to get a JWT.\n');
    process.stdout.write('\n');
  }

  logger.info('Starting reditor server', {
    host: config.host,
    port: config.port,
    useTls: config.useTls,
    file: config.file,
    logFilePath,
  });

  await startServer(config);
}

main().catch((err: Error) => {
  logger.error('Failed to start server', { error: err.message, stack: err.stack });
  process.exit(1);
});
