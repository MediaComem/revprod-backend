import express from 'express';

import { homePage } from './home.middlewares.js';

const router = express.Router();

router.get('/', homePage);

export default router;
