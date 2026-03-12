"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFileSaveHandler = void 0;
const files_1 = require("../../core/files");
const logger_1 = require("../logger");
const makeFileSaveHandler = (config) => {
    return (req, res) => {
        const { content } = req.body;
        if (typeof content !== 'string') {
            res.status(400).json({ error: 'Request body must contain a "content" string field' });
            return;
        }
        const result = (0, files_1.writeFile)(config.file, content);
        if (!result.ok) {
            const { error } = result;
            switch (error.kind) {
                case 'TOO_LARGE':
                    logger_1.logger.warn('Save rejected: content exceeds size limit', {
                        file: config.file,
                        sizeBytes: error.sizeBytes,
                        maxBytes: error.maxBytes,
                    });
                    res.status(413).json({
                        error: `Content too large (${error.sizeBytes} bytes, max ${error.maxBytes} bytes)`,
                    });
                    return;
                case 'WRITE_ERROR':
                    logger_1.logger.error('Failed to write file', { file: config.file, error: error.message });
                    res.status(500).json({ error: `Could not write file: ${error.message}` });
                    return;
            }
        }
        logger_1.logger.info('File saved successfully', {
            file: config.file,
            sizeBytes: Buffer.byteLength(content, 'utf8'),
        });
        res.status(204).send();
    };
};
exports.makeFileSaveHandler = makeFileSaveHandler;
//# sourceMappingURL=fileSaveHandler.js.map