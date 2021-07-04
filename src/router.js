const _ = require('lodash');
const validate = require('express-validation');
const express = require('express');
const render = require('./http/render-http');
const config = require('./config');
const logger = require('./util/logger')(__filename);
const {
  downloadQuerySchema,
  // renderQuerySchema,
  // renderBodySchema,
  // sharedQuerySchema
} = require('./util/validation');

function createRouter() {
  const router = express.Router();

  if (!_.isEmpty(config.API_TOKENS)) {
    logger.info('x-api-key authentication required');

    router.use('/*', (req, res, next) => {
      const userToken = req.headers['x-api-key'];
      if (!_.includes(config.API_TOKENS, userToken)) {
        const err = new Error('Invalid API token in x-api-key header.');
        err.status = 401;
        return next(err);
      }

      return next();
    });
  } else {
    logger.warn('Warning: no authentication required to use the API');
  }

  const getDownloadSchema = {
    query: downloadQuerySchema,
    options: {
      allowUnknownBody: false,
      allowUnknownQuery: false,
    },
  };
  router.get('/download', validate(getDownloadSchema), render.getDownload2);

  router.get('/', (req, res) => {
    res.redirect(config.SITE_URL);
  });

  return router;
}

module.exports = createRouter;
