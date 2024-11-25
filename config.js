import { identity, isInteger } from 'lodash-es';
import log4js from 'log4js';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const logLevels = ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

export const root = dirname(fileURLToPath(import.meta.url));

// eslint-disable-next-line max-lines-per-function
export async function loadConfig() {
  await loadDotenv();

  const environment = process.env.NODE_ENV ?? 'development';

  const dbFile = resolvePath(
    root,
    parseEnvironmentString('REVPROD_DB_FILE', 'db.json')
  );

  const host = parseEnvironmentString('REVPROD_LISTEN_HOST', '0.0.0.0');
  const port = parseEnvironmentPort('REVPROD_LISTEN_PORT', 3000);

  const logLevel = parseEnvironmentEnum(
    'REVPROD_LOG_LEVEL',
    logLevels,
    environment === 'production' ? 'DEBUG' : 'TRACE',
    value => value.toUpperCase()
  );

  const cors = parseEnvironmentBoolean('REVPROD_CORS', false);
  const corsOrigins = parseEnvironmentString(
    'REVPROD_CORS_ORIGINS',
    [],
    origins => origins.split(',')
  );

  const title = parseEnvironmentString(
    'REVPROD_TITLE',
    'The Revolutionary Product'
  );
  const landingPageBaseUrl = parseEnvironmentString(
    'REVPROD_LANDING_PAGE_BASE_URL',
    ''
  );

  function createLogger(category) {
    const newLogger = log4js.getLogger(category);
    newLogger.level = logLevel;
    return newLogger;
  }

  const logger = createLogger('config');
  logger.info(`Environment: ${environment}`);
  logger.info(`Log level: ${logLevel}`);
  logger.info(`CORS enabled: ${cors}`);
  logger.info(
    `CORS allowed origins: ${
      corsOrigins.length === 0 ? 'all' : corsOrigins.join(', ')
    }`
  );

  return {
    // Paths
    dbFile,
    // Environment,
    env: environment,
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
  } catch {
    // Ignore
  }

  if (dotenv) {
    dotenv.config();
  }
}

function getEnvironmentString(variableName, required = true) {
  const value = process.env[variableName];
  if (required && value === undefined) {
    throw new Error(`$${variableName} is required`);
  }

  return value;
}

function parseEnvironmentBoolean(variableName, defaultValue) {
  const value = getEnvironmentString(variableName, defaultValue === undefined);
  if (value === undefined) {
    return defaultValue;
  } else if (/^(?:1|y|yes|t|true)$/u.test(value)) {
    return true;
  } else if (/^(?:0|n|no|f|false)$/u.test(value)) {
    return false;
  }

  throw new Error(
    `$${variableName} must be a boolean, but its value is ${JSON.stringify(
      value
    )}`
  );
}

function parseEnvironmentEnum(
  variableName,
  allowedValues,
  defaultValue,
  coerce = identity
) {
  const value = getEnvironmentString(variableName, defaultValue === undefined);
  if (value === undefined) {
    return defaultValue;
  }

  const coerced = coerce(value);
  if (!allowedValues.includes(coerced)) {
    throw new Error(
      `$${variableName} must be one of ${allowedValues
        .map(allowed => JSON.stringify(allowed))
        .join(', ')}, but its value is ${JSON.stringify(coerced)}`
    );
  }

  return coerced;
}

function parseEnvironmentInt(variableName, defaultValue, min, max) {
  const value = getEnvironmentString(variableName, defaultValue === undefined);
  if (value === undefined) {
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);
  if (
    !isInteger(parsed) ||
    (min !== undefined && value < min) ||
    (max !== undefined && value > max)
  ) {
    throw new Error(
      `$${variableName} must be an integer between ${min ?? '-Infinity'} and ${
        max ?? 'Infinity'
      }, but its value is ${JSON.stringify(value)}`
    );
  }

  return parsed;
}

function parseEnvironmentPort(variableName, defaultValue) {
  return parseEnvironmentInt(variableName, defaultValue, 1, 65_535);
}

function parseEnvironmentString(variableName, defaultValue, coerce = identity) {
  const value = getEnvironmentString(variableName, defaultValue === undefined);
  if (value === undefined) {
    return defaultValue;
  }

  return coerce(value);
}
