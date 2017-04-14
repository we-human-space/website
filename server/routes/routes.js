'use strict';
const uuid = require("node-uuid");
const express = require('express');
const renderer = require('../services/renderer/index');
const blog = require('../handlers/blog/index');

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

  router.get('/', renderer.render);

  router.get('/crew', renderer.render);

  router.get('/life', renderer.render);

  router.get('/blog/:article', blog.articles.read);

  router.use(function(req, res, next) {
    //TODO 404
    res.sendStatus(404);
  });

  return router;

})();
