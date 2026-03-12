/**
 * Structured logger for production.
 * - In development: colorful console output
 * - In production: JSON-structured logs (compatible with log aggregators)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const isProduction = process.env.NODE_ENV === 'production';
const minLevel = isProduction ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    if (isProduction) {
        // JSON structured log for production
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            ...meta,
        });
    }

    // Pretty console for development
    const timestamp = new Date().toISOString().slice(11, 23);
    const prefix = `[${timestamp}] ${level.toUpperCase().padEnd(5)}`;
    if (meta && Object.keys(meta).length > 0) {
        return `${prefix} ${message} ${JSON.stringify(meta)}`;
    }
    return `${prefix} ${message}`;
}

export const logger = {
    debug(message: string, meta?: Record<string, unknown>) {
        if (shouldLog('debug')) console.debug(formatMessage('debug', message, meta));
    },

    info(message: string, meta?: Record<string, unknown>) {
        if (shouldLog('info')) console.info(formatMessage('info', message, meta));
    },

    warn(message: string, meta?: Record<string, unknown>) {
        if (shouldLog('warn')) console.warn(formatMessage('warn', message, meta));
    },

    error(message: string, error?: unknown, meta?: Record<string, unknown>) {
        if (!shouldLog('error')) return;

        const errorMeta: Record<string, unknown> = { ...meta };
        if (error instanceof Error) {
            errorMeta.errorName = error.name;
            errorMeta.errorMessage = error.message;
            if (!isProduction) errorMeta.stack = error.stack;
        } else if (error !== undefined) {
            errorMeta.errorRaw = String(error);
        }

        console.error(formatMessage('error', message, errorMeta));
    },
};

export default logger;
