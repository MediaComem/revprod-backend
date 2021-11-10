import { route } from '../express.js';

export const homePage = route((req, res) => {
  res.redirect('/share');
});
