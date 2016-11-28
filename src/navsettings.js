const PouchDb = require('pouchdb');
const config = require('./utils/config');
const Joi = require('joi');

const put = (request, reply) => {
  const db = new PouchDb(`${config.DB_URL}/${request.params.id}`, { skip_setup: true });
  db.get('views')
  .then(doc => {
    const id = request.payload._viewId;
    const key = request.payload.key;
    const value = request.payload.value;

    if (!doc.data[id].nav) {
      doc.data[id].nav = {};
    }
    if (!value) {
      delete doc.data[id].nav[key];
      return db.put(doc);
    }
    else if (doc.data[id].nav[key] !== value) {
      doc.data[id].nav[key] = value;
      return db.put(doc);
    }
    return undefined;
  })
  .then(() => reply({}).code(202))
  .catch(error => {
    if (error.error !== 'conflict') {
      console.warn(error);
    }
  });
};

exports.routes = [{
  method: ['PUT'],
  path: '/twiglets/{id}/navsettings',
  handler: put,
  config: {
    validate: {
      payload: {
        _viewId: Joi.string().required().trim(),
        key: Joi.string().required().trim(),
        value: Joi.any().required(),
      }
    }
  }
}];