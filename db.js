import { readFile, writeFile } from 'fs/promises';
import { omit } from 'lodash-es';
import { DateTime } from 'luxon';

export async function openDatabase(config) {
  try {
    const dbContents = await readFile(config.dbFile, 'utf8');
    const { comments } = JSON.parse(dbContents);
    return {
      comments: comments.map(deserializeComment),
      config
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return createBlankDatabase();
    }

    throw err;
  }
}

export async function createComment(db, { name, text }) {
  const comment = { name, text, date: DateTime.now() };
  db.comments.push(serializeComment(comment));
  await saveDatabase(db);
  return comment;
}

function createBlankDatabase(config) {
  return {
    config,
    comments: []
  };
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

async function saveDatabase(db) {
  await writeFile(db.config.dbFile, JSON.stringify(omit(db, 'config')), 'utf8');
}
