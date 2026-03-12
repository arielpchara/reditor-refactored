import { Request, Response } from 'express';
import { AppConfig } from '../../config/types';
import { buildTokenResult } from '../../core/security/jwt';
import { RouteHandler } from './types';
import { logger } from '../logger';

export const makeExchangeTokenHandler = (config: AppConfig): RouteHandler => {
  return (req: Request, res: Response): void => {
    if (!config.securityEnabled || !config.otp) {
      logger.warn('Token exchange rejected because security is disabled');
      res.status(403).json({ error: 'Security is not enabled' });
      return;
    }

    const { otp } = req.body as { otp: string };

    if (!otp || otp !== config.otp) {
      logger.warn('Token exchange rejected due to invalid OTP', {
        hasOtp: Boolean(otp),
        ip: req.ip,
      });
      res.status(401).json({ error: 'Invalid OTP' });
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
