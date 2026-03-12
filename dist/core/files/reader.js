"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const types_1 = require("./types");
const validator_1 = require("./validator");
const readFile = (rootDir, relativePath) => {
    const resolvedPath = path_1.default.resolve(rootDir, relativePath);
    if (!(0, validator_1.isWithinRoot)(rootDir, resolvedPath)) {
        return { ok: false, error: { kind: 'PATH_TRAVERSAL', path: relativePath } };
    }
    if (!fs_1.default.existsSync(resolvedPath)) {
        return { ok: false, error: { kind: 'NOT_FOUND', path: relativePath } };
    }
    const stat = fs_1.default.statSync(resolvedPath);
    if (stat.isDirectory()) {
        return { ok: false, error: { kind: 'IS_DIRECTORY', path: relativePath } };
    }
    if (!(0, validator_1.isWithinSizeLimit)(stat.size)) {
        return {
            ok: false,
            error: {
                kind: 'TOO_LARGE',
                path: relativePath,
                sizeBytes: stat.size,
                maxBytes: types_1.MAX_FILE_SIZE_BYTES,
            },
        };
    }
    let buf;
    try {
        buf = fs_1.default.readFileSync(resolvedPath);
    }
    catch (e) {
        return {
            ok: false,
            error: { kind: 'READ_ERROR', path: relativePath, message: e.message },
        };
    }
    if (!(0, validator_1.isTextBuffer)(buf)) {
        return { ok: false, error: { kind: 'NOT_TEXT', path: relativePath } };
    }
    return {
        ok: true,
        file: { path: relativePath, content: buf.toString('utf8'), sizeBytes: stat.size },
    };
};
exports.readFile = readFile;
//# sourceMappingURL=reader.js.map