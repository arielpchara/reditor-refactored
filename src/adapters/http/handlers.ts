import { Request, Response } from 'express';

export const healthHandler = (_req: Request, res: Response): void => {
  res.json({ status: 'ok' });
};
