import { Request, Response, NextFunction } from 'express';
import { AppConfig } from '../../config/types';
import { verifyToken } from '../../core/security/jwt';

export const makeAuthMiddleware =
  (config: AppConfig) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!config.securityEnabled) {
      next();
      return;
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization header missing or malformed' });
      return;
    }

    const token = authHeader.slice(7);
    const result = verifyToken(token, config.jwtPublicKey ?? '');

    if (!result.ok) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    next();
  };
