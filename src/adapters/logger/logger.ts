import fs from 'fs';
import path from 'path';
import winston from 'winston';

const LOG_DIR = path.resolve(process.cwd(), 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

const LOG_FILE_ID = new Date().toISOString().replace(/[:.]/g, '-');
export const logFilePath = path.join(LOG_DIR, `reditor-${LOG_FILE_ID}.log`);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaSuffix = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaSuffix}`;
  }),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: logFilePath,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});
