import { AppConfig } from '../../config/types';
import { RouteHandler } from './types';
export declare const MAX_OTP_ATTEMPTS = 3;
type ExchangeHandlerDeps = {
    exit?: (code: number) => void;
};
export declare const makeExchangeTokenHandler: (config: AppConfig, deps?: ExchangeHandlerDeps) => RouteHandler;
export {};
//# sourceMappingURL=authHandlers.d.ts.map