import { Request, Response } from 'express';
import { AppConfig } from '../../config/types';
import { logger } from '../logger';
import { RouteHandler } from './types';

export const makeHealthHandler = (config: AppConfig): RouteHandler => {
  return (_req: Request, res: Response): void => {
    logger.debug('Health check requested');
    res.json({ status: 'ok', securityEnabled: config.securityEnabled });
  };
};
