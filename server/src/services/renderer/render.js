import path from 'path';
import mustache from 'mustache';
import serialize from 'serialize-javascript';
import fswrapper from '../filesystem/index';
import views from '../../static/partials.json';
import config from '../../config';
import models from '../../models';

const Article = models.Article;
const Author = models.Author;

module.exports = {
  render: render,
  not_found: not_found,
  serve: serve
};

function render(req, res, next){
  let key = get_request_key(req);
  if(!key || res.status === 404){
    not_found(req, res, next);
  }else{
    req.partial = views.requests[key];
    return render_page(req, res, next);
  }
}

function not_found(req, res, next){

  req.partial = views.requests["404"];
  return render_page(req, res, next);
}

function get_request_key(req){
  return Object.keys(views.requests)
         .find(regexp => req.path.match(regexp));
}

function get_preloaded_state(req){
  return serialize({
    fetching: {
      refresh: false,
      initial: false,
      load_more: false
    },
    query: req.query || {},
    entities: {
      subjects: Article.getCachedSubjects().map((s) => ({key: s, text: s, query: {'subject': s}})),
      pages: {},
      authors: Author.getCachedAuthors(true),
      navlinks: [
        {key:'Blog',text: 'Blog'},
        {key:'Team', text: 'Team'},
        {key:'Vision', text: 'Vision'}
      ]
    },
    feed: {}
  }, {isJSON: true});
}

function render_page(req, res, next){
  console.log(`render: ${req.partial}`);
  let data;
  if(!views.partials[req.partial] || req.partial === "404"){
    console.log("render: view not found; render as 404");
    req.partial = "404";
    data = { preloaded_state: "{}" , not_found: views.requests[get_request_key(req)] === "article" ? "article": "page"};
    console.log(`data.not_found: ${data.not_found}`);
  }else{
    console.log("render: view found");
    data = { ...req.data, preloaded_state: get_preloaded_state(req)};
  }

  data.stylesheet = data.stylesheet || views.partials[req.partial].stylesheet;
  return render_partial([detail_page(req.partial), data])
  .then((result) => {
    req.html = result;
    next();
  });
}

function render_partial([page, data]) {
  page.stylesheet = page.stylesheet || data.stylesheet;
  return Promise.resolve([page, data])
  .then(get_children)
  .then(render_children)
  .then(read_file)
  .then(render_file);
}

function detail_page(key){
  return {
    key,
    path: path.join(config.views.path, views.partials[key].path),
    stylesheet: views.partials[key].stylesheet,
    content: undefined
  };
}

function get_children([page, data]) {
  page.children = views.partials[page.key].partials
                  .map(detail_page);
  return Promise.resolve([page, data]);
}

function render_children([page, data]) {
  return Promise.all(page.children.map((p) => render_partial([p, data])))
  .then(() => {
    return [page, data];
  });
}

function read_file([page, data]) {
  if(page.key == 'article_content'){
    page.path = page.path.replace('{{hash}}', data.article.hash);
  }
  return fswrapper.read(page.path)
  .then((content) => {
    if(page.key == 'article_content'){
      content = content.replace(/\/blog\/article\//g, `/blog/${data.article.hash}/`);
    }
    page.content = content;
    return Promise.resolve([page, data]);
  });
}

function render_file([page, data]) {
  page.partials = page.children.reduce((acc, p) => {
    acc[p.key] = p.content;
    return acc;
  }, {});
  return mustache.render(
    page.content,
    { ...data, stylesheet: page.stylesheet },
    page.partials
  );
}

function serve(req, res, next){
  if(req.html) res.send(req.html);
  else next();
}

function capitalize(str) {
  return str.split(' ').map((s) => s.charAt(0).toUpperCase()+s.substr(1).toLowerCase()).join(' ');
}
