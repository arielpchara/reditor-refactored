import { Request, Response, NextFunction } from 'express';
import { AppConfig } from '../../config/types';
export declare const makeAuthMiddleware: (config: AppConfig) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map