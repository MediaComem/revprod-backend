import express from 'express';

import { authenticate } from '../middlewares.js';
import { donate, donatePage, listDonations } from './donations.middlewares.js';

const router = express.Router();

router.get('/donate', authenticate(), donatePage);
router.post('/donate', authenticate(), donate);
router.get('/donations', listDonations);

export default router;
