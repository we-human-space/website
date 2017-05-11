import express from 'express';
import renderer from '../services/renderer/render';
import blog from '../handlers/blog/index';

module.exports = (function() {

  const router = express.Router();

  // Page Renderers

  router.get('/@:username', (req,res) => { res.redirect(`/?author="${req.params.username}"`); });

  router.get('/', renderer.render, renderer.serve);

  router.get('/team', renderer.render, renderer.serve);

  router.get('/vision', renderer.render, renderer.serve);

  router.get('/a/:article', blog.articles.read, renderer.render, renderer.serve);

  // API Routes

  router.post('/api/feed/', blog.feed);

  router.get('/api/test/uploader/report', blog.articles.test.report);

  router.get('/api/test/uploader/clear', blog.articles.test.clear);

  // 404 Catchers

  router.get('/*', renderer.not_found, renderer.serve);

  router.post('/*', renderer.not_found, renderer.serve);

  router.put('/*', renderer.not_found, renderer.serve);

  router.delete('/*', renderer.not_found, renderer.serve);


  return router;

})();
