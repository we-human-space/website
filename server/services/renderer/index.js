"use strict";

const path = require('path');
const mustache = require('mustache');
const fswrapper = require('../filesystem/index');
const views = require('../../static/partials.json');
const env = process.env.NODE_ENV || 'development';
const config = require('../../../.config/server/index')[env];

module.exports = {
  render: render
};

function render(req, res, next){
  if(!views.requests[req.path]){
    console.log("render: view not found");
    next();
  }else{
    console.log(config.views.path);
    let page = {
      path: path.join(config.views.path, views.requests[req.path].path),
      content: undefined
    }
    let partials = {};
    return fswrapper.read(page.path)
    .then((content) => {
      page.content = content;
      return Promise.all(
        views.requests[req.path].partials.map((p) => {
          if(!views.partials[p]){
            return Promise.reject(p);
          }else{
            return fswrapper.read(path.join(config.views.path, views.partials[p]))
            .then((content) => {
              partials[p] = content;
              return Promise.resolve();
            });
          }
        })
      );
    }).then(() => {
      res.send(
        mustache.render(
          page.content,
          {stylesheet: views.requests[req.path].stylesheet},
          partials
        )
      );
    }).catch((err) => {
      res.sendStatus(500);
    });
  }
}
