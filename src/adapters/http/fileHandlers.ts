import { Request, Response } from 'express';
import { AppConfig } from '../../config/types';
import { readFile } from '../../core/files';
import { RouteHandler } from './types';

export const makeFileHandler = (config: AppConfig): RouteHandler => {
  return (req: Request, res: Response): void => {
    const relativePath = req.query['path'];

    if (!relativePath || typeof relativePath !== 'string') {
      res.status(400).json({ error: 'Query parameter "path" is required' });
      return;
    }

    const result = readFile(config.root, relativePath);

    if (!result.ok) {
      const { error } = result;
      switch (error.kind) {
        case 'NOT_FOUND':
          res.status(404).json({ error: `File not found: ${error.path}` });
          return;
        case 'PATH_TRAVERSAL':
          res.status(403).json({ error: 'Access denied: path traversal detected' });
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
      }
    }

    res.type('text/plain').send(result.file.content);
  };
};
