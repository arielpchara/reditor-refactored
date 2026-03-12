"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAuthMiddleware = void 0;
const jwt_1 = require("../../core/security/jwt");
const logger_1 = require("../logger");
const makeAuthMiddleware = (config) => (req, res, next) => {
    if (!config.securityEnabled) {
        next();
        return;
    }
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
        logger_1.logger.warn('Request blocked: missing or malformed Authorization header', {
            path: req.path,
            ip: req.ip,
        });
        res.status(401).json({ error: 'Authorization header missing or malformed' });
        return;
    }
    const token = authHeader.slice(7);
    const result = (0, jwt_1.verifyToken)(token, config.jwtPublicKey ?? '');
    if (!result.ok) {
        logger_1.logger.warn('Request blocked: invalid or expired JWT token', {
            path: req.path,
            ip: req.ip,
        });
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
    logger_1.logger.debug('Request authorized via JWT', { path: req.path, ip: req.ip });
    next();
};
exports.makeAuthMiddleware = makeAuthMiddleware;
//# sourceMappingURL=authMiddleware.js.map