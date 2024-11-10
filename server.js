import { createServer as createHttpServer } from 'node:http';

export function startServer(config, app) {
  const logger = config.createLogger('www');

  const server = createHttpServer(app);

  return new Promise((resolve, reject) => {
    server.listen(config.port, config.host);
    server.on('error', onServerError);
    server.on('listening', onServerListening);

    function onServerError(err) {
      if (err.syscall !== 'listen') {
        reject(err);
        return;
      }

      // Handle specific listen errors with friendly messages.
      switch (err.code) {
        case 'EACCES': {
          reject(new Error(`Port ${config.port} requires elevated privileges`));
          break;
        }
        case 'EADDRINUSE': {
          reject(new Error(`Port ${config.port} is already in use`));
          break;
        }
        default: {
          reject(err);
        }
      }
    }

    function onServerListening() {
      logger.info(`Listening on ${config.host}:${config.port}`);
      resolve();
    }
  });
}
