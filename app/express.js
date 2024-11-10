export function route(func) {
  return (req, res, next) =>
    Promise.resolve()
      .then(() => func(req, res, next))
      .catch(next);
}
