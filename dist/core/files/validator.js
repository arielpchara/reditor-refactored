"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFile = exports.isWithinSizeLimit = exports.isWithinRoot = exports.isTextBuffer = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const types_1 = require("./types");
/** Returns true if the buffer contains valid UTF-8 text with no null bytes,
 *  i.e. content a browser can render as text. */
const isTextBuffer = (buf) => {
    if (buf.includes(0x00))
        return false;
    try {
        new TextDecoder('utf-8', { fatal: true }).decode(buf);
        return true;
    }
    catch {
        return false;
    }
};
exports.isTextBuffer = isTextBuffer;
/** Returns true if resolvedFilePath is strictly inside rootDir (no traversal). */
const isWithinRoot = (rootDir, resolvedFilePath) => {
    const normalRoot = path_1.default.resolve(rootDir) + path_1.default.sep;
    const normalFile = path_1.default.resolve(resolvedFilePath);
    return normalFile.startsWith(normalRoot) || normalFile === path_1.default.resolve(rootDir);
};
exports.isWithinRoot = isWithinRoot;
/** Returns true when the file size is within the editor's performance limit. */
const isWithinSizeLimit = (sizeBytes, maxBytes = types_1.MAX_FILE_SIZE_BYTES) => sizeBytes <= maxBytes;
exports.isWithinSizeLimit = isWithinSizeLimit;
/**
 * Validates an absolute file path at program startup.
 * Checks existence, type, size limit, and text readability.
 * Path-traversal is intentionally omitted — the path originates from
 * the operator (CLI argument), not from untrusted HTTP input.
 */
const validateFile = (absolutePath) => {
    if (!fs_1.default.existsSync(absolutePath)) {
        return { ok: false, error: { kind: 'NOT_FOUND', path: absolutePath } };
    }
    const stat = fs_1.default.statSync(absolutePath);
    if (stat.isDirectory()) {
        return { ok: false, error: { kind: 'IS_DIRECTORY', path: absolutePath } };
    }
    if (!(0, exports.isWithinSizeLimit)(stat.size)) {
        return {
            ok: false,
            error: {
                kind: 'TOO_LARGE',
                path: absolutePath,
                sizeBytes: stat.size,
                maxBytes: types_1.MAX_FILE_SIZE_BYTES,
            },
        };
    }
    let buf;
    try {
        buf = fs_1.default.readFileSync(absolutePath);
    }
    catch (e) {
        return {
            ok: false,
            error: { kind: 'READ_ERROR', path: absolutePath, message: e.message },
        };
    }
    if (!(0, exports.isTextBuffer)(buf)) {
        return { ok: false, error: { kind: 'NOT_TEXT', path: absolutePath } };
    }
    return { ok: true };
};
exports.validateFile = validateFile;
//# sourceMappingURL=validator.js.map