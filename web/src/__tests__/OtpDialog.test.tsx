import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OtpDialog } from '../OtpDialog';
import { MAX_OTP_ATTEMPTS } from '../otpApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── OtpDialog ────────────────────────────────────────────────────────────────

describe('OtpDialog', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders the OTP overlay in the DOM', () => {
    render(<OtpDialog onSuccess={() => {}} fetchFn={mockFetchOk('tok')} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/enter otp/i)).toBeInTheDocument();
    expect(screen.getByText(/enter otp/i)).toBeInTheDocument();
  });

  it('stores token in sessionStorage and calls onSuccess on success', async () => {
    const onSuccess = vi.fn();
    render(<OtpDialog onSuccess={onSuccess} fetchFn={mockFetchOk('good-token')} />);

    fireEvent.change(screen.getByLabelText(/enter otp/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(sessionStorage.getItem('reditor_token')).toBe('good-token');
  });

  it('shows error message on wrong OTP', async () => {
    let callCount = 0;
    const fetchFn = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify({ error: 'Invalid OTP' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ token: 'success-token' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    const onSuccess = vi.fn();
    render(<OtpDialog onSuccess={onSuccess} fetchFn={fetchFn} />);

    fireEvent.change(screen.getByLabelText(/enter otp/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(screen.getByText('Invalid OTP')).toBeInTheDocument());
  });

  it('increments attempt counter display on failure', async () => {
    let callCount = 0;
    const fetchFn = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify({ error: 'Invalid OTP' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ token: 'tok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    const onSuccess = vi.fn();
    render(<OtpDialog onSuccess={onSuccess} fetchFn={fetchFn} />);

    fireEvent.change(screen.getByLabelText(/enter otp/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(screen.getByText(/attempt 2/i)).toBeInTheDocument());
  });

  it('shows fatal screen after MAX_OTP_ATTEMPTS failures', async () => {
    render(<OtpDialog onSuccess={() => {}} fetchFn={mockFetchFail('Invalid OTP')} />);

    for (let i = 0; i < MAX_OTP_ATTEMPTS; i++) {
      await waitFor(() => expect(screen.queryByLabelText(/enter otp/i)).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText(/enter otp/i), { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    }

    await waitFor(() =>
      expect(screen.getByText(/session terminated/i)).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText(/enter otp/i)).not.toBeInTheDocument();
  });

  it('shows fatal screen on server shutdown signal', async () => {
    const fetchFn = mockFetchFail(
      'Invalid OTP. Maximum attempts exceeded — server is shutting down.',
      401,
    );
    render(<OtpDialog onSuccess={() => {}} fetchFn={fetchFn} />);

    fireEvent.change(screen.getByLabelText(/enter otp/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(screen.getByText(/session terminated/i)).toBeInTheDocument());
  });

  it('does not submit when input is empty', async () => {
    const fetchFn = mockFetchOk('tok');
    render(<OtpDialog onSuccess={() => {}} fetchFn={fetchFn} />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('submits on Enter key', async () => {
    const onSuccess = vi.fn();
    render(<OtpDialog onSuccess={onSuccess} fetchFn={mockFetchOk('enter-token')} />);

    const input = screen.getByLabelText(/enter otp/i);
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });
});
