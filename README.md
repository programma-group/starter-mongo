# Programma Group REST MongoDB starter files
Status: [![CircleCI](https://circleci.com/gh/programma-group/starter-mongo.svg?style=svg)](https://circleci.com/gh/programma-group/starter-mongo) [![Maintainability](https://api.codeclimate.com/v1/badges/b0608120d4e1c69eaf96/maintainability)](https://codeclimate.com/github/programma-group/starter-mongo/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/b0608120d4e1c69eaf96/test_coverage)](https://codeclimate.com/github/programma-group/starter-mongo/test_coverage)

Comes with:

- ES6 support.
- [Mongoose](https://mongoosejs.com/) ORM.
- API documentation using Swagger.
- ESLint for code linting.
- Configuration management using dotenv.
- Logging of requests with Winston.
- Tests using Mocha/Chai.
- Coverage report through nyc.
---

## Prerequisites

- [Node.js](https://yarnpkg.com/en/docs/install)
- [NPM](https://docs.npmjs.com/getting-started/installing-node)
- [MongoDB](https://www.mongodb.com/)

## Setup

Clone the repository, install the dependencies and get started right away.

    $ git clone git@github.com:programma-group/starter-mongo.git <application-name>
    $ cd <application-name>
    $ rm -rf .git
    $ npm install

Make a copy of `.env.example` as `.env` and update your application details and database credentials.

### Environment variables description

- `NODE_ENV`: The node environment
- `DATABASE`= Mongo Database URL.
- `TEST_DATABASE`: Test Mongo Database URL.
- `PORT`: Application port. If not specified, it defaults to port 7777.
- `TEST_PORT`: Port to run tests.
- `MAIL_HOST`: Host used by nodemailer when it sends an email
- `MAIL_PORT`: Port used by nodemailer when it sends an email
- `MAIL_USER`: User used by nodemailer when it sends an email
- `MAIL_PASSWORD`: Password used by nodemailer when it sends an email
- `SECRET`: Secret key used to encrypt JWT tokens
- `URL`: The server's URL. Used by swagger docs explorer

This in an example of a `.env` file

```env
NODE_ENV=development
DATABASE=mongodb://user:pass@host.com:port/database
TEST_DATABASE=mongodb://user:pass@host.com:port/database-test
PORT=7777
TEST_PORT=3333
MAIL_HOST=my.host.com
MAIL_PORT=2525
MAIL_USER=myuser
MAIL_PASSWORD=mypassword
SECRET=mysecret
URL=localhost
```

### Starting the application

    $ npm run start

Navigate to [http://localhost:7777/docs/](http://localhost:7777/docs/) to verify the instalation.

## Tests

If you have set the test database on the .env file, you can run the tests by using

    $ npm run test

## Contributing

For contribution and feature requests, please create an [issue](https://github.com/programma-group/starter-mongo/issues) first.

## License

starter-mongo is under [MIT License](LICENSE).
