const mongoose = require('mongoose');
const { checkSchema } = require('express-validator/check');
const validator = require('validator');

const mail = require('../utils/mail');
const { formatResponse, equalPasswordValidator } = require('../utils/common');

const User = mongoose.model('User');

exports.validateRegisterSchema = checkSchema({
  email: {
    in: ['body'],
    exists: {
      errorMessage: 'Email cannot be blank!',
    },
    custom: {
      options: value => validator.isEmail(value),
      errorMessage: 'This email is not valid!',
    },
  },
  name: {
    in: ['body'],
    exists: {
      errorMessage: 'Name cannot be blank!',
    },
  },
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
  res.json(formatResponse(true, req.user));
};
