import https from 'https';
import http from 'http';
import { AppConfig } from '../../config/types';
export declare const createApp: (config: AppConfig) => import("express-serve-static-core").Express;
export declare const startServer: (config: AppConfig) => Promise<http.Server | https.Server>;
//# sourceMappingURL=server.d.ts.map