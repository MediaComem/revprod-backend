import chalk from 'chalk';
import cors from 'cors';
import express from 'express';
import createError from 'http-errors';
import log4js from 'log4js';
import { join as joinPath } from 'path';

import { root } from './config.js';
import router from './app/routes.js';

export function createApplication(config, db) {
  const app = express();
  const logger = config.createLogger('app');

  app.set('config', config);
  app.set('db', db);
  app.set('env', config.env);
  app.set('logger', logger);
  app.set('port', config.port);

  // Use https://pugjs.org for templates.
  app.set('views', joinPath(root, 'app'));
  app.set('view engine', 'pug');

  // Log requests.
  app.use(log4js.connectLogger(logger, { level: 'DEBUG' }));

  // Parse form data.
  app.use(express.urlencoded({ extended: false }));

  // Serve static files from the public directory.
  app.use(express.static(joinPath(root, 'public')));

  // Provide common local variables to all views.
  app.use(provideDefaultLocals(config));

  // Allow cross origin requests (if enabled).
  if (config.cors) {
    app.use(
      cors({
        origin: config.corsOrigins.length
          ? config.corsOrigins.length
          : undefined
      })
    );
  }

  // Plug in application routes.
  app.use('/', router);

  // Catch 404 and forward to the global error handler.
  app.use((req, res, next) => {
    next(createError(404));
  });

  // Global error handler
  app.use((err, req, res, next) => {
    logger.warn(err);

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

function provideDefaultLocals(config) {
  return (req, res, next) => {
    res.locals.title = config.title;
    res.locals.landingPageBaseUrl = config.landingPageBaseUrl;
    next();
  };
}
