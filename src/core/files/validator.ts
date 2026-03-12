import path from 'path';
import { MAX_FILE_SIZE_BYTES } from './types';

/** Returns true if every byte in the buffer is within the ASCII range (0–127). */
export const isAsciiBuffer = (buf: Buffer): boolean => {
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] > 127) return false;
  }
  return true;
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
