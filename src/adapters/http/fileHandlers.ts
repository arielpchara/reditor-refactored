import { Request, Response } from 'express';
import { AppConfig } from '../../config/types';
import { readAbsoluteFile } from '../../core/files';
import { RouteHandler } from './types';
import { logger } from '../logger';

export const makeFileHandler = (config: AppConfig): RouteHandler => {
  return (_req: Request, res: Response): void => {
    const result = readAbsoluteFile(config.file);

    if (!result.ok) {
      const { error } = result;
      switch (error.kind) {
        case 'NOT_FOUND':
          logger.warn('Configured file not found when handling /file request', {
            file: error.path,
          });
          res.status(404).json({ error: `File not found: ${error.path}` });
          return;
        case 'NOT_ASCII':
          logger.warn('Configured file is not ASCII-encoded', { file: error.path });
          res.status(422).json({ error: 'File is not ASCII-encoded' });
          return;
        case 'TOO_LARGE':
          logger.warn('Configured file exceeds size limit', {
            file: error.path,
            sizeBytes: error.sizeBytes,
            maxBytes: error.maxBytes,
          });
          res.status(413).json({
            error: `File too large for editor (${error.sizeBytes} bytes, max ${error.maxBytes} bytes)`,
          });
          return;
        case 'IS_DIRECTORY':
          logger.warn('Configured file path is a directory', { file: error.path });
          res.status(422).json({ error: 'Path points to a directory, not a file' });
          return;
        case 'READ_ERROR':
          logger.error('Failed to read configured file', {
            file: error.path,
            error: error.message,
          });
          res.status(500).json({ error: `Could not read file: ${error.message}` });
          return;
        case 'PATH_TRAVERSAL':
          logger.error('Unexpected path traversal error for absolute configured file', {
            file: error.path,
          });
          res.status(500).json({ error: 'Internal configuration error' });
          return;
      }
    }

    logger.info('Served configured file content', {
      file: config.file,
      sizeBytes: result.file.sizeBytes,
    });
    res.type('text/plain').send(result.file.content);
  };
};
