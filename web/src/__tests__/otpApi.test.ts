import { describe, it, expect, vi } from 'vitest';
import { exchangeToken, MAX_OTP_ATTEMPTS, OtpFatalError } from '../otpApi';

const mockFetchOk = (token: string) =>
  vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

const mockFetchFail = (error: string, status = 401) =>
  vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ error }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

const mockFetchNetworkError = () => vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

describe('exchangeToken', () => {
  it('returns ok:true with token on success', async () => {
    const fetchFn = mockFetchOk('jwt-abc');
    const result = await exchangeToken('123456', fetchFn);
    expect(result).toEqual({ ok: true, token: 'jwt-abc' });
  });

  it('returns ok:false with error on 401', async () => {
    const fetchFn = mockFetchFail('Invalid OTP');
    const result = await exchangeToken('wrong', fetchFn);
    expect(result).toEqual({ ok: false, error: 'Invalid OTP', shutdown: false });
  });

  it('returns shutdown:true when server sends shutdown message', async () => {
    const fetchFn = mockFetchFail(
      'Invalid OTP. Maximum attempts exceeded — server is shutting down.',
      401,
    );
    const result = await exchangeToken('wrong', fetchFn);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.shutdown).toBe(true);
    }
  });

  it('returns shutdown:false for non-shutdown 401', async () => {
    const fetchFn = mockFetchFail('Invalid OTP', 401);
    const result = await exchangeToken('wrong', fetchFn);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.shutdown).toBe(false);
    }
  });

  it('returns network error on fetch failure', async () => {
    const fetchFn = mockFetchNetworkError();
    const result = await exchangeToken('otp', fetchFn);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/network error/i);
    }
  });

  it('calls the correct endpoint with the OTP', async () => {
    const fetchFn = mockFetchOk('tok');
    await exchangeToken('myotp', fetchFn);
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/auth/exchange-token');
    expect(JSON.parse(init.body as string)).toEqual({ otp: 'myotp' });
  });
});

describe('OtpFatalError', () => {
  it('is an instance of Error', () => {
    expect(new OtpFatalError()).toBeInstanceOf(Error);
  });

  it('has the expected name', () => {
    expect(new OtpFatalError().name).toBe('OtpFatalError');
  });

  it('MAX_OTP_ATTEMPTS is 3', () => {
    expect(MAX_OTP_ATTEMPTS).toBe(3);
  });
});
