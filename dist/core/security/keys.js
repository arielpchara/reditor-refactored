"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadOrGenerateKeyPair = exports.loadKeyPair = exports.saveKeyPair = exports.generateKeyPair = void 0;
const crypto_1 = require("crypto");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const PRIVATE_KEY_FILE = 'private.pem';
const PUBLIC_KEY_FILE = 'public.pem';
const generateKeyPair = () => {
    const { privateKey, publicKey } = (0, crypto_1.generateKeyPairSync)('rsa', {
        modulusLength: 2048,
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    return { privateKey: privateKey, publicKey: publicKey };
};
exports.generateKeyPair = generateKeyPair;
const saveKeyPair = (keyPair, keysDir) => {
    fs_1.default.mkdirSync(keysDir, { recursive: true });
    fs_1.default.writeFileSync(path_1.default.join(keysDir, PRIVATE_KEY_FILE), keyPair.privateKey, { mode: 0o600 });
    fs_1.default.writeFileSync(path_1.default.join(keysDir, PUBLIC_KEY_FILE), keyPair.publicKey, { mode: 0o644 });
};
exports.saveKeyPair = saveKeyPair;
const loadKeyPair = (keysDir) => {
    const privatePath = path_1.default.join(keysDir, PRIVATE_KEY_FILE);
    const publicPath = path_1.default.join(keysDir, PUBLIC_KEY_FILE);
    if (!fs_1.default.existsSync(privatePath) || !fs_1.default.existsSync(publicPath))
        return undefined;
    return {
        privateKey: fs_1.default.readFileSync(privatePath, 'utf8'),
        publicKey: fs_1.default.readFileSync(publicPath, 'utf8'),
    };
};
exports.loadKeyPair = loadKeyPair;
const loadOrGenerateKeyPair = (keysDir) => {
    const existing = (0, exports.loadKeyPair)(keysDir);
    if (existing) {
        return existing;
    }
    const keyPair = (0, exports.generateKeyPair)();
    (0, exports.saveKeyPair)(keyPair, keysDir);
    return keyPair;
};
exports.loadOrGenerateKeyPair = loadOrGenerateKeyPair;
//# sourceMappingURL=keys.js.map