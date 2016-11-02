const Joi = require('joi');
const Auth = require('./auth');
const Twiglets = require('./twiglets');
const Ping = require('./ping');
const Changelog = require('./changelog');

module.exports = [
  {
    method: ['GET'], path: '/ping', handler: Ping.ping
  },
  {
    method: ['POST'],
    path: '/twiglets/{id}',
    handler: Twiglets.update,
    config: {
      validate: {
        payload: {
          nodes: Joi.array().required(),
          links: Joi.array().required(),
          commit: Joi.object().keys({
            commitMessage: Joi.string().required(),
          }).required(),
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/twiglets/{id}/changelog',
    handler: Changelog.get,
  },
  {
    method: ['POST'],
    path: '/login',
    handler: Auth.login,
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      validate: {
        payload: {
          email: Joi.string().email().required(),
          password: Joi.string().required()
        }
      },
    }
  },
  {
    method: 'POST',
    path: '/logout',
    handler: Auth.logout,
    config: {
      auth: false,
    }
  }
];
