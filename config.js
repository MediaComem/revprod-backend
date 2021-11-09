import { isInteger } from 'lodash-es';
import log4js from 'log4js';
import { dirname, resolve as resolvePath } from 'path';
import { fileURLToPath } from 'url';

export const logLevels = ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
export const root = dirname(fileURLToPath(import.meta.url));

export async function loadConfig() {
  await loadDotenv();

  const env = process.env.NODE_ENV ?? 'development';

  const dbFile = resolvePath(
    root,
    parseEnvString('CHARITY_DB_FILE', 'db.loki')
  );
  const sessionsDir = resolvePath(
    root,
    parseEnvString('CHARITY_SESSIONS_DIR', 'sessions')
  );

  const host = parseEnvString('CHARITY_LISTEN_HOST', '0.0.0.0');
  const port = parseEnvPort('CHARITY_LISTEN_PORT', 3000);

  const logLevel = parseEnvEnum(
    'CHARITY_LOG_LEVEL',
    logLevels,
    env === 'production' ? 'DEBUG' : 'TRACE',
    value => value.toUpperCase()
  );

  const bcryptRounds = parseEnvInt('CHARITY_BCRYPT_ROUNDS', 10, 1);
  const sessionLifetime = parseEnvInt(
    'CHARITY_SESSION_LIFETIME',
    // 1 day in milliseconds
    1000 * 60 * 60 * 24,
    1
  );
  const sessionSecret = parseEnvString('CHARITY_SESSION_SECRET');

  const title = parseEnvString('CHARITY_TITLE', 'The Coriscan Charity');

  function createLogger(category) {
    const logger = log4js.getLogger(category);
    logger.level = logLevel;
    return logger;
  }

  const logger = createLogger('config');
  logger.info(`Environment: ${env}`);
  logger.info(`Log level: ${logLevel}`);

  return {
    // Paths
    dbFile,
    sessionsDir,
    // Environment,
    env,
    // Server
    host,
    port,
    // Security
    bcryptRounds,
    sessionLifetime,
    sessionSecret,
    // Other
    title,
    // Functions
    createLogger
  };
}

async function loadDotenv() {
  let dotenv;
  try {
    dotenv = await import('dotenv');
  } catch (err) {
    // Ignore
  }

  if (dotenv) {
    dotenv.config();
  }
}

function getEnvString(varName, required = true) {
  const value = process.env[varName];
  if (required && value === undefined) {
    throw new Error(`$${varName} is required`);
  }

  return value;
}

function parseEnvEnum(varName, allowedValues, defaultValue, coerce) {
  const value = getEnvString(varName, defaultValue === undefined);
  if (value === undefined) {
    return defaultValue;
  }

  const coerced = coerce(value);
  if (!allowedValues.includes(coerced)) {
    throw new Error(
      `$${varName} must be one of ${allowedValues
        .map(allowed => JSON.stringify(allowed))
        .join(', ')}, but its value is ${JSON.stringify(coerced)}`
    );
  }

  return coerced;
}

function parseEnvInt(varName, defaultValue, min, max) {
  const value = getEnvString(varName, defaultValue === undefined);
  if (value === undefined) {
    return defaultValue;
  }

  const parsed = parseInt(value, 10);
  if (
    !isInteger(parsed) ||
    (min !== undefined && value < min) ||
    (max !== undefined && value > max)
  ) {
    throw new Error(
      `$${varName} must be an integer between ${min ?? '-Infinity'} and ${
        max ?? 'Infinity'
      }, but its value is ${JSON.stringify(value)}`
    );
  }

  return parsed;
}

function parseEnvPort(varName, defaultValue) {
  return parseEnvInt(varName, defaultValue, 1, 65_535);
}

function parseEnvString(varName, defaultValue) {
  const value = getEnvString(varName, defaultValue === undefined);
  return value ?? defaultValue;
}
