import request from 'supertest';
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { makeFileHandler } from '../../../adapters/http/fileHandlers';
import { makeAuthMiddleware } from '../../../adapters/http/authMiddleware';
import { generateKeyPair } from '../../../core/security/keys';
import { createToken } from '../../../core/security/jwt';
import { AppConfig } from '../../../config/types';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reditor-http-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const write = (name: string, content: Buffer | string) =>
  fs.writeFileSync(path.join(tmpDir, name), content);

const buildConfig = (overrides: Partial<AppConfig> = {}): AppConfig => {
  const kp = generateKeyPair();
  return {
    port: 3000,
    host: 'localhost',
    useTls: false,
    certPath: undefined,
    keyPath: undefined,
    securityEnabled: false,
    otp: undefined,
    tokenTtl: 300,
    keysDir: '.reditor/keys',
    jwtPrivateKey: kp.privateKey,
    jwtPublicKey: kp.publicKey,
    root: tmpDir,
    ...overrides,
  };
};

const buildApp = (config: AppConfig) => {
  const app = express();
  app.use(express.json());
  app.get('/file', makeAuthMiddleware(config), makeFileHandler(config));
  return app;
};

describe('GET /file — no security', () => {
  it('returns 400 when path query param is missing', async () => {
    const app = buildApp(buildConfig());
    const res = await request(app).get('/file');
    expect(res.status).toBe(400);
  });

  it('returns 200 with raw file content', async () => {
    write('hello.txt', 'hello world');
    const app = buildApp(buildConfig());
    const res = await request(app).get('/file?path=hello.txt');
    expect(res.status).toBe(200);
    expect(res.text).toBe('hello world');
  });

  it('returns 404 for a missing file', async () => {
    const app = buildApp(buildConfig());
    const res = await request(app).get('/file?path=nope.txt');
    expect(res.status).toBe(404);
  });

  it('returns 403 for path traversal attempt', async () => {
    const app = buildApp(buildConfig());
    const res = await request(app).get('/file?path=../../etc/passwd');
    expect(res.status).toBe(403);
  });

  it('returns 422 for a non-ASCII file', async () => {
    write('binary.bin', Buffer.from([65, 200, 201]));
    const app = buildApp(buildConfig());
    const res = await request(app).get('/file?path=binary.bin');
    expect(res.status).toBe(422);
  });

  it('returns 422 when path points to a directory', async () => {
    fs.mkdirSync(path.join(tmpDir, 'subdir'));
    const app = buildApp(buildConfig());
    const res = await request(app).get('/file?path=subdir');
    expect(res.status).toBe(422);
  });
});

describe('GET /file — with security', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const config = buildConfig({ securityEnabled: true });
    write('secret.txt', 'top secret');
    const app = buildApp(config);
    const res = await request(app).get('/file?path=secret.txt');
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    const config = buildConfig({ securityEnabled: true });
    write('secret.txt', 'top secret');
    const app = buildApp(config);
    const res = await request(app)
      .get('/file?path=secret.txt')
      .set('Authorization', 'Bearer not.a.token');
    expect(res.status).toBe(401);
  });

  it('returns 200 with valid JWT', async () => {
    const config = buildConfig({ securityEnabled: true });
    write('secret.txt', 'top secret');
    const app = buildApp(config);
    const token = createToken(config.jwtPrivateKey!, config.tokenTtl);
    const res = await request(app)
      .get('/file?path=secret.txt')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.text).toBe('top secret');
  });
});
