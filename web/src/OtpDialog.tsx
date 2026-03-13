import { JSX, useState } from 'react';
import { exchangeToken, FetchFn, MAX_OTP_ATTEMPTS } from './otpApi';

type Props = {
  onSuccess: () => void;
  fetchFn?: FetchFn;
};

type DialogState = 'input' | 'loading' | 'fatal';

export const OtpDialog = ({ onSuccess, fetchFn = fetch }: Props): JSX.Element => {
  const [otpValue, setOtpValue] = useState('');
  const [attempt, setAttempt] = useState(1);
  const [error, setError] = useState('');
  const [state, setState] = useState<DialogState>('input');

  const handleSubmit = async (): Promise<void> => {
    if (!otpValue.trim()) return;

    setState('loading');
    setError('');

    const result = await exchangeToken(otpValue.trim(), fetchFn);

    if (result.ok) {
      sessionStorage.setItem('reditor_token', result.token);
      onSuccess();
      return;
    }

    if (result.shutdown || attempt >= MAX_OTP_ATTEMPTS) {
      setState('fatal');
      return;
    }

    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);
    setError(`${result.error} — attempt ${nextAttempt} of ${MAX_OTP_ATTEMPTS}`);
    setOtpValue('');
    setState('input');
  };

  if (state === 'fatal') {
    return (
      <div id="otp-overlay">
        <div className="otp-dialog" role="dialog" aria-modal="true">
          <p className="otp-fatal-title">reditor — session terminated</p>
          <p className="otp-fatal-msg">
            Too many failed attempts.
            <br />
            The server has shut down for security.
          </p>
        </div>
      </div>
    );
  }

  const isLoading = state === 'loading';

  return (
    <div id="otp-overlay">
      <div className="otp-wrapper">
        <div className="otp-dialog" role="dialog" aria-modal="true">
          <div className="otp-field">
            <label className="otp-label" htmlFor="otp-input">
              Enter OTP:
            </label>
            <input
              id="otp-input"
              className="otp-input"
              type="password"
              autoComplete="one-time-code"
              spellCheck={false}
              autoFocus
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSubmit();
              }}
              disabled={isLoading}
            />
          </div>
          <div className="otp-actions">
            {isLoading ? (
              <span className="otp-spinner" aria-hidden="true" />
            ) : (
              <button
                className="otp-submit"
                id="otp-submit"
                type="button"
                onClick={() => void handleSubmit()}
              >
                Submit
              </button>
            )}
          </div>
        </div>
        {error && (
          <p className="otp-error" id="otp-error" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

