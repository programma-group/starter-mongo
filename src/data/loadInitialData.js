/* eslint no-console: off */
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '/../../variables.env'),
});
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

const User = require('../models/User');

async function deleteAll() {
  console.log('Deleting all data...');
  await User.deleteMany({});
  console.log('Data deleted.');
  return process.exit();
}

async function createUser() {
  console.log('Creating a test user...');

  try {
    const testUser = new User({
      email: 'test@test.com',
      name: 'Test user',
    });

    await User.register(testUser, 'abc12345678');
  } catch (e) {
    console.log('Test user already exists.');
    return process.exit();
  }

  console.log('Test user created.');
  return process.exit();
}

if (process.argv.includes('--delete-all')) {
  deleteAll();
} else if (process.argv.includes('--create-user')) {
  createUser();
} else {
  console.log('You need to specify a command');
}
