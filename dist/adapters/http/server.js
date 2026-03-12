"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const selfsigned_1 = __importDefault(require("selfsigned"));
const routes_1 = require("./routes");
const logger_1 = require("../logger");
const createApp = (config) => {
    logger_1.logger.info('Initialising Express app', { useTls: config.useTls, file: config.file });
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // Resolve the browser UI assets directory.
    // When compiled (dist/adapters/http/server.js): go up two levels → dist/web/
    // When ts-node (src/adapters/http/server.ts):   use process.cwd()/dist/web
    const webDir = __filename.endsWith('.ts')
        ? path_1.default.resolve(process.cwd(), 'dist/web')
        : path_1.default.resolve(__dirname, '../../web');
    app.use(express_1.default.static(webDir));
    // HTTP access log — every inbound request
    app.use((req, _res, next) => {
        logger_1.logger.info('Incoming request', { method: req.method, path: req.path, ip: req.ip });
        next();
    });
    (0, routes_1.registerRoutes)(app, config);
    return app;
};
exports.createApp = createApp;
const resolveTlsOptions = async (config) => {
    if (config.certPath && config.keyPath) {
        logger_1.logger.info('Using configured TLS certificate and key', {
            certPath: config.certPath,
            keyPath: config.keyPath,
        });
        return {
            cert: fs_1.default.readFileSync(config.certPath, 'utf8'),
            key: fs_1.default.readFileSync(config.keyPath, 'utf8'),
        };
    }
    // Generate a self-signed certificate for development
    logger_1.logger.info('No TLS cert configured; generating self-signed certificate for development');
    const attrs = [{ name: 'commonName', value: config.host }];
    const pems = await selfsigned_1.default.generate(attrs, { algorithm: 'sha256' });
    return { key: pems.private, cert: pems.cert };
};
const startServer = (config) => new Promise((resolve, reject) => {
    const app = (0, exports.createApp)(config);
    if (config.useTls) {
        resolveTlsOptions(config)
            .then((tlsOptions) => {
            const server = https_1.default.createServer(tlsOptions, app);
            server.listen(config.port, config.host, () => {
                logger_1.logger.info('Server listening', {
                    protocol: 'https',
                    host: config.host,
                    port: config.port,
                });
                resolve(server);
            });
            server.on('error', reject);
        })
            .catch((err) => {
            logger_1.logger.error('Failed to resolve TLS options', { error: err.message, stack: err.stack });
            reject(err);
        });
    }
    else {
        const server = http_1.default.createServer(app);
        server.listen(config.port, config.host, () => {
            logger_1.logger.info('Server listening', {
                protocol: 'http',
                host: config.host,
                port: config.port,
            });
            resolve(server);
        });
        server.on('error', reject);
    }
});
exports.startServer = startServer;
//# sourceMappingURL=server.js.map