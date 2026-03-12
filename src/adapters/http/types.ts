import { AppConfig } from '../../config/types';
import { Request, Response } from 'express';

export type RouteHandler = (req: Request, res: Response) => void;

export type ServerConfig = Pick<AppConfig, 'port' | 'host' | 'useTls' | 'certPath' | 'keyPath'>;
