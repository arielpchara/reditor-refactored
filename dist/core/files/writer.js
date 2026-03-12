"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = void 0;
const fs_1 = __importDefault(require("fs"));
const types_1 = require("./types");
const writeFile = (absolutePath, content) => {
    const sizeBytes = Buffer.byteLength(content, 'utf8');
    if (sizeBytes > types_1.MAX_FILE_SIZE_BYTES) {
        return {
            ok: false,
            error: { kind: 'TOO_LARGE', path: absolutePath, sizeBytes, maxBytes: types_1.MAX_FILE_SIZE_BYTES },
        };
    }
    try {
        fs_1.default.writeFileSync(absolutePath, content, 'utf8');
        return { ok: true };
    }
    catch (e) {
        return {
            ok: false,
            error: { kind: 'WRITE_ERROR', path: absolutePath, message: e.message },
        };
    }
};
exports.writeFile = writeFile;
//# sourceMappingURL=writer.js.map