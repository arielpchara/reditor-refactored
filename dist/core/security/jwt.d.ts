import { KeyPair, TokenResult } from './types';
export declare const createToken: (privateKey: string, ttlSeconds: number) => string;
export declare const verifyToken: (token: string, publicKey: string) => TokenResult;
export declare const buildTokenResult: (keys: KeyPair, ttlSeconds: number) => {
    token: string;
    expiresIn: number;
};
//# sourceMappingURL=jwt.d.ts.map