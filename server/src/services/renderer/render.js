import path from 'path';
import mustache from 'mustache';
import fswrapper from '../filesystem/index';
import views from '../../static/partials.json';
import config from '../../config';

module.exports = {
  render: render
};

function render(req, res, next){
  let key = get_request_key(req);
  if(!key){
    next();
  }else{
    req.partial = key;
    return render_page(req, res, next);
  }
}

function get_request_key(req){
  return Object.keys(views.requests)
         .find(regexp => req.path.match(regexp));
}

function render_page(req, res, next){
  if(!views[req.partial]){
    console.log("render: view not found");
    next();
  }else{
    return render_partial(detail_page(req), req.data)
    .then((result) => {
      req.html = result;
      next();
    });
  }
}

function render_partial(page, data) {
  return Promise.resolve([page, data])
  .then(get_children)
  .then(render_children)
  .then(read_file)
  .then(render_file);
}

function detail_page(req){
  return {
    key: req.partial,
    path: path.join(config.views.path, views.partials[req.partial].path),
    content: undefined
  };
}

function get_children([page, data]) {
  console.log(`Reading partials info for ${page.key}`);
  page.children = views.partials[page.key].partials
                  .map(detail_page);
  return Promise.resolve([page, data]);
}

function render_children([page, data]) {
  Promise.all(page.children.map((p) => { render_partial(p, data); }))
  .then((partials) => {
    page.partials = partials;
    return [page, data];
  });
}

function read_file([page, data]) {
  console.log(`Reading partial ${page.key}`);
  if(page.key == "article_content"){
    page.path.replace('{{hash}}', data.article.hash);
  }
  return fswrapper.read(page.path)
  .then((content) => {
    if(page.key == "article_content"){
      console.log("Article file - read");
      content.replace(/\/blog\/article\//g, `/blog/${data.article.hash}/`);
    }
    page.content = content;
    return Promise.resolve([page, data]);
  });
}

function render_file([page, data]) {
  return mustache.render(
    page.content,
    {stylesheet: views.requests[page.key].stylesheet, ...data },
    page.partials
  );
}
