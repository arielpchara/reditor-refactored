import request from 'supertest';
import express from 'express';
import { makeExchangeTokenHandler } from '../../../adapters/http/authHandlers';
import { generateKeyPair } from '../../../core/security/keys';
import { AppConfig } from '../../../config/types';

const buildTestConfig = (overrides: Partial<AppConfig> = {}): AppConfig => {
  const kp = generateKeyPair();
  return {
    port: 3000,
    host: 'localhost',
    useTls: false,
    certPath: undefined,
    keyPath: undefined,
    securityEnabled: true,
    otp: '123456',
    tokenTtl: 300,
    keysDir: '.reditor/keys',
    jwtPrivateKey: kp.privateKey,
    jwtPublicKey: kp.publicKey,
    ...overrides,
  };
};

const buildApp = (config: AppConfig) => {
  const app = express();
  app.use(express.json());
  app.post('/auth/exchange-token', makeExchangeTokenHandler(config));
  return app;
};

describe('POST /auth/exchange-token', () => {
  it('returns 401 when OTP is missing', async () => {
    const app = buildApp(buildTestConfig());
    const res = await request(app).post('/auth/exchange-token').send({});
    expect(res.status).toBe(401);
  });

  it('returns 401 when OTP is wrong', async () => {
    const app = buildApp(buildTestConfig());
    const res = await request(app).post('/auth/exchange-token').send({ otp: '000000' });
    expect(res.status).toBe(401);
  });

  it('returns 200 with token when OTP is correct', async () => {
    const app = buildApp(buildTestConfig());
    const res = await request(app).post('/auth/exchange-token').send({ otp: '123456' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('expiresIn', 300);
  });

  it('returns a valid 3-part JWT', async () => {
    const app = buildApp(buildTestConfig());
    const res = await request(app).post('/auth/exchange-token').send({ otp: '123456' });
    expect(res.body.token.split('.')).toHaveLength(3);
  });

  it('returns 403 when security is disabled', async () => {
    const app = buildApp(buildTestConfig({ securityEnabled: false }));
    const res = await request(app).post('/auth/exchange-token').send({ otp: '123456' });
    expect(res.status).toBe(403);
  });

  it('returns 500 when private key is missing', async () => {
    const app = buildApp(buildTestConfig({ jwtPrivateKey: undefined }));
    const res = await request(app).post('/auth/exchange-token').send({ otp: '123456' });
    expect(res.status).toBe(500);
  });
});
