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

export const loadConfig = (overrides: ConfigOverrides = {}): AppConfig => ({
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
