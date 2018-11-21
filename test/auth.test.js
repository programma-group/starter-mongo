process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/start');
const User = require('../src/models/User');

const should = chai.should();

chai.use(chaiHttp);

describe('The auth:', () => {
  before(async () => {
    await User.remove({});
  });

  it('should register a new account', (done) => {
    const data = {
      email: 'john@doe.com',
      name: 'John Doe',
      password: 'abc12345678',
      'password-confirm': 'abc12345678',
    };

    chai.request(app).post('/register').send(data).end((err, res) => {
      res.should.have.status(200);
      res.body.user.should.have.property('email').eql(data.email);
      res.body.user.should.have.property('name').eql(data.name);
      res.body.should.have.property('token');
      done();
    });
  });

  it('should return 404 if the wrong endpoint is called', (done) => {
    chai.request(app).get('/wrong-endpoint').end((err, res) => {
      res.should.have.status(404);
      res.body.should.have.property('message').eql('This route does not exists');
      done();
    });
  });
});
