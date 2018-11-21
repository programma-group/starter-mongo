const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const helmet = require('helmet');
const passport = require('passport');

const testRoutes = require('./routes/test');
const errorHandlers = require('./utils/errorHandlers');

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator());

app.use(helmet());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/', testRoutes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// production error handler
app.use(errorHandlers.productionErrors);

module.exports = app;
