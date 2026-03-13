import express, { RequestHandler } from 'express';
import path from 'path';
import { logger } from '../logger';

/**
 * Resolves the absolute path to dist/web/ regardless of how the program
 * is invoked:
 *
 *   - esbuild bundle (dist/bin.js)  → __dirname is dist/  → dist/web/
 *   - ts-node dev (src/…/file.ts)   → use process.cwd()/dist/web
 */
const resolveWebDir = (): string =>
  __filename.endsWith('.ts')
    ? path.resolve(process.cwd(), 'dist/web')
    : path.resolve(__dirname, 'web');

export function createStaticHandler(): RequestHandler {
  const webDir = resolveWebDir();
  logger.info('Serving static files', { webDir });
  return express.static(webDir);
}
