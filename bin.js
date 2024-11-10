#!/usr/bin/env node
import chalk from 'chalk';

import start from './start.js';

try {
  await start();
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(chalk.red(err.stack));
  process.exit(1);
}
