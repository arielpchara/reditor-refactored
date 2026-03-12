import express from 'express';
import https from 'https';
import http from 'http';
import path from 'path';
import fs from 'fs';
import selfsigned from 'selfsigned';
import { ServerConfig } from './types';
import { registerRoutes } from './routes';

export const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.resolve(process.cwd(), 'web')));
  registerRoutes(app);
  return app;
};

const resolveTlsOptions = async (
  config: ServerConfig,
): Promise<{ key: string; cert: string }> => {
  if (config.certPath && config.keyPath) {
    return {
      cert: fs.readFileSync(config.certPath, 'utf8'),
      key: fs.readFileSync(config.keyPath, 'utf8'),
    };
  }
  // Generate a self-signed certificate for development
  const attrs = [{ name: 'commonName', value: config.host }];
  const pems = await selfsigned.generate(attrs, { algorithm: 'sha256' });
  return { key: pems.private, cert: pems.cert };
};

export const startServer = (
  config: ServerConfig,
): Promise<http.Server | https.Server> =>
  new Promise((resolve, reject) => {
    const app = createApp();

    if (config.useTls) {
      resolveTlsOptions(config)
        .then((tlsOptions) => {
          const server = https.createServer(tlsOptions, app);
          server.listen(config.port, config.host, () => {
            console.log(`Server running at https://${config.host}:${config.port}`);
            resolve(server);
          });
          server.on('error', reject);
        })
        .catch(reject);
    } else {
      const server = http.createServer(app);
      server.listen(config.port, config.host, () => {
        console.log(`Server running at http://${config.host}:${config.port}`);
        resolve(server);
      });
      server.on('error', reject);
    }
  });
