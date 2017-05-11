import express from 'express';
import subdomain from 'express-subdomain';
import api from './subdomains/api/routes';
import base from './subdomains/default/routes';
import phaseone from './subdomains/phase-one/routes';
import weeklypurpose from './subdomains/weeklypurpose/routes';

module.exports = (function() {

  const router = express.Router();

  router.use(subdomain('api', api));

  router.use(subdomain('phase-one', phaseone));

  router.use(subdomain('weeklypurpose', weeklypurpose));

  router.use('/', base);

  return router;

})();
