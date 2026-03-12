import { Express } from 'express';
import { AppConfig } from '../../config/types';
import { healthHandler } from './handlers';
import { makeExchangeTokenHandler } from './authHandlers';

export const registerRoutes = (app: Express, config: AppConfig): void => {
  app.get('/health', healthHandler);
  if (config.securityEnabled) {
    app.post('/auth/exchange-token', makeExchangeTokenHandler(config));
  }
};
