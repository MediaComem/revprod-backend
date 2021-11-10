export function route(func) {
  return (req, res, next) => {
    return Promise.resolve()
      .then(() => func(req, res, next))
      .catch(next);
  };
}
