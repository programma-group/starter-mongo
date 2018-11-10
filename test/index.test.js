process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/start');

const should = chai.should();

chai.use(chaiHttp);

describe('The test application:', () => {
  it('should return 200 if the correct endpoint is called', (done) => {
    chai.request(app).get('/').end((err, res) => {
      res.should.have.status(200);
      res.body.should.have.property('hey').eql('it works!');
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
