"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeExchangeTokenHandler = exports.MAX_OTP_ATTEMPTS = void 0;
const jwt_1 = require("../../core/security/jwt");
const logger_1 = require("../logger");
exports.MAX_OTP_ATTEMPTS = 3;
const makeExchangeTokenHandler = (config, deps = {}) => {
    const exit = deps.exit ?? ((code) => process.exit(code));
    let failedAttempts = 0;
    return (req, res) => {
        if (!config.securityEnabled || !config.otp) {
            logger_1.logger.warn('Token exchange rejected because security is disabled');
            res.status(403).json({ error: 'Security is not enabled' });
            return;
        }
        const { otp } = req.body;
        if (!otp || otp !== config.otp) {
            failedAttempts += 1;
            const remaining = exports.MAX_OTP_ATTEMPTS - failedAttempts;
            logger_1.logger.warn('Token exchange rejected due to invalid OTP', {
                hasOtp: Boolean(otp),
                ip: req.ip,
                failedAttempts,
                remaining,
            });
            if (failedAttempts >= exports.MAX_OTP_ATTEMPTS) {
                logger_1.logger.error(`OTP max attempts (${exports.MAX_OTP_ATTEMPTS}) exceeded — shutting down for security`, { ip: req.ip });
                res
                    .status(401)
                    .json({ error: 'Invalid OTP. Maximum attempts exceeded — server is shutting down.' });
                // Delay exit so the response can be flushed
                setTimeout(() => exit(1), 200);
                return;
            }
            res.status(401).json({ error: 'Invalid OTP', attemptsLeft: remaining });
            return;
        }
        if (!config.jwtPrivateKey) {
            logger_1.logger.error('Token exchange failed: signing key not available');
            res.status(500).json({ error: 'Signing key not available' });
            return;
        }
        const result = (0, jwt_1.buildTokenResult)({ privateKey: config.jwtPrivateKey, publicKey: config.jwtPublicKey ?? '' }, config.tokenTtl);
        logger_1.logger.info('Token exchange succeeded', { ip: req.ip, ttlSeconds: config.tokenTtl });
        res.json(result);
    };
};
exports.makeExchangeTokenHandler = makeExchangeTokenHandler;
//# sourceMappingURL=authHandlers.js.map