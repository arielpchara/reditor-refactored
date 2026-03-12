"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTokenResult = exports.verifyToken = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createToken = (privateKey, ttlSeconds) => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: 'reditor',
        iat: now,
        exp: now + ttlSeconds,
    };
    return jsonwebtoken_1.default.sign(payload, privateKey, { algorithm: 'RS256' });
};
exports.createToken = createToken;
const verifyToken = (token, publicKey) => {
    try {
        const payload = jsonwebtoken_1.default.verify(token, publicKey, { algorithms: ['RS256'] });
        return { ok: true, token, expiresIn: payload.exp - payload.iat };
    }
    catch (e) {
        return { ok: false, error: e.message };
    }
};
exports.verifyToken = verifyToken;
const buildTokenResult = (keys, ttlSeconds) => ({
    token: (0, exports.createToken)(keys.privateKey, ttlSeconds),
    expiresIn: ttlSeconds,
});
exports.buildTokenResult = buildTokenResult;
//# sourceMappingURL=jwt.js.map