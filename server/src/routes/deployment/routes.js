import express from 'express';
import cors from 'cors';
import renderer from '../../services/renderer/render';
import handlers from '../../handlers/index';


module.exports = (function() {

  const router = express.Router();

  const ALLOWED_ORIGINS = /.*deploy\.(human|maat)\.space/;
  const CORS_OPTIONS = {
    origin: (origin, callback) => {
      if(origin.match(ALLOWED_ORIGINS)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    }
  };

  // AJAX Preflight Response

  router.options('*', cors(CORS_OPTIONS));

  // Page Renderers

  router.get('/quest/@:username', (req,res) => { res.redirect(`/?author="${req.params.username}"`); });

  router.get('/quest/', renderer.render, renderer.serve);

  router.get('/team/', renderer.render, renderer.serve);

  router.get('/vision/', renderer.render, renderer.serve);

  router.get('/weeklydose/', renderer.render, renderer.serve);

  router.get('/weeklydose/already-subscribed', renderer.render, renderer.serve);

  router.get('/weeklydose/subscribed', renderer.render, renderer.serve);

  router.get('/quest/a/:article', handlers.articles.read, renderer.render, renderer.serve);

  router.get('/*/error', renderer.render, renderer.serve);

  router.get('/error', renderer.render, renderer.serve);

  // API Routes

  router.post('/api/feed/', cors(CORS_OPTIONS), handlers.feed);

  router.post('/api/subscribe', cors(CORS_OPTIONS), handlers.newsletter.subscribe);

  // 404 Catchers

  router.get('/*', renderer.not_found, renderer.serve);

  router.post('/*', renderer.not_found, renderer.serve);

  router.put('/*', renderer.not_found, renderer.serve);

  router.delete('/*', renderer.not_found, renderer.serve);


  return router;

})();
