"use strict";

import path from 'path';
import mongo_sanitize from 'mongo-sanitize';
import config from '../../config';
import hash from '../../services/secure/hash';
import xss from '../../services/secure/xss';
import fswrapper from '../../services/filesystem/index';
import uploader from '../../services/articles/uploader';
import renderer from '../../services/renderer/render';
import models from '../../models/index';
const Article = models.Article;

const ARTICLE_DIR = path.join(__dirname, '../../', config.views.path, config.views.articles.path);

module.exports = {
  read: read,
  test: {
    report: report,
    clear: clear
  }
};

function read(req, res, next) {
  console.log(`Receiving article reading request: ${req.url}`);
  let param = mongo_sanitize(req.params.article);
  let query = {};
  if(hash.isBase62Hash(param)){
    query.hash = param;
  }else{
    query.url = param;
  }

  Article.findOne(query)
  .then((article) => {
    console.log(article ? `Found article ${query.url || query.hash}` : `Didn't find article ${query.url || query.hash}`);
    if(article){
      return new Promise((resolve, reject) => {
        article.populate({path: 'author'}, (err, article) => {
          if(err) reject(err);
          else resolve(article);
        });
      });
    }else{
      let err = new Error("Article not found");
      err.status = 404;
      return Promise.reject(err)
    }
  }).then((article) => {
    console.log(`Found author ${article.author.username}`);
    //If found, render
    if(article){
      let art = article.export();
      //req.article = xss(art);
      req.data = {article: art};
      next();
    //Else next to 404
    }else{
      res.status = 404;
      next();
    }
  }).catch((err) => {
    console.error(err);
    if(err.status === 404){
      res.status = 404;
      next();
    }else{
      res.sendStatus(500);
    }
  });
}

function report(req, res){
  uploader.report(req.body.filename)
  .then((data) => {
    res.json({data: data});
  }).catch((err) => {
    res.status = 404;
    res.json({error: err});
  });
}

function clear(req, res){
  Article.find({subject: /Test/})
  .then((articles) => {
    if(articles.length){
      return Promise.all(articles.map((a) => {
        return fswrapper.remove(path.join(ARTICLE_DIR, a.hash));
      }));
    }else{
      res.sendStatus(404);
    }
  }).then(() => {
    res.sendStatus(200);
  }).catch(() => {
    res.sendStatus(500);
  });
}
