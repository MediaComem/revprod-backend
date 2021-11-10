import express from 'express';

import { listComments, share, sharePage } from './share.middlewares.js';

const router = express.Router();

router.get('/share', sharePage);
router.post('/share', share);

router.get('/comments', listComments);

export default router;
