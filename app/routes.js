import express from 'express';

import donationsRouter from './donations/donations.routes.js';
import homeRouter from './home/home.routes.js';
import usersRouter from './users/users.routes.js';

const router = express.Router();

router.use('/', homeRouter);
router.use('/donate', donationsRouter);
router.use('/users', usersRouter);

export default router;
