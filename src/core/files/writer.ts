import fs from 'fs';
import { FileWriteResult, MAX_FILE_SIZE_BYTES } from './types';

export const writeFile = (absolutePath: string, content: string): FileWriteResult => {
  const sizeBytes = Buffer.byteLength(content, 'utf8');

  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: { kind: 'TOO_LARGE', path: absolutePath, sizeBytes, maxBytes: MAX_FILE_SIZE_BYTES },
    };
  }

  try {
    fs.writeFileSync(absolutePath, content, 'utf8');
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: { kind: 'WRITE_ERROR', path: absolutePath, message: (e as Error).message },
    };
  }
};
