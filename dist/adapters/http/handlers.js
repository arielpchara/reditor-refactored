"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHealthHandler = void 0;
const logger_1 = require("../logger");
const makeHealthHandler = (config) => {
    return (_req, res) => {
        logger_1.logger.debug('Health check requested');
        res.json({ status: 'ok', securityEnabled: config.securityEnabled });
    };
};
exports.makeHealthHandler = makeHealthHandler;
//# sourceMappingURL=handlers.js.map