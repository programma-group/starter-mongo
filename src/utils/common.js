const { validationResult } = require('express-validator/check');

const formatResponse = (status, data) => ({ ok: status, response: data });

const validatorMiddleware = (req, res, next) => {
  const errorFormatter = ({ msg, param }) => `${param}: ${msg}`;
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json(formatResponse(false, errors.array()));
  }
  return next();
};

const equalPasswordValidator = (value, { req }) => value === req.body.password;

module.exports = {
  formatResponse,
  validatorMiddleware,
  equalPasswordValidator,
};
