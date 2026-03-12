"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthHandler = void 0;
const logger_1 = require("../logger");
const healthHandler = (_req, res) => {
    logger_1.logger.debug('Health check requested');
    res.json({ status: 'ok' });
};
exports.healthHandler = healthHandler;
//# sourceMappingURL=handlers.js.map