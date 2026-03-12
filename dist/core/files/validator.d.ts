import { FileValidationResult } from './types';
/** Returns true if the buffer contains valid UTF-8 text with no null bytes,
 *  i.e. content a browser can render as text. */
export declare const isTextBuffer: (buf: Buffer) => boolean;
/** Returns true if resolvedFilePath is strictly inside rootDir (no traversal). */
export declare const isWithinRoot: (rootDir: string, resolvedFilePath: string) => boolean;
/** Returns true when the file size is within the editor's performance limit. */
export declare const isWithinSizeLimit: (sizeBytes: number, maxBytes?: number) => boolean;
/**
 * Validates an absolute file path at program startup.
 * Checks existence, type, size limit, and text readability.
 * Path-traversal is intentionally omitted — the path originates from
 * the operator (CLI argument), not from untrusted HTTP input.
 */
export declare const validateFile: (absolutePath: string) => FileValidationResult;
//# sourceMappingURL=validator.d.ts.map