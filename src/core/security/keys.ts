import { generateKeyPairSync } from 'crypto';
import fs from 'fs';
import path from 'path';
import { KeyPair } from './types';

const PRIVATE_KEY_FILE = 'private.pem';
const PUBLIC_KEY_FILE = 'public.pem';

export const generateKeyPair = (): KeyPair => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  return { privateKey: privateKey as string, publicKey: publicKey as string };
};

export const saveKeyPair = (keyPair: KeyPair, keysDir: string): void => {
  fs.mkdirSync(keysDir, { recursive: true });
  fs.writeFileSync(path.join(keysDir, PRIVATE_KEY_FILE), keyPair.privateKey, { mode: 0o600 });
  fs.writeFileSync(path.join(keysDir, PUBLIC_KEY_FILE), keyPair.publicKey, { mode: 0o644 });
};

export const loadKeyPair = (keysDir: string): KeyPair | undefined => {
  const privatePath = path.join(keysDir, PRIVATE_KEY_FILE);
  const publicPath = path.join(keysDir, PUBLIC_KEY_FILE);
  if (!fs.existsSync(privatePath) || !fs.existsSync(publicPath)) return undefined;
  return {
    privateKey: fs.readFileSync(privatePath, 'utf8'),
    publicKey: fs.readFileSync(publicPath, 'utf8'),
  };
};

export const loadOrGenerateKeyPair = (keysDir: string): KeyPair => {
  const existing = loadKeyPair(keysDir);
  if (existing) {
    console.log(`  🔑 Loaded existing signing keys from ${keysDir}`);
    return existing;
  }
  const keyPair = generateKeyPair();
  saveKeyPair(keyPair, keysDir);
  console.log(`  🔑 Generated new RSA-2048 signing keys → ${keysDir}`);
  return keyPair;
};
