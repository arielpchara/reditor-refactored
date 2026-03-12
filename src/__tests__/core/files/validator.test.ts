import {
  isTextBuffer,
  isWithinRoot,
  isWithinSizeLimit,
  validateFile,
} from '../../../core/files/validator';
import { MAX_FILE_SIZE_BYTES } from '../../../core/files/types';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('isTextBuffer', () => {
  it('returns true for a pure ASCII buffer', () => {
    expect(isTextBuffer(Buffer.from('hello world\n'))).toBe(true);
  });

  it('returns true for an empty buffer', () => {
    expect(isTextBuffer(Buffer.alloc(0))).toBe(true);
  });

  it('returns true for a valid UTF-8 buffer with multibyte chars', () => {
    expect(isTextBuffer(Buffer.from('héllo', 'utf8'))).toBe(true);
  });

  it('returns true for a UTF-8 buffer with emoji', () => {
    expect(isTextBuffer(Buffer.from('hello 🌍', 'utf8'))).toBe(true);
  });

  it('returns false when the buffer contains a null byte', () => {
    expect(isTextBuffer(Buffer.from([72, 101, 0x00, 108, 111]))).toBe(false);
  });

  it('returns false for invalid UTF-8 bytes', () => {
    expect(isTextBuffer(Buffer.from([0xff, 0xfe, 0x00, 0x01]))).toBe(false);
  });
});

describe('isWithinRoot', () => {
  const root = '/srv/files';

  it('allows a path directly inside root', () => {
    expect(isWithinRoot(root, '/srv/files/readme.txt')).toBe(true);
  });

  it('allows a deeply nested path inside root', () => {
    expect(isWithinRoot(root, '/srv/files/a/b/c.ts')).toBe(true);
  });

  it('rejects a path that escapes via ..', () => {
    expect(isWithinRoot(root, '/srv/files/../../etc/passwd')).toBe(false);
  });

  it('rejects a path completely outside root', () => {
    expect(isWithinRoot(root, '/etc/passwd')).toBe(false);
  });
});

describe('isWithinSizeLimit', () => {
  it('allows a file exactly at the limit', () => {
    expect(isWithinSizeLimit(MAX_FILE_SIZE_BYTES)).toBe(true);
  });

  it('allows a file smaller than the limit', () => {
    expect(isWithinSizeLimit(1024)).toBe(true);
  });

  it('rejects a file one byte over the limit', () => {
    expect(isWithinSizeLimit(MAX_FILE_SIZE_BYTES + 1)).toBe(false);
  });

  it('accepts a custom max', () => {
    expect(isWithinSizeLimit(100, 50)).toBe(false);
    expect(isWithinSizeLimit(50, 50)).toBe(true);
  });
});

describe('validateFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reditor-validate-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const write = (name: string, content: Buffer | string): string => {
    const filePath = path.join(tmpDir, name);
    fs.writeFileSync(filePath, content);
    return filePath;
  };

  it('returns ok:true for a valid text file', () => {
    const filePath = write('hello.txt', 'hello world');
    expect(validateFile(filePath)).toEqual({ ok: true });
  });

  it('returns NOT_FOUND for a missing file', () => {
    const result = validateFile(path.join(tmpDir, 'missing.txt'));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('NOT_FOUND');
  });

  it('returns IS_DIRECTORY when path points to a directory', () => {
    const result = validateFile(tmpDir);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('IS_DIRECTORY');
  });

  it('returns TOO_LARGE for a file exceeding the size limit', () => {
    const filePath = write('big.txt', Buffer.alloc(MAX_FILE_SIZE_BYTES + 1, 65));
    const result = validateFile(filePath);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('TOO_LARGE');
      if (result.error.kind === 'TOO_LARGE') {
        expect(result.error.sizeBytes).toBe(MAX_FILE_SIZE_BYTES + 1);
        expect(result.error.maxBytes).toBe(MAX_FILE_SIZE_BYTES);
      }
    }
  });

  it('returns NOT_TEXT for a binary file with null bytes', () => {
    const filePath = write('binary.bin', Buffer.from([65, 66, 0x00, 0x01]));
    const result = validateFile(filePath);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('NOT_TEXT');
  });

  it('returns ok:true for a valid UTF-8 file with multibyte chars', () => {
    const filePath = write('utf8.txt', Buffer.from('héllo 🌍', 'utf8'));
    expect(validateFile(filePath)).toEqual({ ok: true });
  });
});
