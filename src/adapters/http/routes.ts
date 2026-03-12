import { Express } from 'express';
import { AppConfig } from '../../config/types';
import { healthHandler } from './handlers';
import { makeExchangeTokenHandler } from './authHandlers';
import { makeFileHandler } from './fileHandlers';
import { makeAuthMiddleware } from './authMiddleware';

export const registerRoutes = (app: Express, config: AppConfig): void => {
  app.get('/health', healthHandler);

  if (config.securityEnabled) {
    app.post('/auth/exchange-token', makeExchangeTokenHandler(config));
  }

  const auth = makeAuthMiddleware(config);
  app.get('/file', auth, makeFileHandler(config));
};
