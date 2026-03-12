"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFileHandler = void 0;
const path_1 = __importDefault(require("path"));
const files_1 = require("../../core/files");
const logger_1 = require("../logger");
const makeFileHandler = (config) => {
    return (_req, res) => {
        const result = (0, files_1.readFile)(path_1.default.dirname(config.file), path_1.default.basename(config.file));
        if (!result.ok) {
            const { error } = result;
            switch (error.kind) {
                case 'NOT_FOUND':
                    logger_1.logger.warn('Configured file not found when handling /file request', {
                        file: error.path,
                    });
                    res.status(404).json({ error: `File not found: ${error.path}` });
                    return;
                case 'NOT_TEXT':
                    logger_1.logger.warn('Configured file is not readable as text', { file: error.path });
                    res.status(422).json({ error: 'File is not readable as text' });
                    return;
                case 'TOO_LARGE':
                    logger_1.logger.warn('Configured file exceeds size limit', {
                        file: error.path,
                        sizeBytes: error.sizeBytes,
                        maxBytes: error.maxBytes,
                    });
                    res.status(413).json({
                        error: `File too large for editor (${error.sizeBytes} bytes, max ${error.maxBytes} bytes)`,
                    });
                    return;
                case 'IS_DIRECTORY':
                    logger_1.logger.warn('Configured file path is a directory', { file: error.path });
                    res.status(422).json({ error: 'Path points to a directory, not a file' });
                    return;
                case 'READ_ERROR':
                    logger_1.logger.error('Failed to read configured file', {
                        file: error.path,
                        error: error.message,
                    });
                    res.status(500).json({ error: `Could not read file: ${error.message}` });
                    return;
                case 'PATH_TRAVERSAL':
                    logger_1.logger.error('Path traversal detected for configured file', { file: error.path });
                    res.status(500).json({ error: 'Internal configuration error' });
                    return;
            }
        }
        logger_1.logger.info('Served configured file content', {
            file: config.file,
            sizeBytes: result.file.sizeBytes,
        });
        res.type('text/plain').send(result.file.content);
    };
};
exports.makeFileHandler = makeFileHandler;
//# sourceMappingURL=fileHandlers.js.map