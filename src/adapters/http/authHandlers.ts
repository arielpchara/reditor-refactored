import { Request, Response } from 'express';
import { AppConfig } from '../../config/types';
import { buildTokenResult } from '../../core/security/jwt';
import { RouteHandler } from './types';
import { logger } from '../logger';

export const MAX_OTP_ATTEMPTS = 3;

type ExchangeHandlerDeps = {
  exit?: (code: number) => void;
};

export const makeExchangeTokenHandler = (
  config: AppConfig,
  deps: ExchangeHandlerDeps = {},
): RouteHandler => {
  const exit = deps.exit ?? ((code) => process.exit(code));
  let failedAttempts = 0;

  return (req: Request, res: Response): void => {
    if (!config.securityEnabled || !config.otp) {
      logger.warn('Token exchange rejected because security is disabled');
      res.status(403).json({ error: 'Security is not enabled' });
      return;
    }

    const { otp } = req.body as { otp: string };

    if (!otp || otp !== config.otp) {
      failedAttempts += 1;
      const remaining = MAX_OTP_ATTEMPTS - failedAttempts;
      logger.warn('Token exchange rejected due to invalid OTP', {
        hasOtp: Boolean(otp),
        ip: req.ip,
        failedAttempts,
        remaining,
      });

      if (failedAttempts >= MAX_OTP_ATTEMPTS) {
        logger.error(
          `OTP max attempts (${MAX_OTP_ATTEMPTS}) exceeded — shutting down for security`,
          { ip: req.ip },
        );
        res
          .status(401)
          .json({ error: 'Invalid OTP. Maximum attempts exceeded — server is shutting down.' });
        // Delay exit so the response can be flushed
        setTimeout(() => exit(1), 200);
        return;
      }

      res.status(401).json({ error: 'Invalid OTP', attemptsLeft: remaining });
      return;
    }

    if (!config.jwtPrivateKey) {
      logger.error('Token exchange failed: signing key not available');
      res.status(500).json({ error: 'Signing key not available' });
      return;
    }

    const result = buildTokenResult(
      { privateKey: config.jwtPrivateKey, publicKey: config.jwtPublicKey ?? '' },
      config.tokenTtl,
    );

    logger.info('Token exchange succeeded', { ip: req.ip, ttlSeconds: config.tokenTtl });
    res.json(result);
  };
};
