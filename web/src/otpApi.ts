export const MAX_OTP_ATTEMPTS = 3;

export class OtpFatalError extends Error {
  constructor() {
    super('Maximum OTP attempts reached — session terminated');
    this.name = 'OtpFatalError';
  }
}

export type OtpExchangeResult =
  | { ok: true; token: string }
  | { ok: false; error: string; shutdown: boolean };

export type FetchFn = typeof globalThis.fetch;

/** Pure exchange logic — easy to unit-test with a mocked fetch. */
export const exchangeToken = async (
  otp: string,
  fetchFn: FetchFn = fetch,
): Promise<OtpExchangeResult> => {
  let res: Response;
  try {
    res = await fetchFn('/auth/exchange-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    });
  } catch {
    return { ok: false, error: 'Network error — could not reach server', shutdown: false };
  }

  if (res.ok) {
    const data = (await res.json()) as { token: string };
    return { ok: true, token: data.token };
  }

  const body = (await res.json().catch(() => ({}))) as { error?: string };
  const shutdown = res.status === 401 && /shutting down/i.test(body.error ?? '');
  return { ok: false, error: body.error ?? `Error ${res.status}`, shutdown };
};
