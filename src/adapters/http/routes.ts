import { Express } from 'express';
import { AppConfig } from '../../config/types';
import { logger } from '../logger';
import { makeHealthHandler } from './handlers';
import { makeExchangeTokenHandler } from './authHandlers';
import { makeFileHandler } from './fileHandlers';
import { makeFileSaveHandler } from './fileSaveHandler';
import { makeFileMetaHandler } from './fileMetaHandler';
import { makeAuthMiddleware } from './authMiddleware';

export const registerRoutes = (app: Express, config: AppConfig): void => {
  app.get('/health', makeHealthHandler(config));
  logger.info('Registered route: GET /health');

  if (config.securityEnabled) {
    app.post('/auth/exchange-token', makeExchangeTokenHandler(config));
    logger.info('Registered route: POST /auth/exchange-token (security enabled)');
  }

  const auth = makeAuthMiddleware(config);

  app.get('/file-meta', auth, makeFileMetaHandler(config));
  logger.info('Registered route: GET /file-meta', { authRequired: config.securityEnabled });

  app.get('/file', auth, makeFileHandler(config));
  logger.info('Registered route: GET /file', {
    authRequired: config.securityEnabled,
    file: config.file,
  });

  app.put('/file', auth, makeFileSaveHandler(config));
  logger.info('Registered route: PUT /file', { authRequired: config.securityEnabled });
};
