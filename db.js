import { DateTime } from 'luxon';
import { readFile, writeFile } from 'node:fs/promises';

const maxComments = 5;

let dbPromise;
let dbOpen = false;

export async function openDatabase({ dbFile }) {
  if (dbOpen) {
    throw new Error('Database is already open');
  }

  dbOpen = true;

  try {
    const dbContents = await readFile(dbFile, 'utf8');
    const dbData = JSON.parse(dbContents);
    dbPromise = Promise.resolve({ file: dbFile, data: dbData });
  } catch (err) {
    if (err.code === 'ENOENT') {
      dbPromise = Promise.resolve({
        file: dbFile,
        data: createBlankDatabase()
      });
      return;
    }

    throw err;
  }
}

function createBlankDatabase() {
  return {
    comments: []
  };
}

export async function createComment({ name, text }) {
  const db = await dbPromise;

  const comment = { name, text, date: DateTime.now() };
  db.data.comments.push(serializeComment(comment));
  if (db.data.comments.length > maxComments) {
    db.data.comments.splice(0, db.data.comments.length - maxComments);
  }

  await saveDatabase();

  return comment;
}

export async function getComments() {
  const db = await dbPromise;
  return db.data.comments.map(comment => deserializeComment(comment));
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

async function saveDatabase() {
  const db = await dbPromise;
  await writeFile(db.file, JSON.stringify(db.data), 'utf8');
}
