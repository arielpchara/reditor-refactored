"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePathTraversalError = exports.FileReadError = exports.FileIsDirectoryError = exports.FileTooLargeError = exports.FileNotAsciiError = exports.FileNotFoundError = exports.InvalidTokenError = exports.InvalidOtpError = void 0;
class InvalidOtpError extends Error {
    constructor() {
        super('Invalid OTP');
        this.name = 'InvalidOtpError';
    }
}
exports.InvalidOtpError = InvalidOtpError;
class InvalidTokenError extends Error {
    constructor(reason) {
        super(`Invalid or expired token: ${reason}`);
        this.name = 'InvalidTokenError';
    }
}
exports.InvalidTokenError = InvalidTokenError;
class FileNotFoundError extends Error {
    path;
    constructor(path) {
        super(`File not found: ${path}`);
        this.path = path;
        this.name = 'FileNotFoundError';
    }
}
exports.FileNotFoundError = FileNotFoundError;
class FileNotAsciiError extends Error {
    path;
    constructor(path) {
        super(`File is not ASCII-encoded: ${path}`);
        this.path = path;
        this.name = 'FileNotAsciiError';
    }
}
exports.FileNotAsciiError = FileNotAsciiError;
class FileTooLargeError extends Error {
    path;
    sizeBytes;
    maxBytes;
    constructor(path, sizeBytes, maxBytes) {
        super(`File too large: ${path} (${sizeBytes} bytes, max ${maxBytes} bytes)`);
        this.path = path;
        this.sizeBytes = sizeBytes;
        this.maxBytes = maxBytes;
        this.name = 'FileTooLargeError';
    }
}
exports.FileTooLargeError = FileTooLargeError;
class FileIsDirectoryError extends Error {
    path;
    constructor(path) {
        super(`Path is a directory, not a file: ${path}`);
        this.path = path;
        this.name = 'FileIsDirectoryError';
    }
}
exports.FileIsDirectoryError = FileIsDirectoryError;
class FileReadError extends Error {
    path;
    constructor(path, cause) {
        super(`Failed to read file: ${path}${cause ? ` — ${cause.message}` : ''}`);
        this.path = path;
        this.name = 'FileReadError';
        if (cause)
            this.cause = cause;
    }
}
exports.FileReadError = FileReadError;
class FilePathTraversalError extends Error {
    path;
    constructor(path) {
        super(`Path traversal detected: ${path}`);
        this.path = path;
        this.name = 'FilePathTraversalError';
    }
}
exports.FilePathTraversalError = FilePathTraversalError;
//# sourceMappingURL=errors.js.map