import express from 'express';
import renderer from '../services/renderer/render';
import blog from '../handlers/blog/index';

module.exports = (function() {

  const router = express.Router();

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
