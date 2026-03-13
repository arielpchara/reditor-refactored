import './OtpDialog.css';
import { JSX, useState } from 'react';
import { exchangeToken, FetchFn, MAX_OTP_ATTEMPTS } from '../../otpApi';

export type OtpDialogProps = {
  onSuccess: () => void;
  fetchFn?: FetchFn;
};

type DialogState = 'input' | 'loading' | 'fatal';

export function OtpDialog({ onSuccess, fetchFn = fetch }: OtpDialogProps): JSX.Element {
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
      <div className="otp">
        <div className="otp__top" />
        <div className="otp__dialog" role="dialog" aria-modal="true">
          <p className="otp__fatal-title">reditor — session terminated</p>
          <p className="otp__fatal-message">
            Too many failed attempts.
            <br />
            The server has shut down for security.
          </p>
        </div>
        <div className="otp__bottom" />
      </div>
    );
  }

  const isLoading = state === 'loading';

  return (
    <div className="otp">
      <div className="otp__top" />
      <div className="otp__dialog" role="dialog" aria-modal="true">
        <div className="otp__field">
          <label className="otp__label" htmlFor="otp-input">
            Enter OTP:
          </label>
          <input
            id="otp-input"
            className="otp__input"
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
        <div className="otp__actions">
          {isLoading ? (
            <span className="otp__spinner" aria-hidden="true" />
          ) : (
            <button className="otp__submit" type="button" onClick={() => void handleSubmit()}>
              Submit
            </button>
          )}
        </div>
      </div>
      <div className="otp__bottom">
        {error && (
          <p className="otp__error" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
