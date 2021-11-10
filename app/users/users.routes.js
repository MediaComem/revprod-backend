import express from 'express';

import {
  logIn,
  logInPage,
  logOut,
  register,
  registerPage
} from './users.middlewares.js';

const router = express.Router();

router.get('/register', registerPage);
router.post('/register', register);
router.get('/login', logInPage);
router.post('/login', logIn);
router.post('/logout', logOut);

export default router;
