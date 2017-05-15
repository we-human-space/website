import express from 'express';
import renderer from '../../../services/renderer/render';
import handlers from '../../../handlers/index';

module.exports = (function() {

  const router = express.Router();

  // API Routes

  router.post('/feed/', handlers.feed);

  router.get('/test/uploader/report', handlers.articles.test.report);

  router.get('/test/uploader/clear', handlers.articles.test.clear);

  // 404 Catchers

  router.get('/*', renderer.not_found, renderer.serve);

  router.post('/*', renderer.not_found, renderer.serve);

  router.put('/*', renderer.not_found, renderer.serve);

  router.delete('/*', renderer.not_found, renderer.serve);

  return router;

})();
