import jwt from 'jsonwebtoken';
import { JwtPayload, KeyPair, TokenResult } from './types';

export const createToken = (privateKey: string, ttlSeconds: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: 'reditor',
    iat: now,
    exp: now + ttlSeconds,
  };
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
};

export const verifyToken = (token: string, publicKey: string): TokenResult => {
  try {
    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload;
    return { ok: true, token, expiresIn: payload.exp - payload.iat };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
};

export const buildTokenResult = (
  keys: KeyPair,
  ttlSeconds: number,
): { token: string; expiresIn: number } => ({
  token: createToken(keys.privateKey, ttlSeconds),
  expiresIn: ttlSeconds,
});
