import fs from 'fs';
import path from 'path';
import { FileResult, MAX_FILE_SIZE_BYTES } from './types';
import { isAsciiBuffer, isWithinRoot, isWithinSizeLimit } from './validator';

export const readFile = (rootDir: string, relativePath: string): FileResult => {
  const resolvedPath = path.resolve(rootDir, relativePath);

  if (!isWithinRoot(rootDir, resolvedPath)) {
    return { ok: false, error: { kind: 'PATH_TRAVERSAL', path: relativePath } };
  }

  if (!fs.existsSync(resolvedPath)) {
    return { ok: false, error: { kind: 'NOT_FOUND', path: relativePath } };
  }

  const stat = fs.statSync(resolvedPath);

  if (stat.isDirectory()) {
    return { ok: false, error: { kind: 'IS_DIRECTORY', path: relativePath } };
  }

  if (!isWithinSizeLimit(stat.size)) {
    return {
      ok: false,
      error: {
        kind: 'TOO_LARGE',
        path: relativePath,
        sizeBytes: stat.size,
        maxBytes: MAX_FILE_SIZE_BYTES,
      },
    };
  }

  let buf: Buffer;
  try {
    buf = fs.readFileSync(resolvedPath);
  } catch (e) {
    return {
      ok: false,
      error: { kind: 'READ_ERROR', path: relativePath, message: (e as Error).message },
    };
  }

  if (!isAsciiBuffer(buf)) {
    return { ok: false, error: { kind: 'NOT_ASCII', path: relativePath } };
  }

  return {
    ok: true,
    file: { path: relativePath, content: buf.toString('ascii'), sizeBytes: stat.size },
  };
};

/** Read a file by its absolute path (file already validated at startup — no traversal check). */
export const readAbsoluteFile = (absolutePath: string): FileResult => {
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

  if (!isAsciiBuffer(buf)) {
    return { ok: false, error: { kind: 'NOT_ASCII', path: absolutePath } };
  }

  return {
    ok: true,
    file: {
      path: path.basename(absolutePath),
      content: buf.toString('ascii'),
      sizeBytes: stat.size,
    },
  };
};
