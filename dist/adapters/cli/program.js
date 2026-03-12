"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseServeCommand = exports.buildProgram = void 0;
const commander_1 = require("commander");
const buildProgram = () => {
    const program = new commander_1.Command();
    program.name('reditor').description('Edit files from your server in the browser.');
    program
        .command('serve', { isDefault: true })
        .description('Start the web server')
        .argument('[file]', 'Path to the file to edit in the browser')
        .option('-p, --port <port>', 'Port to listen on', '3000')
        .option('-H, --host <host>', 'Host to bind to', 'localhost')
        .option('--force-disable-security', '[DANGER] Disable OTP and JWT auth — anyone on the network can access the file', false)
        .option('--token-ttl <seconds>', 'JWT token time-to-live in seconds', '300')
        .option('--keys-dir <path>', 'Directory to store RSA signing keys', '.reditor/keys')
        .option('--force-otp <otp>', '[TEST ONLY] Override the generated OTP with a fixed value')
        .action(() => {
        // action is handled in bin.ts to keep this file pure/testable
    });
    return program;
};
exports.buildProgram = buildProgram;
const parseServeCommand = (argv) => {
    const program = (0, exports.buildProgram)();
    program.parse(argv);
    const cmd = program.commands.find((c) => c.name() === 'serve');
    const opts = cmd?.opts() ?? {
        port: '3000',
        host: 'localhost',
        forceDisableSecurity: false,
        tokenTtl: '300',
        keysDir: '.reditor/keys',
        forceOtp: undefined,
    };
    const file = cmd?.args[0];
    return { opts, file };
};
exports.parseServeCommand = parseServeCommand;
//# sourceMappingURL=program.js.map