import { identity, isInteger } from 'lodash-es';
import log4js from 'log4js';
import { dirname, resolve as resolvePath } from 'path';
import { fileURLToPath } from 'url';

const logLevels = ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

export const root = dirname(fileURLToPath(import.meta.url));

export async function loadConfig() {
  await loadDotenv();

  const env = process.env.NODE_ENV ?? 'development';

  const dbFile = resolvePath(
    root,
    parseEnvString('REVPROD_DB_FILE', 'db.json')
  );

  const host = parseEnvString('REVPROD_LISTEN_HOST', '0.0.0.0');
  const port = parseEnvPort('REVPROD_LISTEN_PORT', 3000);

  const logLevel = parseEnvEnum(
    'REVPROD_LOG_LEVEL',
    logLevels,
    env === 'production' ? 'DEBUG' : 'TRACE',
    value => value.toUpperCase()
  );

  const cors = parseEnvBoolean('REVPROD_CORS', false);
  const corsOrigins = parseEnvString('REVPROD_CORS_ORIGINS', [], origins =>
    origins.split(',')
  );

  const title = parseEnvString('REVPROD_TITLE', 'The Revolutionary Product');
  const landingPageBaseUrl = parseEnvString(
    'REVPROD_LANDING_PAGE_BASE_URL',
    ''
  );

  function createLogger(category) {
    const newLogger = log4js.getLogger(category);
    newLogger.level = logLevel;
    return newLogger;
  }

  const logger = createLogger('config');
  logger.info(`Environment: ${env}`);
  logger.info(`Log level: ${logLevel}`);
  logger.info(`CORS enabled: ${cors}`);
  logger.info(
    `CORS allowed origins: ${
      corsOrigins.length ? corsOrigins.join(', ') : 'all'
    }`
  );

  return {
    // Paths
    dbFile,
    // Environment,
    env,
    // Server
    host,
    port,
    // Security
    cors,
    corsOrigins,
    // Application
    title,
    landingPageBaseUrl,
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

function parseEnvBoolean(varName, defaultValue) {
  const value = getEnvString(varName, defaultValue === undefined);
  if (value === undefined) {
    return defaultValue;
  } else if (value.match(/^(?:1|y|yes|t|true)$/u)) {
    return true;
  } else if (value.match(/^(?:0|n|no|f|false)$/u)) {
    return false;
  } else {
    throw new Error(
      `$${varName} must be a boolean, but its value is ${JSON.stringify(value)}`
    );
  }
}

function parseEnvEnum(varName, allowedValues, defaultValue, coerce = identity) {
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

function parseEnvString(varName, defaultValue, coerce = identity) {
  const value = getEnvString(varName, defaultValue === undefined);
  if (value === undefined) {
    return defaultValue;
  }

  return coerce(value);
}
