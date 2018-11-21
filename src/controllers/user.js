const mongoose = require('mongoose');
const mail = require('../utils/mail');

const User = mongoose.model('User');

exports.validateRegister = (req, res, next) => {
  req.checkBody('email', 'That Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.sanitizeBody('name');

  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    res.status(400).json(errors);
    return;
  }
  next();
};

exports.register = async (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
  });

  await User.register(user, req.body.password);

  await mail.send({
    email: user.email,
    subject: 'Welcome to our starter app!',
    name: req.body.name,
    filename: 'welcome',
  });

  next();
};

exports.getProfile = (req, res) => {
  res.json(req.user);
};
