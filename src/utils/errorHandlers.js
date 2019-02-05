/*
  Catch Errors Handler

  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our express middleware with
  next()
*/

exports.catchErrors = fn => (req, res, next) => {
  return fn(req, res, next).catch(next);
};

/*
  Not Found Error Handler

  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler
  to display
*/
exports.notFound = (req, res, next) => {
  const err = new Error('This route does not exists');
  err.status = 404;
  next(err);
};

/*
  MongoDB Validation Error Handler

  Detect if there are mongodb validation errors that we can nicely show via flash messages
*/

exports.flashValidationErrors = (err, req, res, next) => {
  if (!err) {
    return next();
  }

  return res.status(err.status || 400).json({
    ok: false,
    message: 'There was an internal error',
    errors: err.message,
  });
};

/*
  Production Error Handler

  No stacktraces are leaked to user
*/
/* istanbul ignore next */
exports.productionErrors = (err, req, res) => {
  res.status(err.status || 500).json('error', {
    ok: false,
    message: err.message,
    error: {},
  });
};
