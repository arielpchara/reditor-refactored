import { isAsciiBuffer, isWithinRoot, isWithinSizeLimit } from '../../../core/files/validator';
import { MAX_FILE_SIZE_BYTES } from '../../../core/files/types';

describe('isAsciiBuffer', () => {
  it('returns true for a pure ASCII buffer', () => {
    expect(isAsciiBuffer(Buffer.from('hello world\n'))).toBe(true);
  });

  it('returns true for an empty buffer', () => {
    expect(isAsciiBuffer(Buffer.alloc(0))).toBe(true);
  });

  it('returns false when a byte exceeds 127', () => {
    const buf = Buffer.from([72, 101, 108, 128]); // 'Hel' + 0x80
    expect(isAsciiBuffer(buf)).toBe(false);
  });

  it('returns false for a UTF-8 buffer with multibyte chars', () => {
    expect(isAsciiBuffer(Buffer.from('héllo', 'utf8'))).toBe(false);
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
