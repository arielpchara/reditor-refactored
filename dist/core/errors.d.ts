export declare class InvalidOtpError extends Error {
    constructor();
}
export declare class InvalidTokenError extends Error {
    constructor(reason: string);
}
export declare class FileNotFoundError extends Error {
    readonly path: string;
    constructor(path: string);
}
export declare class FileNotAsciiError extends Error {
    readonly path: string;
    constructor(path: string);
}
export declare class FileTooLargeError extends Error {
    readonly path: string;
    readonly sizeBytes: number;
    readonly maxBytes: number;
    constructor(path: string, sizeBytes: number, maxBytes: number);
}
export declare class FileIsDirectoryError extends Error {
    readonly path: string;
    constructor(path: string);
}
export declare class FileReadError extends Error {
    readonly path: string;
    constructor(path: string, cause?: Error);
}
export declare class FilePathTraversalError extends Error {
    readonly path: string;
    constructor(path: string);
}
//# sourceMappingURL=errors.d.ts.map