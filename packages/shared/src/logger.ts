import util from "util";

const LOG_LEVEL = (process.env.LOG_LEVEL || "info") as
  | "debug"
  | "info"
  | "warn"
  | "error";

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const getCurrentLevel = (): number => LOG_LEVELS[LOG_LEVEL];

interface LogContext {
  [key: string]: unknown;
}

const formatLog = (level: string, message: string, context?: LogContext | Error) => {
  const timestamp = new Date().toISOString();
  let log = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (context) {
    let sanitized: LogContext;
    if (context instanceof Error) {
      sanitized = {
        error: context.message,
        stack: context.stack,
      };
    } else {
      // Redact sensitive fields
      sanitized = { ...context };
      ["token", "key", "secret", "password", "privateKey"].forEach((field) => {
        if (field in sanitized) {
          sanitized[field] = "[REDACTED]";
        }
      });
    }
    log += ` ${util.inspect(sanitized, { depth: 2, colors: false })}`;
  }

  return log;
};

const logger = {
  debug: (message: string, context?: LogContext) => {
    if (getCurrentLevel() <= LOG_LEVELS.debug) {
      console.log(formatLog("debug", message, context));
    }
  },

  info: (message: string, context?: LogContext) => {
    if (getCurrentLevel() <= LOG_LEVELS.info) {
      console.log(formatLog("info", message, context));
    }
  },

  warn: (message: string, context?: LogContext | Error) => {
    if (getCurrentLevel() <= LOG_LEVELS.warn) {
      console.warn(formatLog("warn", message, context));
    }
  },

  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    if (getCurrentLevel() <= LOG_LEVELS.error) {
      let errorInfo: LogContext | Error | undefined = context;

      if (error instanceof Error) {
        errorInfo = {
          ...context,
          error: error.message,
          stack: error.stack,
        };
      } else if (error) {
        errorInfo = {
          ...context,
          error,
        };
      }

      console.error(formatLog("error", message, errorInfo));
    }
  },
};

export default logger;
