import express from 'express';

import { listComments, share, sharePage } from './share.middlewares.js';

const router = express.Router();

router.use((req, res, next) => {
  req.logger = req.app.get('config').createLogger('share');
  next();
});

router.get('/share', sharePage);
router.post('/share', share);

router.get('/comments', listComments);

export default router;
