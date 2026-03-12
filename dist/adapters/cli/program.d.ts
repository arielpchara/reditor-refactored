import { Command } from 'commander';
export type ServeOptions = {
    port: string;
    host: string;
    forceDisableSecurity: boolean;
    tokenTtl: string;
    keysDir: string;
    forceOtp: string | undefined;
};
export type ParsedServeCommand = {
    opts: ServeOptions;
    file: string | undefined;
};
export declare const buildProgram: () => Command;
export declare const parseServeCommand: (argv: string[]) => ParsedServeCommand;
//# sourceMappingURL=program.d.ts.map