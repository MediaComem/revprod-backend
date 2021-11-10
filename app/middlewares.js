export function authenticate() {
  return (req, res, next) => {
    const { user } = req.session;
    if (!user) {
      req.flash('warning', 'Authentication is required');
      return res.redirect('/users/login');
    }

    req.logger.trace(
      `User ${user.id} (${JSON.stringify(user.name)}) is authenticated`
    );

    next();
  };
}
