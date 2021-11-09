import { DateTime } from 'luxon';

import { route } from '../express.js';
import { getValidationErrors } from '../validation.js';

export const donate = route(async (req, res) => {
  const data = {
    ...req.body,
    amount: coerceAmount(req.body.amount)
  };

  const errors = getValidationErrors(data, 'donation');
  if (errors) {
    req.flash('warning', 'Donation is invalid');
    return res.redirect('/');
  }

  const { amount } = data;
  const { user } = req.session;

  const donation = {
    user: user.id,
    date: DateTime.now(),
    amount
  };

  await req.app
    .get('db')
    .getCollection('donations')
    .insert(serializeDonation(donation));

  req.logger.info(
    `Successful donation of ${amount} by user ${user.id} (${JSON.stringify(
      user.name
    )})`
  );

  req.flash('info', 'Donation successful');

  res.redirect('/');
});

function coerceAmount(value) {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? value : parsed;
}

function serializeDonation({ date, ...rest }) {
  return {
    ...rest,
    date: date.toISO()
  };
}
