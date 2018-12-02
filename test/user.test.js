process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');

const should = chai.should();
const app = require('../src/start');

const getJWTToken = user => jwt.sign(user.toJSON(), process.env.SECRET);

chai.use(chaiHttp);

describe('The user:', () => {
  before(async () => {
    await User.remove({});

    const user = new User({
      email: 'john@doe.com',
      name: 'John Doe',
    });

    await User.register(user, 'abc12345678');
  });

  it('should not return a user profile if no token is provided', (done) => {
    chai.request(app).get('/profile').end((err, res) => {
      res.should.have.status(401);
      done();
    });
  });

  it('should return the current user profile', (done) => {
    User.findOne({ email: 'john@doe.com' }).then((user) => {
      const token = getJWTToken(user);
      chai.request(app).get('/profile').set('Authorization', `bearer ${token}`).end((err, res) => {
        res.should.have.status(200);
        res.body.ok.should.eql(true);
        res.body.response.should.have.property('email').eql(user.email);
        res.body.response.should.have.property('name').eql(user.name);
        res.body.response.should.have.property('_id').eql(user._id.toString());
        res.body.response.should.have.property('created');
        done();
      });
    });
  });
});
