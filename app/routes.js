import express from 'express';

import homeRouter from './home/home.routes.js';
import shareRouter from './share/share.routes.js';

const router = express.Router();

router.use('/', shareRouter);
router.use('/', homeRouter);

export default router;
