import fs from 'fs';
import mustache from 'mustache';
import fswrapper from '../filesystem/index';
import config from '../../config';
import data_loaders from './data';
import views from './routing/index';

const COMPILED_NAME_REGEX = /^\{\{(.*)\}\}$/;

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
    req.partial = key;
    return render_page(req, res, next)
    .catch(catch_render_error(req, res, next));
  }
}

function not_found(req, res, next){
  req.partial = '404';
  return render_page(req, res, next)
  .catch(catch_render_error(req, res, next));
}

function get_request_key(req){
  console.log(req.get('host'));
  let routing = views.requests(req.get('host'));
  return routing[
           Object.keys(routing)
             .find(regexp => req.path.match(regexp))
         ];
}

function catch_render_error(req, res, next){
  return (err) => {
    console.log(err);
    if(req.partial !== 'error'){
      console.log('redirecting to error');
      req.partial = 'error';
      return render_page(req, res, next);
    }else{
      console.log('redirecting to armageddon');
      armageddon(req, res);
    }
  };
}

function armageddon(req, res){
  fs.readFile(config.paths.views(views.partials['500'].path), (err, data) => {
    if(err){
      res.sendStatus(500);
    }else{
      req.html = data.toString();
      serve(req, res, ()=>{ res.sendStatus(500); });
    }
  });
}

function render_page(req, res, next){
  console.log(`render: ${req.partial}`);
  let data;
  if(!views.partials[req.partial] || req.partial === '404'){
    console.log('render: view not found; render as 404');
    req.partial = '404';
    data = {
      preloaded_state: '{}',
      routing: views.routes(),
      not_found: get_request_key(req) === 'article' ? 'article': 'page'
    };
  }else{
    console.log('render: view found');
    data = {
      ...req.data,
      routing: views.routes(),
      preloaded_state: data_loaders.preloaded_state(req)
    };
  }
  return render_partial([detail_page(req.partial), undefined, data])
  .then((result) => {
    req.html = result;
    next();
  });
}

function detail_page(key){
  return {
    key,
    type: views.partials[key].type,
    path: config.paths.views(views.partials[key].path),
    content: undefined
  };
}

function set_assets(key, assets = { styles: [], scripts: { head: [], foot: [] } }){
  // Get the assets for partial {key}
  let newassets = views.partials[key].assets;
  assets.styles = newassets.styles.length
            ? [ ...newassets.styles.map(compile_name) , ...assets.styles ]
              .filter((e, i, a) => a.indexOf(e) === i)
            : assets.styles;
  assets.scripts = {
    head: newassets.scripts.head && newassets.scripts.head.length
          ? [ ...newassets.scripts.head.map(compile_name) , ...assets.scripts.head ]
            .filter((e, i, a) => a.indexOf(e) === i)
          : assets.scripts.head,
    foot: newassets.scripts.foot && newassets.scripts.foot.length
          ? [ ...newassets.scripts.foot.map(compile_name) , ...assets.scripts.foot ]
            .filter((e, i, a) => a.indexOf(e) === i)
          : assets.scripts.foot
  };

  return assets;
}

function compile_name(name) {
  let is_to_compile = name.match(COMPILED_NAME_REGEX);
  return is_to_compile && views.compiled && views.compiled[is_to_compile[1]]
         ? views.compiled[is_to_compile[1]]
         : name;
}

function render_partial([page, assets, data]) {
  return Promise.resolve([page, set_assets(page.key, assets), data])
  .then(get_children)
  .then(render_children)
  .then(read_file)
  .then(render_file);
}

function get_children([page, assets, data]) {
  page.children = views.partials[page.key].partials
                  .map(detail_page);
  return Promise.resolve([page, assets, data]);
}

function render_children([page, assets, data]) {
  return Promise.all(page.children.map((p) => render_partial([p, assets, data])))
  .then((rendered) => {
    page.children.map((p, i) => {
      p.content = rendered[i];
      return p;
    });
    return [page, assets, data];
  });
}

function read_file([page, assets, data]) {
  if(page.key == 'article_content'){
    page.path = page.path.replace('{{hash}}', data.article.hash);
  }
  return fswrapper.read(page.path)
  .then((content) => {
    if(page.key == 'article_content'){
      content = content.replace(/\/{{hash}}\//g, `/${data.article.hash}/`);
    }
    page.content = content;
    return Promise.resolve([page, assets, data]);
  });
}

function render_file([page, assets, data]) {
  page.partials = page.children.reduce((acc, p) => {
    acc[p.key] = p.content;
    return acc;
  }, {});
  // Gathering render data (data + assets)
  let render_data;
  if(page.type === 'foot'){
    render_data = { ...data, scripts: assets.scripts.foot.slice()};
  }else if(page.type === 'head'){
    render_data = { ...data, scripts: assets.scripts.head.slice(), styles: assets.styles.slice()};
  }else{
    render_data = { ...data };
  }
  return mustache.render(page.content, render_data, page.partials);
}

function serve(req, res, next){
  if(req.html) res.send(req.html);
  else next();
}
