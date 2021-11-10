import express from 'express';

import { authenticate } from '../middlewares.js';
import { donate, donatePage, listDonations } from './donations.middlewares.js';

const router = express.Router();

router.get('/', authenticate(), donatePage);
router.get('/donations', listDonations);
router.post('/', authenticate(), donate);

export default router;
