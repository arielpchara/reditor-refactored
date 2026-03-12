import { Request, Response } from 'express';
import { AppConfig } from '../../config/types';
import { readAbsoluteFile } from '../../core/files';
import { RouteHandler } from './types';

export const makeFileHandler = (config: AppConfig): RouteHandler => {
  return (_req: Request, res: Response): void => {
    const result = readAbsoluteFile(config.file);

    if (!result.ok) {
      const { error } = result;
      switch (error.kind) {
        case 'NOT_FOUND':
          res.status(404).json({ error: `File not found: ${error.path}` });
          return;
        case 'NOT_ASCII':
          res.status(422).json({ error: 'File is not ASCII-encoded' });
          return;
        case 'TOO_LARGE':
          res.status(413).json({
            error: `File too large for editor (${error.sizeBytes} bytes, max ${error.maxBytes} bytes)`,
          });
          return;
        case 'IS_DIRECTORY':
          res.status(422).json({ error: 'Path points to a directory, not a file' });
          return;
        case 'READ_ERROR':
          res.status(500).json({ error: `Could not read file: ${error.message}` });
          return;
        case 'PATH_TRAVERSAL':
          res.status(500).json({ error: 'Internal configuration error' });
          return;
      }
    }

    res.type('text/plain').send(result.file.content);
  };
};
