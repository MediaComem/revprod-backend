import express from 'express';

import { homePage, logIn, logOut } from './home.middlewares.js';

const router = express.Router();

router.get('/', homePage);
router.post('/login', logIn);
router.post('/logout', logOut);

export default router;
