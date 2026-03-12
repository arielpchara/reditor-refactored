import { parseServeOptions } from '../../../adapters/cli/program';

const argv = (...args: string[]) => ['node', 'bin.js', 'serve', ...args];

describe('parseServeOptions', () => {
  it('uses defaults when no options are given', () => {
    const opts = parseServeOptions(argv());
    expect(opts.port).toBe('3000');
    expect(opts.host).toBe('localhost');
    expect(opts.enableSecurity).toBe(false);
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
});
