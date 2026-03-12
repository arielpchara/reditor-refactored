import { Command } from 'commander';

export type ServeOptions = {
  port: string;
  host: string;
  enableSecurity: boolean;
};

export const buildProgram = (): Command => {
  const program = new Command();

  program
    .name('reditor')
    .description('Edit files from your server in the browser.');

  program
    .command('serve', { isDefault: true })
    .description('Start the web server')
    .option('-p, --port <port>', 'Port to listen on', '3000')
    .option('-H, --host <host>', 'Host to bind to', 'localhost')
    .option('--enable-security', 'Enable HTTPS and generate a one-time password (OTP) for web access', false)
    .action(() => {
      // action is handled in bin.ts to keep this file pure/testable
    });

  return program;
};

export const parseServeOptions = (argv: string[]): ServeOptions => {
  const program = buildProgram();
  program.parse(argv);
  const cmd = program.commands.find((c) => c.name() === 'serve');
  const opts = cmd?.opts<ServeOptions>() ?? { port: '3000', host: 'localhost', enableSecurity: false };
  return opts;
};
