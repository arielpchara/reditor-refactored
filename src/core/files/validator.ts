import path from 'path';
import { MAX_FILE_SIZE_BYTES } from './types';

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
