import express from 'express';
import cors from 'cors';
import renderer from '../../../../services/renderer/render';
import handlers from '../../../../handlers/index';


module.exports = (function() {

  const router = express.Router();

  // const ALLOWED_ORIGINS = /.*maat\.space/;
  // const CORS_OPTIONS = {
  //   origin: (origin, callback) => {
  //     if(origin.match(ALLOWED_ORIGINS)) callback(null, true);
  //     else callback(new Error('Not allowed by CORS'));
  //   }
  // };

  router.options('*', cors());

  // API Routes

  router.post('/feed/', handlers.feed);

  // 404 Catchers

  router.get('/*', renderer.not_found, renderer.serve);

  router.post('/*', renderer.not_found, renderer.serve);

  router.put('/*', renderer.not_found, renderer.serve);

  router.delete('/*', renderer.not_found, renderer.serve);

  return router;

})();
