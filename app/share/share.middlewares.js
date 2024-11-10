import { createComment, getComments } from '../../db.js';
import { route } from '../express.js';
import { getValidationErrors } from '../validation.js';

export const sharePage = route((req, res) => {
  res.render('share/share', {
    pageTitle: 'Share your experience'
  });
});

export const share = route(async (req, res) => {
  const errors = getValidationErrors(req.body, 'comment');
  if (errors) {
    res.redirect('/');
    return;
  }

  const { name, text } = req.body;

  await createComment({ name, text });

  req.logger.info(`New comment by ${JSON.stringify(name)}`);

  res.render('share/share', {
    pageTitle: 'Thank you!',
    shared: true
  });
});

export const listComments = route(async (req, res) => {
  const comments = await getComments();

  res.send(
    comments
      .sort(
        (firstComment, secondComment) =>
          secondComment.date.valueOf() - firstComment.date.valueOf()
      )
      .map(comment => commentToJson(comment))
  );
});

function commentToJson({ name, text, date }) {
  return {
    name,
    text,
    date: date.toISO()
  };
}
