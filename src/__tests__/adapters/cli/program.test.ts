import { parseServeOptions } from '../../../adapters/cli/program';

const argv = (...args: string[]) => ['node', 'bin.js', 'serve', ...args];

describe('parseServeOptions', () => {
  it('uses defaults when no options are given', () => {
    const opts = parseServeOptions(argv());
    expect(opts.port).toBe('3000');
    expect(opts.host).toBe('localhost');
    expect(opts.enableSecurity).toBe(false);
    expect(opts.tokenTtl).toBe('300');
    expect(opts.keysDir).toBe('.reditor/keys');
    expect(opts.forceOtp).toBeUndefined();
  });

  it('parses --port', () => {
    const opts = parseServeOptions(argv('--port', '8080'));
    expect(opts.port).toBe('8080');
  });

  it('parses -p shorthand', () => {
    const opts = parseServeOptions(argv('-p', '9000'));
    expect(opts.port).toBe('9000');
  });

  it('parses --host', () => {
    const opts = parseServeOptions(argv('--host', '0.0.0.0'));
    expect(opts.host).toBe('0.0.0.0');
  });

  it('parses --enable-security as true', () => {
    const opts = parseServeOptions(argv('--enable-security'));
    expect(opts.enableSecurity).toBe(true);
  });

  it('defaults enableSecurity to false when flag is absent', () => {
    const opts = parseServeOptions(argv('--port', '4000'));
    expect(opts.enableSecurity).toBe(false);
  });

  it('parses --token-ttl', () => {
    const opts = parseServeOptions(argv('--token-ttl', '600'));
    expect(opts.tokenTtl).toBe('600');
  });

  it('parses --keys-dir', () => {
    const opts = parseServeOptions(argv('--keys-dir', '/tmp/keys'));
    expect(opts.keysDir).toBe('/tmp/keys');
  });

  it('parses --force-otp', () => {
    const opts = parseServeOptions(argv('--force-otp', '111111'));
    expect(opts.forceOtp).toBe('111111');
  });

  it('defaults forceOtp to undefined when flag is absent', () => {
    const opts = parseServeOptions(argv('--port', '4000'));
    expect(opts.forceOtp).toBeUndefined();
  });
});
