export type AppConfig = {
    port: number;
    host: string;
    useTls: boolean;
    certPath: string | undefined;
    keyPath: string | undefined;
    securityEnabled: boolean;
    otp: string | undefined;
    tokenTtl: number;
    keysDir: string;
    jwtPrivateKey: string | undefined;
    jwtPublicKey: string | undefined;
    file: string;
};
//# sourceMappingURL=types.d.ts.map