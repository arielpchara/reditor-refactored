import fs from 'fs';
import path from 'path';
import { FileValidationResult, MAX_FILE_SIZE_BYTES } from './types';

/** Returns true if the buffer contains valid UTF-8 text with no null bytes,
 *  i.e. content a browser can render as text. */
export const isTextBuffer = (buf: Buffer): boolean => {
  if (buf.includes(0x00)) return false;
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buf);
    return true;
  } catch {
    return false;
  }
};

/** Returns true if resolvedFilePath is strictly inside rootDir (no traversal). */
export const isWithinRoot = (rootDir: string, resolvedFilePath: string): boolean => {
  const normalRoot = path.resolve(rootDir) + path.sep;
  const normalFile = path.resolve(resolvedFilePath);
  return normalFile.startsWith(normalRoot) || normalFile === path.resolve(rootDir);
};

/** Returns true when the file size is within the editor's performance limit. */
export const isWithinSizeLimit = (
  sizeBytes: number,
  maxBytes: number = MAX_FILE_SIZE_BYTES,
): boolean => sizeBytes <= maxBytes;

/**
 * Validates an absolute file path at program startup.
 * Checks existence, type, size limit, and text readability.
 * Path-traversal is intentionally omitted — the path originates from
 * the operator (CLI argument), not from untrusted HTTP input.
 */
export const validateFile = (absolutePath: string): FileValidationResult => {
  if (!fs.existsSync(absolutePath)) {
    return { ok: false, error: { kind: 'NOT_FOUND', path: absolutePath } };
  }

  const stat = fs.statSync(absolutePath);

  if (stat.isDirectory()) {
    return { ok: false, error: { kind: 'IS_DIRECTORY', path: absolutePath } };
  }

  if (!isWithinSizeLimit(stat.size)) {
    return {
      ok: false,
      error: {
        kind: 'TOO_LARGE',
        path: absolutePath,
        sizeBytes: stat.size,
        maxBytes: MAX_FILE_SIZE_BYTES,
      },
    };
  }

  let buf: Buffer;
  try {
    buf = fs.readFileSync(absolutePath);
  } catch (e) {
    return {
      ok: false,
      error: { kind: 'READ_ERROR', path: absolutePath, message: (e as Error).message },
    };
  }

  if (!isTextBuffer(buf)) {
    return { ok: false, error: { kind: 'NOT_TEXT', path: absolutePath } };
  }

  return { ok: true };
};
