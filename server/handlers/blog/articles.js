"use strict";

const path = require('path');
const mongo_sanitize = require('mongo-sanitize');
const env = process.env.NODE_ENV || 'development';
const config = require('../.config/server/index')[env];
const hash = require('../services/secure/hash');
const xss = require('../services/secure/xss');
const models = require('../models/index');
const Article = models.Article;
const Author = models.Author;

module.exports = {
  read: read
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
