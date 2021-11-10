import { DateTime } from 'luxon';

import { route } from '../express.js';
import { getValidationErrors } from '../validation.js';

export const donatePage = route(async (req, res) => {
  const { user } = req.session;

  const donations = user
    ? req.app
        .get('db')
        .getCollection('donations')
        .find({ user: { $eq: user.id } })
        .map(deserializeDonation)
        .sort((a, b) => b.date.valueOf() - a.date.valueOf())
    : [];

  const total = donations.reduce((memo, donation) => memo + donation.amount, 0);

  res.render('donations/donate', {
    pageTitle: user ? undefined : 'Please log in',
    username: req.query.username ?? '',
    total,
    totalFormatted: total.toLocaleString()
  });
});

export const listDonations = route(async (req, res) => {
  const donations = req.app
    .get('db')
    .getCollection('donations')
    .find({})
    .map(deserializeDonation)
    .sort((a, b) => b.date.valueOf() - a.date.valueOf())
    .map(donationToJson);

  res.send(donations);
});

export const donate = route(async (req, res) => {
  const { _csrf, ...body } = req.body;
  const data = {
    ...body,
    amount: coerceAmount(req.body.amount)
  };

  const errors = getValidationErrors(data, 'donation');
  if (errors) {
    req.flash('warning', 'Donation is invalid');
    return res.redirect('/');
  }

  const { amount, testimonial } = data;
  const { user } = req.session;

  const donation = {
    user: user.id,
    userName: user.name,
    date: DateTime.now(),
    amount,
    testimonial
  };

  await req.app
    .get('db')
    .getCollection('donations')
    .insert(serializeDonation(donation));

  req.logger.info(
    `Successful donation of ${amount} credits by user ${
      user.id
    } (${JSON.stringify(user.name)})`
  );

  req.flash('info', 'Thank you for your generous donation!');

  res.redirect('/');
});

function coerceAmount(value) {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? value : parsed;
}

function deserializeDonation({ date, ...rest }) {
  return {
    ...rest,
    date: DateTime.fromISO(date)
  };
}

function donationToJson({ amount, date, testimonial, userName }, req) {
  const formatted = {
    date: date.toISO(),
    testimonial,
    userName
  };

  if (req.session?.user) {
    formatted.amount = amount.toLocaleString();
  }

  return formatted;
}

function serializeDonation({ date, ...rest }) {
  return {
    ...rest,
    date: date.toISO()
  };
}
