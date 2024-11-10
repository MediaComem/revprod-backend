import { loadSchemas } from './app/validation.js';
import { createApplication } from './app.js';
import { loadConfig } from './config.js';
import { openDatabase } from './db.js';
import { startServer } from './server.js';

export default async function start() {
  const config = await loadConfig();
  await loadSchemas(config);
  const database = await openDatabase(config);
  const app = createApplication(config, database);
  await startServer(config, app);
}
