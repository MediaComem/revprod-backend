import { createServer as createHttpServer } from 'http';

export function startServer(config, app) {
  const logger = config.createLogger('www');

  const server = createHttpServer(app);

  return new Promise((resolve, reject) => {
    server.listen(config.port, config.host);
    server.on('error', onError);
    server.on('listening', onListening);

    function onError(err) {
      if (err.syscall !== 'listen') {
        return reject(err);
      }

      // Handle specific listen errors with friendly messages.
      switch (err.code) {
        case 'EACCES':
          reject(new Error(`Port ${config.port} requires elevated privileges`));
          break;
        case 'EADDRINUSE':
          reject(new Error(`Port ${config.port} is already in use`));
          break;
        default:
          reject(err);
      }
    }

    function onListening() {
      logger.info(`Listening on ${config.host}:${config.port}`);
      resolve();
    }
  });
}
