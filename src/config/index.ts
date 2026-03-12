import { AppConfig } from './types';

type ConfigOverrides = {
  port?: number;
  host?: string;
  securityEnabled?: boolean;
  otp?: string;
};

export const loadConfig = (overrides: ConfigOverrides = {}): AppConfig => ({
  port: overrides.port ?? Number(process.env.PORT ?? 3000),
  host: overrides.host ?? process.env.HOST ?? 'localhost',
  securityEnabled: overrides.securityEnabled ?? false,
  useTls: overrides.securityEnabled ?? process.env.USE_TLS !== 'false',
  certPath: process.env.CERT_PATH,
  keyPath: process.env.KEY_PATH,
  otp: overrides.otp,
});
