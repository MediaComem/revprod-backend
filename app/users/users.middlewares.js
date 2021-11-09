import { hash } from 'bcrypt';
import { DateTime } from 'luxon';
import { URLSearchParams } from 'url';
import { v4 as uuid } from 'uuid';

import { route } from '../express.js';
import { getValidationErrors } from '../validation.js';

const createUserPageTitle = 'Register';

export const createUserPage = route((req, res) => {
  res.render('users/create-user', { pageTitle: createUserPageTitle });
});

export const createUser = route(async (req, res) => {
  const errors = getValidationErrors(req.body, 'create-user');
  if (errors) {
    return res.render('users/create-user', {
      pageTitle: createUserPageTitle,
      errors
    });
  }

  const { name, password } = req.body;

  const { bcryptRounds } = req.app.get('config');
  const passwordHash = await hash(password, bcryptRounds);

  const user = {
    id: uuid(),
    name,
    passwordHash
  };

  try {
    await req.app.get('db').getCollection('users').insert(user);
  } catch (err) {
    if (err.message.startsWith('Duplicate')) {
      req.flash('warning', `User ${JSON.stringify(name)} already exists`);
      return res.render('users/create-user', {
        pageTitle: createUserPageTitle
      });
    }
  }

  req.logger.info(`User ${user.id} (${JSON.stringify(name)}) created`);

  const params = new URLSearchParams();
  params.set('username', name);

  res.redirect(`/?${params.toString()}`);
});
