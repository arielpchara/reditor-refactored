#!/usr/bin/env node

import { buildProgram } from './adapters/cli/program';
import { startServer } from './adapters/http';
import { generateOtp, loadOrGenerateKeyPair } from './core/security';
import { loadConfig } from './config';
import { ServeOptions } from './adapters/cli/program';

const program = buildProgram();
program.parse(process.argv);

const serveCmd = program.commands.find((c) => c.name() === 'serve');
const opts = serveCmd?.opts<ServeOptions>() ?? {
  port: '3000',
  host: 'localhost',
  enableSecurity: false,
  tokenTtl: '300',
  keysDir: '.reditor/keys',
  forceOtp: undefined,
};

const isForced = opts.enableSecurity && opts.forceOtp !== undefined;
const otp = opts.enableSecurity ? (opts.forceOtp ?? generateOtp()) : undefined;
const tokenTtl = Number(opts.tokenTtl);

const keyPair = opts.enableSecurity ? loadOrGenerateKeyPair(opts.keysDir) : undefined;

const config = loadConfig({
  port: Number(opts.port),
  host: opts.host,
  securityEnabled: opts.enableSecurity,
  otp,
  tokenTtl,
  keysDir: opts.keysDir,
  jwtPrivateKey: keyPair?.privateKey,
  jwtPublicKey: keyPair?.publicKey,
});

if (config.securityEnabled && otp) {
  console.log('');
  if (isForced) {
    console.log(
      '  ⚠️  WARNING: --force-otp is set — OTP is predictable. Do NOT use in production!',
    );
  }
  console.log('  🔐 Security enabled');
  console.log(`  🔑 One-Time Password: ${otp}`);
  console.log(`  ⏱  Token TTL: ${tokenTtl}s`);
  console.log('     POST /auth/exchange-token with { "otp": "<code>" } to get a JWT.');
  console.log('');
}

startServer(config).catch((err: Error) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
