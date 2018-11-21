/* eslint no-console: off */
const mongoose = require('mongoose');

require('dotenv').config({ path: 'variables.env' });

let database;
let port;

if (process.env.NODE_ENV === 'test') {
  database = process.env.TEST_DATABASE;
  port = process.env.TEST_PORT;
} else {
  database = process.env.DATABASE;
  port = process.env.PORT;
}

mongoose.connect(database, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
  console.error(err.message);
});

// Import all of our models
require('./models/User');

// Start our app!
const app = require('./app');

app.set('port', port || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

module.exports = server;
