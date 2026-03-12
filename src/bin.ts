#!/usr/bin/env node

import { buildProgram } from './adapters/cli/program';
import { startServer } from './adapters/http';
import { generateOtp } from './core/security';
import { loadConfig } from './config';

const program = buildProgram();
program.parse(process.argv);

const serveCmd = program.commands.find((c) => c.name() === 'serve');
const opts = serveCmd?.opts<{ port: string; host: string; enableSecurity: boolean }>() ?? {
  port: '3000',
  host: 'localhost',
  enableSecurity: false,
};

const otp = opts.enableSecurity ? generateOtp() : undefined;

const config = loadConfig({
  port: Number(opts.port),
  host: opts.host,
  securityEnabled: opts.enableSecurity,
  otp,
});

if (config.securityEnabled && otp) {
  console.log('');
  console.log('  🔐 Security enabled');
  console.log(`  🔑 One-Time Password: ${otp}`);
  console.log('     Use this code to access the web interface.');
  console.log('');
}

startServer(config).catch((err: Error) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
