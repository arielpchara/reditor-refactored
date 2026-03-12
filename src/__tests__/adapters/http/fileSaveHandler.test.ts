import request from 'supertest';
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { makeFileSaveHandler } from '../../../adapters/http/fileSaveHandler';
import { makeAuthMiddleware } from '../../../adapters/http/authMiddleware';
import { generateKeyPair } from '../../../core/security/keys';
import { AppConfig } from '../../../config/types';
import { MAX_FILE_SIZE_BYTES } from '../../../core/files';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reditor-save-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const write = (name: string, content: string): string => {
  const filePath = path.join(tmpDir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
};

const buildConfig = (filePath: string, overrides: Partial<AppConfig> = {}): AppConfig => {
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
    file: filePath,
    ...overrides,
  };
};

const buildApp = (config: AppConfig) => {
  const app = express();
  app.use(express.json());
  app.put('/file', makeAuthMiddleware(config), makeFileSaveHandler(config));
  return app;
};

describe('PUT /file — no security', () => {
  it('returns 204 and writes content to the file', async () => {
    const filePath = write('edit.txt', 'original');
    const app = buildApp(buildConfig(filePath));
    const res = await request(app).put('/file').send({ content: 'updated content' });
    expect(res.status).toBe(204);
    expect(fs.readFileSync(filePath, 'utf8')).toBe('updated content');
  });

  it('returns 400 when content field is missing', async () => {
    const filePath = write('edit.txt', 'original');
    const app = buildApp(buildConfig(filePath));
    const res = await request(app).put('/file').send({});
    expect(res.status).toBe(400);
  });

  it('returns 413 when content exceeds size limit', async () => {
    const filePath = write('edit.txt', 'original');
    const app = buildApp(buildConfig(filePath));
    const bigContent = 'A'.repeat(MAX_FILE_SIZE_BYTES + 1);
    const res = await request(app).put('/file').send({ content: bigContent });
    expect(res.status).toBe(413);
    expect(fs.readFileSync(filePath, 'utf8')).toBe('original');
  });
});
