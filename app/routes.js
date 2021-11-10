import express from 'express';

import donationsRouter from './donations/donations.routes.js';
import homeRouter from './home/home.routes.js';
import usersRouter from './users/users.routes.js';

const router = express.Router();

router.use('/', donationsRouter);
router.use('/users', usersRouter);
router.use('/', homeRouter);

export default router;
