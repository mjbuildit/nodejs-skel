const config = require('../utils/config');
const expect = require('chai').expect;
const sinon = require('sinon');
const node = require('../node');
const restler = require('restler');

/* eslint-disable no-unused-expressions */
describe('Node', () => {
  describe('Builds the Rollup View', () => {
    const reply = (response) => response;
    const request = {
      payload: {
        twigDb: 'twig-unittest',
      }
    };
    const rolledUpResponse = {
      ok: true,
      id: '_design/nodes',
      rev: '4-a3df20622dd9a8eb9362fe1d76aeed9c'
    };

    beforeEach(() => {
      sinon.stub(restler, 'put');
    });

    afterEach(() => {
      restler.put.restore();
    });

    it('Builds the map function', () => {
      // setup

      // act
      const result = node.buildMapFunc();

      // assert
      expect(result).to.exist;
      expect(result.includes('function (doc)')).to.be.true;
      expect(result.includes('function (key, values)')).to.be.false;
    });

    it('Builds the reduce function', () => {
      // setup

      // act
      const result = node.buildReduceFunc();

      // assert
      expect(result).to.exist;
      expect(result.includes('function (doc)')).to.be.false;
      expect(result.includes('function (key, values)')).to.be.true;
    });

    it('Builds the view json', () => {
      // setup
      const mapFunc = 'function(doc) {}';
      const reduceFunc = 'function (key, values) {}';

      // act
      const result = node.buildViewJson(mapFunc, reduceFunc);

      // assert
      expect(result.views).to.exist;
      expect(result.views.node_rollup).to.exist;
      expect(result.views.node_rollup.map).to.equal(mapFunc);
      expect(result.views.node_rollup.reduce).to.equal(reduceFunc);
    });

    it('Publishes the nodes rollup view', () => {
      // setup
      const host = config.COUCHDB_URL;
      const database = 'twig-unittest';
      const viewJson = '';

      restler.put.returns({
        on: sinon.stub().yields(rolledUpResponse, null)
      });

      // act
      return node.publishView(host, database, viewJson)
        .then((response) => {
          // assert
          expect(response).to.exist;
        });
    });

    it('Is called from REST API', () => {
      // setup
      const publishView = sinon.spy(node, 'publishView');
      restler.put.returns({
        on: sinon.stub().yields(rolledUpResponse, null)
      });

      // act
      return node.nodeRollupView(request, reply)
        .then((response) => {
          // assert
          // console.log(`Test Reply: ${JSON.stringify(response)}`);
          expect(publishView.calledOnce).to.be.true;
          expect(response.statusCode).to.equal(201);
          expect(response.message).to.equal('Nodes Rollup View Created');
        });
    });
  });

  describe('Looksup the Rollup View', () => {
    beforeEach(() => {
      sinon.stub(restler, 'get');
    });

    afterEach(() => {
      restler.get.restore();
    });

    it('Finds the node rolled up view', () => {
      // setup
      const host = config.COUCHDB_URL;
      const database = 'twig-unittest';
      const foundResponseData = {
        id: '_design/nodes',
        _rev: '4-a3df20622dd9a8eb9362fe1d76aeed9c',
        views: {
          by_nodes: {
            map: 'function (doc) ...',
            reduce: 'function (key, values) ...'
          }
        }
      };
      const foundResponse = {
        statusCode: 200,
        statusMessage: 'found'
      };

      restler.get.returns({
        on: sinon.stub().yields(foundResponseData, foundResponse)
      });

      // act
      return node.nodeRollupViewExists(host, database)
        .then((response) => {
          // assert
          expect(response).to.exist;
          expect(response).to.equal(true);
        });
    });

    it('Does not find the node rolled up view', () => {
      // setup
      const host = config.COUCHDB_URL;
      const database = 'twig-unittest';
      const notFoundResponseData = {
        error: 'not_found',
        reason: 'missing'
      };
      const notFoundResponse = {
        statusCode: 404,
        statusMessage: 'missing'
      };

      restler.get.returns({
        on: sinon.stub().yields(notFoundResponseData, notFoundResponse)
      });

      // act
      return node.nodeRollupViewExists(host, database)
        .then((response) => {
          // assert
          expect(response).to.exist;
          expect(response).to.equal(false);
        });
    });
  });

  describe('Fetch the Rollup View Data', () => {
    beforeEach(() => {
      sinon.stub(restler, 'get');
    });

    afterEach(() => {
      restler.get.restore();
    });

    it('Retrieves the data', () => {
      // setup
      const host = config.COUCHDB_URL;
      const database = 'twig-unittest';
      const foundResponseData = {
        rows: [
          {
            key: 'nodes',
            value: [
              {
                type: 'tribe',
                names: ['Mobile Tribe'],
                attrs: []
              },
              {
                type: 'person',
                names: [
                  'Tribal Leader', 'London Tribal Members', 'USA Tribal Members'
                ],
                attrs: [
                  'firstname', 'lastname', 'members'
                ]
              }
            ]
          }
        ]
      };
      const foundResponse = {
        statusCode: 200,
        statusMessage: ''
      };

      restler.get.returns({
        on: sinon.stub().yields(foundResponseData, foundResponse)
      });

      // act
      return node.nodeRollupViewData(host, database)
        .then((response) => {
          // assert
          expect(response).to.exist;
          expect(response.rows).to.exist;
          expect(response.rows.length).to.equal(1);
        });
    });
  });
});
/* eslint-enable no-unused-expressions */
