"use strict";

const path = require('path');
const mongo_sanitize = require('mongo-sanitize');
const env = process.env.NODE_ENV || 'development';
const config = require('../../../.config/server/index')[env];
const hash = require('../../services/secure/hash');
const xss = require('../../services/secure/xss');
const fswrapper = require('../../services/filesystem/index');
const uploader = require('../../services/articles/uploader');
const models = require('../../models/index');
const Article = models.Article;
const Author = models.Author;

const ARTICLE_DIR = path.join(__dirname, '../../', config.views.path, config.views.articles.path);

module.exports = {
  read: read,
  test: {
    report: report,
    clear: clear
  }
};

function read(req, res, next) {
  let param = mongo_sanitize(req.params.article);
  let query = {};
  if(hash.isBase62Hash(param)){
    query.hash = param;
  }else{
    query.url = param;
  }

  Article.findOne(query)
  .then((article) => {
    //Fetching author from cache/database
    //Saving to cache if not in it already, for faster later reload
    let authorid = article.author;
    let cached = Author.findFromCache(article.author);
    if(cached){
      return Promise.resolve(cached);
    }else{
      return new Promise((resolve, reject) => {
        article.populate({path: 'author'}, (err, author) => {
          if(err) reject(err);
          else resolve(author);
        });
      }).then((author) => {
        Author.saveToCache(authorid, author);
        return author;
      });
    }
  })
  .then((article) => {
    //If found, render
    if(article){
      article = xss({
        title: article.title,
        url: path.join(config.views.articles.path, article.url, 'index.html'),
        subject: article.subject,
        category: article.category,
        summary: article.summary,
        author: article.author,
        thumbnail: article.thumbnail
      });
      res.render(config.views.articles.template, article);
    //Else next to 404
    }else{
      next();
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
        return fswrapper.remove(path.join(ARTICLE_DIR, a.url));
      }));
    }else{
      res.sendStatus(404);
    }
  }).then(() => {
    res.sendStatus(200);
  });
}
