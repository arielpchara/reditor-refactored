import { KeyPair } from './types';
export declare const generateKeyPair: () => KeyPair;
export declare const saveKeyPair: (keyPair: KeyPair, keysDir: string) => void;
export declare const loadKeyPair: (keysDir: string) => KeyPair | undefined;
export declare const loadOrGenerateKeyPair: (keysDir: string) => KeyPair;
//# sourceMappingURL=keys.d.ts.map