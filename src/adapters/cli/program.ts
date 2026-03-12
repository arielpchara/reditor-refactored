import { Command } from 'commander';

export type ServeOptions = {
  port: string;
  host: string;
  enableSecurity: boolean;
  tokenTtl: string;
  keysDir: string;
};

export const buildProgram = (): Command => {
  const program = new Command();

  program.name('reditor').description('Edit files from your server in the browser.');

  program
    .command('serve', { isDefault: true })
    .description('Start the web server')
    .option('-p, --port <port>', 'Port to listen on', '3000')
    .option('-H, --host <host>', 'Host to bind to', 'localhost')
    .option(
      '--enable-security',
      'Enable HTTPS and generate a one-time password (OTP) for web access',
      false,
    )
    .option('--token-ttl <seconds>', 'JWT token time-to-live in seconds', '300')
    .option('--keys-dir <path>', 'Directory to store RSA signing keys', '.reditor/keys')
    .action(() => {
      // action is handled in bin.ts to keep this file pure/testable
    });

  return program;
};

export const parseServeOptions = (argv: string[]): ServeOptions => {
  const program = buildProgram();
  program.parse(argv);
  const cmd = program.commands.find((c) => c.name() === 'serve');
  const opts = cmd?.opts<ServeOptions>() ?? {
    port: '3000',
    host: 'localhost',
    enableSecurity: false,
    tokenTtl: '300',
    keysDir: '.reditor/keys',
  };
  return opts;
};
