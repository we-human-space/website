import uuid from 'uuid';
import express from 'express';

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

  return router;

})();
