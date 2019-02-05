const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const passport = require('passport');
const expressWinston = require('express-winston');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./utils/swagger');
const errorHandlers = require('./utils/errorHandlers');
const { winstonConfig } = require('./utils/config');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport');

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
  app.use(expressWinston.logger(winstonConfig));
}

const options = {
  explorer: true,
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));
app.use('/', authRoutes);
app.use(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  userRoutes
);

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
  app.use(expressWinston.errorLogger(winstonConfig));
}

app.use(errorHandlers.notFound);

app.use(errorHandlers.flashValidationErrors);

app.use(errorHandlers.productionErrors);

module.exports = app;
