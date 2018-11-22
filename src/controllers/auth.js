const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mail = require('../utils/mail');

const User = mongoose.model('User');


exports.authenticate = passport.authenticate('local', { session: false });

exports.login = (req, res) => {
  const token = jwt.sign(req.user.toJSON(), process.env.SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
  return res.json({ user: req.user, token });
};

exports.lostPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const { email, name } = user;

    await mail.send({
      email,
      subject: 'Password Reset',
      name,
      token: user.resetPasswordToken,
      filename: 'passwordReset',
    });
  }

  return res.json(req.body);
};

exports.validatePasswordToken = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).json({ isValid: false });
  }
  req.user = user;
  next();
};

exports.validatePasswordReturn = (req, res) => {
  res.json({ isValid: true });
};

exports.validatePasswordInput = (req, res, next) => {
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    res.status(400).json(errors);
  }
  next();
};

exports.resetPassword = async (req, res, next) => {
  await req.user.setPassword(req.body.password);
  return next();
};

exports.cleanPasswordResetData = async (req, res) => {
  req.user.resetPasswordToken = undefined;
  req.user.resetPasswordExpires = undefined;
  req.user.oneTimePassword = undefined;
  await req.user.save();
  res.json({ success: true });
};
