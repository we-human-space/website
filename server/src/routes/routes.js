import uuid from 'uuid';
import express from 'express';
import renderer from '../services/renderer/index';
import blog from '../handlers/blog/index';

module.exports = (function() {

  var router = express.Router();

  router.use(function(req, res, next){
    req.uuid = uuid.v4();
    console.log(
     '\n'+
     `Host: ${req.headers.host}\n`+
     `Remote: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}\n` +
     `Request: ${req.method} ${req.url}\n`+
     `UUID: ${req.uuid}\n`+
     `Timestamp: ${new Date()} // ${Date.now()}\n`
    );
    next();
  });

  router.get('/', renderer.renderPage);

  router.get('/team', renderer.renderPage);

  router.get('/vision', renderer.renderPage);

  router.post('/feed/', blog.feed);

  router.get('/blog/', renderer.renderPage);

  router.get('/blog/:article', blog.articles.read);

  if(__DEV__){
    router.get('/test/uploader/report', blog.articles.test.report);
    router.get('/test/uploader/clear', blog.articles.test.clear);
  }

  router.use(function(req, res, next) {
    //TODO 404
    res.sendStatus(404);
  });

  return router;

})();
