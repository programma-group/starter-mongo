const mongoose = require('mongoose');
const passport = require('passport');
const { checkSchema } = require('express-validator/check');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mail = require('../utils/mail');
const { formatResponse, equalPasswordValidator } = require('../utils/common');

const User = mongoose.model('User');

exports.authenticate = passport.authenticate('local', { session: false });

exports.login = (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
  return res.json(formatResponse(true, { user: req.user, token }));
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

  return res.json(formatResponse(true, req.body));
};

exports.validatePasswordToken = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json(formatResponse(false, { isValid: false }));
  }
  req.user = user;
  return next();
};

exports.validatePasswordReturn = (req, res) => {
  res.json(formatResponse(true, { isValid: true }));
};

exports.validatePasswordSchema = checkSchema({
  password: {
    in: ['body'],
    exists: {
      errorMessage: 'Password cannot be blank!',
    },
  },
  'password-confirm': {
    in: ['body'],
    exists: {
      errorMessage: 'Confirmed password cannot be blank!',
    },
    custom: {
      options: equalPasswordValidator,
      errorMessage: 'Your passwords do not match',
    },
  },
});

exports.resetPassword = async (req, res, next) => {
  await req.user.setPassword(req.body.password);
  return next();
};

exports.cleanPasswordResetData = async (req, res) => {
  req.user.resetPasswordToken = undefined;
  req.user.resetPasswordExpires = undefined;
  req.user.oneTimePassword = undefined;
  await req.user.save();
  res.json(formatResponse(true, { success: true }));
};
