import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import glob from 'fast-glob';
import { readFile } from 'fs/promises';
import { basename, join as joinPath } from 'path';

import { root } from '../config.js';

const ajv = new Ajv({
  allErrors: true
});

ajvErrors(ajv);

export async function loadSchemas(config) {
  const logger = config.createLogger('validation');
  for (const file of await findSchemas(logger)) {
    const { name, schema } = await loadSchema(file);
    ajv.addSchema(schema, name);
    logger.trace(`Loaded "${name}" JSON schema from ${file}`);
  }
}

export function getValidationErrors(data, schemaName) {
  const validate = getSchema(schemaName);
  if (!validate(data)) {
    return validate.errors;
  }
}

async function findSchemas(logger) {
  const appSchemaFiles = await glob('app/**/*.schema.json', {
    cwd: root
  });

  logger.trace(
    `Found ${appSchemaFiles.length} JSON schema(s) in application directory`
  );

  return appSchemaFiles;
}

function getSchema(name) {
  const schema = ajv.getSchema(name);
  if (!schema) {
    throw new Error(`JSON schema named ${JSON.stringify(name)} not found`);
  }

  return schema;
}

async function loadSchema(file) {
  const schemaName = basename(file).replace(/\..*$/, '');
  if (ajv.getSchema(schemaName)) {
    throw new Error(
      `JSON schema ${schemaName} (from file ${file}) has already been defined`
    );
  }

  const absolutePath = joinPath(root, file);
  return {
    name: schemaName,
    schema: JSON.parse(await readFile(absolutePath, 'utf8'))
  };
}
