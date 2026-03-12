import { generateOtp } from '../../../core/security/otp';

describe('generateOtp', () => {
  it('returns a 6-digit numeric string', () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('generates values within the valid range', () => {
    const otp = generateOtp();
    const n = Number(otp);
    expect(n).toBeGreaterThanOrEqual(100000);
    expect(n).toBeLessThanOrEqual(999999);
  });

  it('generates different values on successive calls', () => {
    const results = new Set(Array.from({ length: 20 }, generateOtp));
    expect(results.size).toBeGreaterThan(1);
  });
});
