import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import selfsigned from 'selfsigned';
import { AppConfig } from '../../config/types';
import { registerRoutes } from './routes';
import { logger } from '../logger';
import { createStaticHandler } from './staticHandler';

export const createApp = (config: AppConfig) => {
  logger.info('Initialising Express app', { useTls: config.useTls, file: config.file });
  const app = express();
  app.use(express.json());
  app.use(createStaticHandler());

  // HTTP access log — every inbound request
  app.use((req, _res, next) => {
    logger.info('Incoming request', { method: req.method, path: req.path, ip: req.ip });
    next();
  });

  registerRoutes(app, config);
  return app;
};

const resolveTlsOptions = async (config: AppConfig): Promise<{ key: string; cert: string }> => {
  if (config.certPath && config.keyPath) {
    logger.info('Using configured TLS certificate and key', {
      certPath: config.certPath,
      keyPath: config.keyPath,
    });
    return {
      cert: fs.readFileSync(config.certPath, 'utf8'),
      key: fs.readFileSync(config.keyPath, 'utf8'),
    };
  }
  // Generate a self-signed certificate for development
  logger.info('No TLS cert configured; generating self-signed certificate for development');
  const attrs = [{ name: 'commonName', value: config.host }];
  const pems = await selfsigned.generate(attrs, { algorithm: 'sha256' });
  return { key: pems.private, cert: pems.cert };
};

export const startServer = (config: AppConfig): Promise<http.Server | https.Server> =>
  new Promise((resolve, reject) => {
    const app = createApp(config);

    if (config.useTls) {
      resolveTlsOptions(config)
        .then((tlsOptions) => {
          const server = https.createServer(tlsOptions, app);
          server.listen(config.port, config.host, () => {
            logger.info('Server listening', {
              protocol: 'https',
              host: config.host,
              port: config.port,
            });
            resolve(server);
          });
          server.on('error', reject);
        })
        .catch((err: Error) => {
          logger.error('Failed to resolve TLS options', { error: err.message, stack: err.stack });
          reject(err);
        });
    } else {
      const server = http.createServer(app);
      server.listen(config.port, config.host, () => {
        logger.info('Server listening', {
          protocol: 'http',
          host: config.host,
          port: config.port,
        });
        resolve(server);
      });
      server.on('error', reject);
    }
  });
