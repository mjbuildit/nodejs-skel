/* eslint no-unused-expressions: 0 */
const expect = require('chai').expect;
const sinon = require('sinon');
const Twiglets = require('../twiglets');
const PouchDb = require('pouchdb');

describe('/twiglets/{id}', () => {
  let sandbox = sinon.sandbox.create();
  const reply = (response) => response || {};
  const req = {
    params: {
      id: '12345'
    },
    payload: {
      nodes: [],
      links: [],
      commit: {
        commitMessage: 'Foo',
      },
    },
    auth: {
      credentials: {
        user: {
          name: 'bar@baz.com'
        }
      }
    }
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('adds first commit message', () => {
    // arrange
    sandbox.stub(PouchDb.prototype, 'info').returns(Promise.resolve());
    sandbox.stub(PouchDb.prototype, 'get').returns(Promise.reject({ status: 404 }));
    sandbox.stub(PouchDb.prototype, 'put').returns(Promise.resolve());

    // act
    return Twiglets.update(req, reply)
      .then((response) => {
        // assert
        expect(response).to.exist;
      });
  });

  it('prepends additional commit message', () => {
    // arrange
    sandbox.stub(PouchDb.prototype, 'info').returns(Promise.resolve());
    sandbox.stub(PouchDb.prototype, 'get').returns(Promise.resolve({
      data: [
        {
          user: 'foo@bar.com',
          timestamp: new Date(2000, 2, 14).toISOString(),
          message: 'First commit'
        }
      ]
    }));
    const putCall = sandbox.stub(PouchDb.prototype, 'put').returns(Promise.resolve());
    const now = new Date();

    // act
    return Twiglets.update(req, reply)
      .then((response) => {
        // assert
        expect(response).to.exist;
        expect(putCall.firstCall.args[0].data).to.have.length.of(2);
        expect(putCall.firstCall.args[0].data[0].message).to.be.eq('Foo');
        expect(putCall.firstCall.args[0].data[0].user).to.be.eq('bar@baz.com');
        const commitDate = Date.parse(putCall.firstCall.args[0].data[0].timestamp);
        expect(commitDate).to.be.at.least(now.getTime());
      });
  });

  it('fails when twiglet doesn\'t exist', () => {
    // arrange
    const error = new Error('Not Found');
    error.status = 404;
    sandbox.stub(PouchDb.prototype, 'info').returns(Promise.reject(error));

    // act
    return Twiglets.update(req, reply)
      .then((response) => {
        // assert
        expect(response).to.exist;
        expect(response.output.statusCode).to.eq(404);
      });
  });
});
