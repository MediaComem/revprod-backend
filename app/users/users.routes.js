import express from 'express';

import { createUser, createUserPage } from './users.middlewares.js';

const router = express.Router();

router.get('/new', createUserPage);
router.post('/', createUser);

export default router;
