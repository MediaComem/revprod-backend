import chalk from 'chalk';
import { randomBytes } from 'crypto';

const requestId = Symbol('REQUEST_ID');

export function getRequestId(req) {
  return req[requestId];
}

export function route(func) {
  return (req, res, next) => {
    function redirectAfterSavingSession(...args) {
      if (!req.session) {
        res.redirect(...args);
        return;
      }

      req.session.save(err => (err ? next(err) : res.redirect(...args)));
    }

    function renderWithDefaultLocals(view, locals = {}) {
      return res.render(view, {
        ...locals,
        flash: req.flash(),
        user: req.session?.user
      });
    }

    const enrichedRes = {
      redirect: redirectAfterSavingSession,
      render: renderWithDefaultLocals
    };

    return Promise.resolve()
      .then(() => func(req, enrichedRes, next))
      .catch(next);
  };
}

export function requestLogger() {
  return (req, res, next) => {
    const id = generateRequestId();
    req[requestId] = id;

    req.logger = req.app
      .get('config')
      .createLogger(`req - ${chalk.gray(`[${id}]`)}`);

    req.logger.addContext('id', id);

    next();
  };
}

function generateRequestId() {
  return randomBytes(3).toString('hex');
}
