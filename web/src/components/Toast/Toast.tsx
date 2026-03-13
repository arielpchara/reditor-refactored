import { JSX, useEffect, useState } from 'react';
import './Toast.css';

export type ToastKind = 'ok' | 'error';

export type ToastProps = {
  message: string;
  kind: ToastKind;
  duration?: number;
  onHide: () => void;
};

export function Toast({ message, kind, duration = 3000, onHide }: ToastProps): JSX.Element {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterFrame = requestAnimationFrame(() => setVisible(true));

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, duration - 300);

    const removeTimer = setTimeout(() => {
      onHide();
    }, duration);

    return () => {
      cancelAnimationFrame(enterFrame);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onHide]);

  const modifierClass = `toast--${kind}`;
  const visibilityClass = visible ? 'toast--visible' : '';

  return (
    <div className={`toast ${modifierClass} ${visibilityClass}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
