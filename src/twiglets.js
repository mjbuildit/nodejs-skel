const PouchDb = require('pouchdb');
const config = require('./utils/config');
const Boom = require('boom');

module.exports.update = (request, reply) => {
  const db = new PouchDb(`${config.DB_URL}/${request.params.id}`, { skip_setup: true });
  return db.info()
    .then(() => db.get('changelog')
      .catch((error) => {
        if (error.status !== 404) {
          throw error;
        }
        return { _id: 'changelog', data: [] };
      }))
    .then((doc) => {
      const commit = {
        message: request.payload.commit.commitMessage,
        user: request.auth.credentials.user.name,
        timestamp: new Date().toISOString(),
      };
      doc.data.unshift(commit);
      return db.put(doc);
    })
    .then(() => reply())
    .catch((error) => reply(Boom.wrap(error, error.status, error.message)));
};
