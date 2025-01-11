const passport = require('passport');

class UsersController {
  loginPage(req, res) {
    res.render('login');
  }

  loginHandle(req, res, next) {
    passport.authenticate('local', {
      successRedirect: '/admin/users',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  }

  logoutHandle(req, res) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success_msg', 'You are logged out');
      res.redirect('/users/login');
    });
  }
}

module.exports = new UsersController();
