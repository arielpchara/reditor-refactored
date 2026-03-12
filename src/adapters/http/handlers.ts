import { Request, Response } from 'express';
import { logger } from '../logger';

export const healthHandler = (_req: Request, res: Response): void => {
  logger.debug('Health check requested');
  res.json({ status: 'ok' });
};
