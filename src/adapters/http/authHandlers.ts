import { Request, Response } from 'express';
import { AppConfig } from '../../config/types';
import { buildTokenResult } from '../../core/security/jwt';
import { RouteHandler } from './types';

export const makeExchangeTokenHandler = (config: AppConfig): RouteHandler => {
  return (req: Request, res: Response): void => {
    if (!config.securityEnabled || !config.otp) {
      res.status(403).json({ error: 'Security is not enabled' });
      return;
    }

    const { otp } = req.body as { otp: string };

    if (!otp || otp !== config.otp) {
      res.status(401).json({ error: 'Invalid OTP' });
      return;
    }

    if (!config.jwtPrivateKey) {
      res.status(500).json({ error: 'Signing key not available' });
      return;
    }

    const result = buildTokenResult(
      { privateKey: config.jwtPrivateKey, publicKey: config.jwtPublicKey ?? '' },
      config.tokenTtl,
    );

    res.json(result);
  };
};
