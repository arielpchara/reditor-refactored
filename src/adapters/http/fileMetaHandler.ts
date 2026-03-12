import path from 'path';
import { Request, Response } from 'express';
import { AppConfig } from '../../config/types';
import { RouteHandler } from './types';
import { logger } from '../logger';

export const makeFileMetaHandler = (config: AppConfig): RouteHandler => {
  return (_req: Request, res: Response): void => {
    const filename = path.basename(config.file);
    logger.debug('Served file metadata', { filename });
    res.json({ filename });
  };
};
