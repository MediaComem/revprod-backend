import { createComment } from '../../db.js';
import { route } from '../express.js';
import { getValidationErrors } from '../validation.js';

export const sharePage = route(async (req, res) => {
  res.render('share/share', {
    pageTitle: 'Share your experience'
  });
});

export const share = route(async (req, res) => {
  const errors = getValidationErrors(req.body, 'comment');
  if (errors) {
    return res.redirect('/');
  }

  const { name, text } = data;

  await createComment({ name, text });

  req.get('logger').info(`New comment by ${JSON.stringify(name)}`);

  res.redirect('/');
});

export const listComments = route(async (req, res) => {
  const comments = req.app
    .get('db')
    .sort((a, b) => b.date.valueOf() - a.date.valueOf())
    .map(commentToJson);

  res.send(comments);
});

function commentToJson({ name, text, date }) {
  return {
    name,
    text,
    date: date.toISO()
  };
}
