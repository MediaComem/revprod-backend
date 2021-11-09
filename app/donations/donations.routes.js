import express from 'express';

import { authenticate } from '../middlewares.js';
import { donate } from './donations.middlewares.js';

const router = express.Router();

router.post('/', authenticate(), donate);

export default router;
