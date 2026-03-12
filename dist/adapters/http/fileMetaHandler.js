"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFileMetaHandler = void 0;
const path_1 = __importDefault(require("path"));
const logger_1 = require("../logger");
const makeFileMetaHandler = (config) => {
    return (_req, res) => {
        const filename = path_1.default.basename(config.file);
        logger_1.logger.debug('Served file metadata', { filename });
        res.json({ filename });
    };
};
exports.makeFileMetaHandler = makeFileMetaHandler;
//# sourceMappingURL=fileMetaHandler.js.map