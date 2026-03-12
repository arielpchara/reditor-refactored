import { AppConfig } from './types';
type ConfigOverrides = {
    port?: number;
    host?: string;
    securityEnabled?: boolean;
    otp?: string;
    tokenTtl?: number;
    keysDir?: string;
    jwtPrivateKey?: string;
    jwtPublicKey?: string;
    file?: string;
};
export declare const loadConfig: (overrides?: ConfigOverrides) => AppConfig;
export {};
//# sourceMappingURL=index.d.ts.map