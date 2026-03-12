"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const loadConfig = (overrides = {}) => ({
    port: overrides.port ?? Number(process.env.PORT ?? 3000),
    host: overrides.host ?? process.env.HOST ?? 'localhost',
    securityEnabled: overrides.securityEnabled ?? true,
    useTls: overrides.securityEnabled ?? process.env.USE_TLS !== 'false',
    certPath: process.env.CERT_PATH,
    keyPath: process.env.KEY_PATH,
    otp: overrides.otp,
    tokenTtl: overrides.tokenTtl ?? 300,
    keysDir: overrides.keysDir ?? '.reditor/keys',
    jwtPrivateKey: overrides.jwtPrivateKey,
    jwtPublicKey: overrides.jwtPublicKey,
    file: overrides.file ?? '',
});
exports.loadConfig = loadConfig;
//# sourceMappingURL=index.js.map