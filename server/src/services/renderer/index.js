"use strict";

import path from 'path';
import mustache from 'mustache';
import fswrapper from '../filesystem/index';
import views from '../../static/partials.json';
import config from '../../config';

const ARTICLE_DIR = path.join(__dirname, "../../../", config.views.path, config.views.articles.path);

module.exports = {
  renderPage: render_page,
  renderArticle: render_article
};

function render_page(req, res, next){
  if(!views.requests[req.path]){
    console.log("render: view not found");
    next();
  }else{
    let page = {
      partial_key: req.path,
      path: path.join(config.views.path, views.requests[req.path].path),
      content: undefined
    };
    let data = {page: page, req: req, res: res, next: next};
    return read_template(data)
    .then(read_partials)
    .then(render_html)
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
  }
}

function render_article(req, res, next){
  let page = {
    partial_key: "/blog/article",
    path: path.join(config.views.path, views.requests["/blog/article"].path),
    content: undefined
  };
  let data = {page: page, req: req, res: res, next: next};
  return read_template(data)
  .then(read_partials)
  .then(read_article)
  .then(render_html)
  .catch((err) => {
    console.log(err);
    res.sendStatus(500);
  });
}

function read_template(data){
  console.log(`Reading template for ${data.page.path}`);
  return fswrapper.read(data.page.path)
  .then((content) => {
    data.page.content = content;
    return data;
  });
}

function read_partials(data){
  console.log(`Reading partials for ${data.page.path}`);
  data.partials = {};
  return Promise.all(
    views.requests[data.page.partial_key].partials.map((p) => {
      if(!views.partials[p]){
        return Promise.reject(p);
      }else{
        return fswrapper.read(path.join(config.views.path, views.partials[p]))
        .then((content) => {
          data.partials[p] = content;
          return Promise.resolve();
        });
      }
    })
  ).then(() => data);
}

function read_article(data){
  console.log(`Reading article file ${data.req.article.url}`);
  data.req.article.thumbnail.src = `/blog/${data.req.article.hash}/thumbnail${data.req.article.thumbnail.mime}`;
  return fswrapper.read(path.join(ARTICLE_DIR, data.req.article.hash, 'index.html'))
  .then((content) => {
    console.log("Article file - read");
    data.partials["article"] = content.replace(/\/blog\/article\//g, `/blog/${data.req.article.hash}/`);
    return Promise.resolve(data);
  });
}

function render_html(data){
  console.log(`Sending ${data.page.path}`);
  data.res.send(
    mustache.render(
      data.page.content,
      {stylesheet: views.requests[data.page.partial_key].stylesheet, article: data.req.article},
      data.partials
    )
  );
}
