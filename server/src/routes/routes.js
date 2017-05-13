import uuid from 'uuid';
import express from 'express';
import renderer from '../services/renderer/render';
import handlers from '../handlers/index';

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

  // Static Page Rendering

  router.get('/', (req,res) => { res.redirect('/vision'); });

  router.get('/team', renderer.render, renderer.serve);

  router.get('/vision', renderer.render, renderer.serve);

  router.get('/already-subscribed', renderer.render, renderer.serve);

  router.get('/subscribed', renderer.render, renderer.serve);

  router.get('/error', renderer.render, renderer.serve);

  router.get('/blog/', renderer.render, renderer.serve);

  router.get('/blog/:article', handlers.articles.read, renderer.render, renderer.serve);

  if(__DEV__ || __TEST__) {
    router.get('/weeklypurpose', renderer.render, renderer.serve);
  }

  // AJAX Data Requests

  router.post('/feed/', handlers.feed);

  router.post('/subscribe', handlers.newsletter.subscribe);

  // Testing Endpoints

  if(__DEV__){
    router.get('/test/uploader/report', handlers.articles.test.report);
    router.get('/test/uploader/clear', handlers.articles.test.clear);
  }

  // 404 Handlers

  router.get('/*', renderer.not_found, renderer.serve);
  router.post('/*', renderer.not_found, renderer.serve);
  router.put('/*', renderer.not_found, renderer.serve);
  router.delete('/*', renderer.not_found, renderer.serve);

  return router;

})();
