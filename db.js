import Loki from 'lokijs';

export function openDatabase(config) {
  return new Promise((resolve, reject) => {
    const db = new Loki(config.dbFile, {
      autoload: true,
      autoloadCallback: initializeDatabase,
      autosave: true,
      autosaveInterval: 0
    });

    const logger = config.createLogger('db');

    function initializeDatabase(err) {
      if (err) {
        return reject(err);
      }

      ensureCollection(db, 'users', logger, { unique: ['name'] });
      ensureCollection(db, 'donations', logger);

      logger.info(`Opened database file ${config.dbFile}`);
      resolve(db);
    }
  });
}

export function closeDatabase(db) {
  return new Promise((resolve, reject) =>
    db.close(err => (err ? reject(err) : resolve()))
  );
}

function ensureCollection(db, name, logger, options = {}) {
  if (!db.getCollection(name)) {
    db.addCollection(name, options);
    logger.debug(`Created database collection ${name}`);
  }
}
