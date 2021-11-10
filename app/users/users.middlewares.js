import { compare, hash } from 'bcrypt';
import { URLSearchParams } from 'url';
import { v4 as uuid } from 'uuid';

import { route } from '../express.js';
import { getValidationErrors } from '../validation.js';

const registerPageTitle = 'Register';

export const registerPage = route((req, res) => {
  res.render('users/register', { pageTitle: registerPageTitle });
});

export const register = route(async (req, res) => {
  const { _csrf, ...body } = req.body;

  const errors = getValidationErrors(body, 'register');
  if (errors) {
    return res.render('users/register', {
      pageTitle: registerPageTitle,
      errors
    });
  }

  const { name, password, creditCard } = body;

  const { bcryptRounds } = req.app.get('config');
  const passwordHash = await hash(password, bcryptRounds);

  const user = {
    id: uuid(),
    name,
    passwordHash,
    creditCard
  };

  try {
    await req.app.get('db').getCollection('users').insert(user);
  } catch (err) {
    if (err.message.startsWith('Duplicate')) {
      req.flash('warning', `User ${JSON.stringify(name)} already exists`);
      return res.render('users/register', {
        pageTitle: registerPageTitle
      });
    }
  }

  req.logger.info(`User ${user.id} (${JSON.stringify(name)}) created`);

  const params = new URLSearchParams();
  params.set('username', name);

  res.redirect(`/users/login?${params.toString()}`);
});

export const logInPage = route((req, res) => {
  res.render('users/login', {
    pageTitle: 'Please log in',
    username: req.query.username
  });
});

export const logIn = route(async (req, res) => {
  const { _csrf, ...body } = req.body;

  const errors = getValidationErrors(body, 'login');
  if (errors) {
    return invalidLogin(req, res, 'Login payload is invalid');
  }

  const { username, password } = body;
  req.logger.trace(`User ${JSON.stringify(username)} logging in`);

  const user = req.app
    .get('db')
    .getCollection('users')
    .findOne({ name: { $eq: username } });
  if (!user) {
    return invalidLogin(req, res, `User ${JSON.stringify(username)} not found`);
  }

  const passwordMatches = await compare(password, user.passwordHash);
  if (!passwordMatches) {
    return invalidLogin(
      req,
      res,
      `Password of user ${JSON.stringify(username)} does not match`
    );
  }

  req.logger.info(
    `User ${user.id} (${JSON.stringify(username)}) successfully logged in`
  );

  req.session.user = user;

  res.redirect('/');
});

function invalidLogin(req, res, logMessage) {
  req.logger.trace(logMessage);
  req.flash('warning', 'Username or password is invalid');
  res.redirect('/');
}

export const logOut = route((req, res) => {
  const { user } = req.session;

  if (user) {
    delete req.session.user;
    req.logger.info(
      `User ${user.id} (${JSON.stringify(user.name)}) logged out`
    );
  }

  res.redirect('/');
});
