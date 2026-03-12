"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const logger_1 = require("../logger");
const handlers_1 = require("./handlers");
const authHandlers_1 = require("./authHandlers");
const fileHandlers_1 = require("./fileHandlers");
const fileSaveHandler_1 = require("./fileSaveHandler");
const fileMetaHandler_1 = require("./fileMetaHandler");
const authMiddleware_1 = require("./authMiddleware");
const registerRoutes = (app, config) => {
    app.get('/health', handlers_1.healthHandler);
    logger_1.logger.info('Registered route: GET /health');
    if (config.securityEnabled) {
        app.post('/auth/exchange-token', (0, authHandlers_1.makeExchangeTokenHandler)(config));
        logger_1.logger.info('Registered route: POST /auth/exchange-token (security enabled)');
    }
    const auth = (0, authMiddleware_1.makeAuthMiddleware)(config);
    app.get('/file-meta', auth, (0, fileMetaHandler_1.makeFileMetaHandler)(config));
    logger_1.logger.info('Registered route: GET /file-meta', { authRequired: config.securityEnabled });
    app.get('/file', auth, (0, fileHandlers_1.makeFileHandler)(config));
    logger_1.logger.info('Registered route: GET /file', {
        authRequired: config.securityEnabled,
        file: config.file,
    });
    app.put('/file', auth, (0, fileSaveHandler_1.makeFileSaveHandler)(config));
    logger_1.logger.info('Registered route: PUT /file', { authRequired: config.securityEnabled });
};
exports.registerRoutes = registerRoutes;
//# sourceMappingURL=routes.js.map