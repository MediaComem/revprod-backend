import { readFile, writeFile } from 'fs/promises';
import { DateTime } from 'luxon';

const maxComments = 5;

let db;
let dbFile;

export async function openDatabase(config) {
  if (db) {
    throw new Error('Database is already open');
  }

  try {
    const dbContents = await readFile(config.dbFile, 'utf8');
    const { comments } = JSON.parse(dbContents);
    dbFile = config.dbFile;
    db = { comments };
  } catch (err) {
    if (err.code === 'ENOENT') {
      dbFile = config.dbFile;
      db = createBlankDatabase();
      return;
    }

    throw err;
  }
}

function createBlankDatabase(config) {
  return {
    comments: []
  };
}

export async function createComment({ name, text }) {
  ensureDatabase();

  const comment = { name, text, date: DateTime.now() };
  db.comments.push(serializeComment(comment));
  if (db.comments.length > maxComments) {
    db.comments.splice(0, db.comments.length - maxComments);
  }

  await saveDatabase();

  return comment;
}

export async function getComments() {
  ensureDatabase();
  return Promise.resolve(db.comments.map(deserializeComment));
}

function deserializeComment({ date, ...rest }) {
  return {
    ...rest,
    date: DateTime.fromISO(date)
  };
}

function serializeComment({ date, ...rest }) {
  return {
    ...rest,
    date: date.toISO()
  };
}

function ensureDatabase() {
  if (!dbFile) {
    throw new Error('Database file is not set');
  } else if (!db) {
    throw new Error('Database file has not been loaded');
  }
}

async function saveDatabase() {
  ensureDatabase();
  await writeFile(dbFile, JSON.stringify(db), 'utf8');
}
