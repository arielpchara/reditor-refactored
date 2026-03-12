import { Express } from 'express';
import { healthHandler } from './handlers';

export const registerRoutes = (app: Express): void => {
  app.get('/health', healthHandler);
};
