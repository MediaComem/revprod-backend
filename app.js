import chalk from 'chalk';
import connectFlash from 'connect-flash';
import express from 'express';
import createError from 'http-errors';
import log4js from 'log4js';
import { join as joinPath } from 'path';
import session from 'express-session';
import sessionFileStoreFactory from 'session-file-store';

import { root } from './config.js';
import { getRequestId, requestLogger } from './app/express.js';
import router from './app/routes.js';

const SessionFileStore = sessionFileStoreFactory(session);

export function createApplication(config, db) {
  const app = express();
  const logger = config.createLogger('express');

  app.set('config', config);
  app.set('db', db);
  app.set('env', config.env);
  app.set('port', config.port);

  // Use https://pugjs.org for templates.
  app.set('views', joinPath(root, 'app'));
  app.set('view engine', 'pug');

  const reqLogger = config.createLogger('req');

  // Generate a request ID and create a logger for each request.
  app.use(requestLogger());

  // Log requests.
  app.use(
    log4js.connectLogger(reqLogger, {
      level: 'DEBUG',
      format: (req, res, format) =>
        format(
          `${chalk.gray(
            `[${getRequestId(req)}]`
          )} - :remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"`
        )
    })
  );

  // Parse form data.
  app.use(express.urlencoded({ extended: false }));

  // Serve static files from the public directory.
  app.use(express.static(joinPath(root, 'public')));

  // Manage sessions with https://github.com/expressjs/session#readme.
  const secureCookies = config.env === 'production';
  logger.info(`Secure cookies: ${secureCookies ? 'enabled' : 'disabled'}`);

  const encryptedSessionStorage = config.env === 'production';
  logger.info(
    `Session storage encryption: ${
      encryptedSessionStorage ? 'enabled' : 'disabled'
    }`
  );

  app.use(
    session({
      cookie: {
        maxAge: config.sessionLifetime,
        secure: secureCookies
      },
      resave: true,
      saveUninitialized: true,
      secret: config.sessionSecret,
      // Store sessions in files with
      // https://github.com/valery-barysok/session-file-store#readme.
      store: new SessionFileStore({
        path: config.sessionsDir,
        logFn: (...args) => logger.debug(...args),
        secret: encryptedSessionStorage ? config.sessionSecret : undefined
      })
    })
  );

  // Save flash messages in session.
  app.use(connectFlash());

  // Set the title for all pages, including the error page.
  app.use((req, res, next) => {
    res.locals.title = config.title;
    next();
  });

  // Plug in application routes.
  app.use('/', router);

  // Catch 404 and forward to the global error handler.
  app.use((req, res, next) => {
    next(createError(404));
  });

  // Global error handler
  app.use((err, req, res, next) => {
    req.logger.warn(err);

    // Set locals, only providing error in development.
    res.locals.message = err.message ?? 'An unexpected error occurred';
    res.locals.status = err.status ?? 500;
    res.locals.stack = config.env === 'development' ? err.stack : '-';

    // Render the error page.
    res.status(err.status || 500);
    res.render('error');
  });

  return app;
}
