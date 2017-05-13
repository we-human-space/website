import express from 'express';
import renderer from '../services/renderer/render';
import handlers from '../handlers/index';


module.exports = (function() {

  const router = express.Router();

  // Page Renderers

  router.get('/@:username', (req,res) => { res.redirect(`/?author="${req.params.username}"`); });

  router.get('/', renderer.render, renderer.serve);

  router.get('/team', renderer.render, renderer.serve);

  router.get('/vision', renderer.render, renderer.serve);

  router.get('/weeklypurpose', renderer.render, renderer.serve);

  router.get('/already-subscribed', renderer.render, renderer.serve);

  router.get('/subscribed', renderer.render, renderer.serve);

  router.get('/a/:article', handlers.articles.read, renderer.render, renderer.serve);

  router.get('/error', renderer.render, renderer.serve);

  // API Routes

  router.post('/api/feed/', handlers.feed);

  router.post('/api/subscribe', handlers.newsletter.subscribe);

  router.get('/api/test/uploader/report', handlers.articles.test.report);

  router.get('/api/test/uploader/clear', handlers.articles.test.clear);

  // 404 Catchers

  router.get('/*', renderer.not_found, renderer.serve);

  router.post('/*', renderer.not_found, renderer.serve);

  router.put('/*', renderer.not_found, renderer.serve);

  router.delete('/*', renderer.not_found, renderer.serve);


  return router;

})();
