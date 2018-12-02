process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mockery = require('mockery');
const nodemailerMock = require('nodemailer-mock');
const User = require('../src/models/User');

mockery.enable({
  warnOnUnregistered: false,
});

mockery.registerMock('nodemailer', nodemailerMock);

const should = chai.should();
const app = require('../src/start');

chai.use(chaiHttp);

describe('The auth:', () => {
  before(async () => {
    await User.remove({});
  });

  afterEach(() => {
    nodemailerMock.mock.reset();
  });

  after(async () => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should not register a new account if the email is wrong', (done) => {
    const data = {
      email: 'john',
      name: 'John Doe',
      password: 'abc12345678',
      'password-confirm': 'abc12345678',
    };

    chai.request(app).post('/register').send(data).end((err, res) => {
      res.should.have.status(400);
      res.body.ok.should.eql(false);
      res.body.response.should.eql([
        {
          location: 'body',
          param: 'email',
          msg: 'That Email is not valid!',
          value: '@john',
        },
      ]);
      done();
    });
  });

  it('should not register a new account if there is no name', (done) => {
    const data = {
      email: 'john@doe.com',
      password: 'abc12345678',
      'password-confirm': 'abc12345678',
    };

    chai.request(app).post('/register').send(data).end((err, res) => {
      res.should.have.status(400);
      res.body.ok.should.eql(false);
      res.body.response.should.eql([
        {
          location: 'body',
          param: 'name',
          msg: 'Name cannot be blank!',
        },
      ]);
      done();
    });
  });

  it('should not register a new account if there is no password', (done) => {
    const data = {
      email: 'john@doe.com',
      name: 'John Doe',
      'password-confirm': 'abc12345678',
    };

    chai.request(app).post('/register').send(data).end((err, res) => {
      res.should.have.status(400);
      res.body.ok.should.eql(false);
      res.body.response.should.eql([
        {
          location: 'body',
          param: 'password',
          msg: 'Password cannot be blank!',
        },
        {
          location: 'body',
          param: 'password-confirm',
          msg: 'Your passwords do not match',
          value: 'abc12345678',
        },
      ]);
      done();
    });
  });

  it('should not register a new account if there is no password confirmation', (done) => {
    const data = {
      email: 'john@doe.com',
      name: 'John Doe',
      password: 'abc12345678',
    };

    chai.request(app).post('/register').send(data).end((err, res) => {
      res.should.have.status(400);
      res.body.ok.should.eql(false);
      res.body.response.should.eql([
        {
          location: 'body',
          param: 'password-confirm',
          msg: 'Confirmed password cannot be blank!',
        },
        {
          location: 'body',
          param: 'password-confirm',
          msg: 'Your passwords do not match',
        },
      ]);
      done();
    });
  });

  it('should not register a new account if the passwords do not match', (done) => {
    const data = {
      email: 'john@doe.com',
      name: 'John Doe',
      password: 'abc12345678',
      'password-confirm': 'ABC12345678',
    };

    chai.request(app).post('/register').send(data).end((err, res) => {
      res.should.have.status(400);
      res.body.ok.should.eql(false);
      res.body.response.should.eql([
        {
          location: 'body',
          param: 'password-confirm',
          msg: 'Your passwords do not match',
          value: 'ABC12345678',
        },
      ]);
      done();
    });
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
      res.body.ok.should.eql(true);
      res.body.response.user.should.have.property('email').eql(data.email);
      res.body.response.user.should.have.property('name').eql(data.name);
      res.body.response.should.have.property('token');

      const sentMail = nodemailerMock.mock.sentMail();
      sentMail.length.should.eql(1);
      sentMail[0].should.have.property('subject').eql('Welcome to our starter app!');

      done();
    });
  });

  it('should not log me in if the data is incorrect', (done) => {
    const data = {
      email: 'john@doe.com',
      password: 'ABC12345678',
    };

    chai.request(app).post('/login').send(data).end((err, res) => {
      res.should.have.status(401);
      res.body.should.not.have.property('token');
      res.body.should.not.have.property('user');
      done();
    });
  });

  it('should log me in', (done) => {
    const data = {
      email: 'john@doe.com',
      password: 'abc12345678',
    };

    chai.request(app).post('/login').send(data).end((err, res) => {
      res.should.have.status(200);
      res.body.ok.should.eql(true);
      res.body.response.user.should.have.property('email').eql(data.email);
      res.body.response.should.have.property('token');
      done();
    });
  });

  it('should not send a lost password email if the email is not on the database', (done) => {
    const data = {
      email: 'jane@doe.com',
    };

    chai.request(app).post('/password/lost').send(data).end((err, res) => {
      res.should.have.status(200);
      res.body.response.should.eql(data);
      res.body.ok.should.eql(true);

      const sentMail = nodemailerMock.mock.sentMail();
      sentMail.length.should.eql(0);

      done();
    });
  });

  it('should send a lost password email', (done) => {
    const data = {
      email: 'john@doe.com',
    };

    chai.request(app).post('/password/lost').send(data).end((err, res) => {
      res.should.have.status(200);
      res.body.response.should.eql(data);
      res.body.ok.should.eql(true);

      const sentMail = nodemailerMock.mock.sentMail();
      sentMail.length.should.eql(1);
      sentMail[0].should.have.property('subject').eql('Password Reset');

      done();
    });
  });

  it('should send an error if a reset password token is invalid', (done) => {
    const data = {
      token: 'abc123',
    };

    chai.request(app).post('/password/verify').send(data).end((err, res) => {
      res.should.have.status(400);
      res.body.response.should.have.property('isValid').eql(false);
      res.body.ok.should.eql(false);
      done();
    });
  });

  it('should verify if a reset password token is valid', (done) => {
    User.findOne({ email: 'john@doe.com' }).then((user) => {
      const data = {
        token: user.resetPasswordToken,
      };

      chai.request(app).post('/password/verify').send(data).end((err, res) => {
        res.should.have.status(200);
        res.body.response.should.have.property('isValid').eql(true);
        res.body.ok.should.eql(true);
        done();
      });
    });
  });

  it('should not let me update my password if the token is invalid', (done) => {
    const data = {
      token: 'abc123',
      password: 'abc12345678',
      'password-confirm': 'abc12345678',
    };

    chai.request(app).post('/password/reset').send(data).end((err, res) => {
      res.should.have.status(400);
      res.body.response.should.have.property('isValid').eql(false);
      res.body.ok.should.eql(false);
      done();
    });
  });

  it('should not let me update my password if the password is not specified', (done) => {
    User.findOne({ email: 'john@doe.com' }).then((user) => {
      const data = {
        token: user.resetPasswordToken,
        'password-confirm': 'abc12345678',
      };

      chai.request(app).post('/password/reset').send(data).end((err, res) => {
        res.should.have.status(400);
        res.body.ok.should.eql(false);
        res.body.response.should.eql([
          {
            location: 'body',
            param: 'password',
            msg: 'Password cannot be blank!',
          },
          {
            location: 'body',
            param: 'password-confirm',
            msg: 'Your passwords do not match',
            value: 'abc12345678',
          },
        ]);
        done();
      });
    });
  });

  it('should not let me update my password if the password confirmation is not specified', (done) => {
    User.findOne({ email: 'john@doe.com' }).then((user) => {
      const data = {
        token: user.resetPasswordToken,
        password: 'abc12345678',
      };

      chai.request(app).post('/password/reset').send(data).end((err, res) => {
        res.should.have.status(400);
        res.body.ok.should.eql(false);
        res.body.response.should.eql([
          {
            location: 'body',
            param: 'password-confirm',
            msg: 'Confirmed password cannot be blank!',
          },
          {
            location: 'body',
            param: 'password-confirm',
            msg: 'Your passwords do not match',
          },
        ]);
        done();
      });
    });
  });

  it('should not let me update my password if the password and the password confirmation do not match', (done) => {
    User.findOne({ email: 'john@doe.com' }).then((user) => {
      const data = {
        token: user.resetPasswordToken,
        password: 'abc12345678',
        'password-confirm': 'ABC12345678',
      };

      chai.request(app).post('/password/reset').send(data).end((err, res) => {
        res.should.have.status(400);
        res.body.ok.should.eql(false);
        res.body.response.should.eql([
          {
            location: 'body',
            param: 'password-confirm',
            msg: 'Your passwords do not match',
            value: 'ABC12345678',
          },
        ]);
        done();
      });
    });
  });

  it('should let me update my password', (done) => {
    User.findOne({ email: 'john@doe.com' }).then((user) => {
      const data = {
        token: user.resetPasswordToken,
        password: 'abc12345678',
        'password-confirm': 'abc12345678',
      };

      chai.request(app).post('/password/reset').send(data).end((err, res) => {
        res.should.have.status(200);
        res.body.ok.should.eql(true);
        res.body.response.should.have.property('success').eql(true);

        User.findOne({ email: 'john@doe.com' }).then((updatedUser) => {
          updatedUser.toJSON().should.not.have.property('resetPasswordToken');
          done();
        });
      });
    });
  });

  it('should return 404 if the wrong endpoint is called', (done) => {
    chai.request(app).get('/wrong-endpoint').end((err, res) => {
      res.should.have.status(404);
      res.body.should.have.property('errors').eql('This route does not exists');
      done();
    });
  });
});
