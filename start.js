import { createApplication } from './app.js';
import { loadSchemas } from './app/validation.js';
import { loadConfig } from './config.js';
import { openDatabase } from './db.js';
import { startServer } from './server.js';

export default async function start() {
  const config = await loadConfig();
  await loadSchemas(config);
  const db = await openDatabase(config);
  const app = createApplication(config, db);
  await startServer(config, app);
}
