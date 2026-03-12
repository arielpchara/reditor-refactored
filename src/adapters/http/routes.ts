import { Express } from 'express';
import { AppConfig } from '../../config/types';
import { logger } from '../logger';
import { healthHandler } from './handlers';
import { makeExchangeTokenHandler } from './authHandlers';
import { makeFileHandler } from './fileHandlers';
import { makeAuthMiddleware } from './authMiddleware';

export const registerRoutes = (app: Express, config: AppConfig): void => {
  app.get('/health', healthHandler);
  logger.info('Registered route: GET /health');

  if (config.securityEnabled) {
    app.post('/auth/exchange-token', makeExchangeTokenHandler(config));
    logger.info('Registered route: POST /auth/exchange-token (security enabled)');
  }

  const auth = makeAuthMiddleware(config);
  app.get('/file', auth, makeFileHandler(config));
  logger.info('Registered route: GET /file', {
    authRequired: config.securityEnabled,
    file: config.file,
  });
};
