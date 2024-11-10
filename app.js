import cors from 'cors';
import express from 'express';
import createError from 'http-errors';
import log4js from 'log4js';
import { join as joinPath } from 'node:path';

import router from './app/routes.js';
import { root } from './config.js';

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

  // Allow cross origin requests (if enabled).
  if (config.cors) {
    const corsOptions = {};
    if (config.corsOrigins.length !== 0) {
      corsOptions.origin = config.corsOrigins;
    }

    // eslint-disable-next-line sonarjs/cors
    app.use(cors(corsOptions));
  }

  // Provide common local variables to all views.
  app.use(provideDefaultLocals(config));

  // Plug in application routes.
  app.use('/', router);

  // Catch 404 and forward to the global error handler.
  app.use((req, res, next) => {
    next(createError(404));
  });

  // Global error handler
  app.use(createGlobalErrorHandler(config, logger));

  return app;
}

function createGlobalErrorHandler(config, logger) {
  return (err, req, res, _next) => {
    logger.warn(err);

    // Set locals, only providing error in development.
    res.locals.message = err.message ?? 'An unexpected error occurred';
    res.locals.status = err.status ?? 500;
    res.locals.stack = config.env === 'development' ? err.stack : '-';

    // Render the error page.
    res.status(err.status || 500);
    res.render('error');
  };
}

function provideDefaultLocals(config) {
  return (req, res, next) => {
    res.locals.title = config.title;
    res.locals.landingPageBaseUrl = config.landingPageBaseUrl;
    next();
  };
}
