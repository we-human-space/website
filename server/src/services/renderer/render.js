import fs from 'fs';
import path from 'path';
import mustache from 'mustache';
import chokidar from 'chokidar';
import fswrapper from '../filesystem/index';
import config from '../../config';
import data_loaders from './data';
var views = require('../../static/partials.json');

const COMPILED_ASSET_REGEX = /^\{\{(.*)\}\}$/;

watch_views('../../static/partials.json');

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
    return render_page(req, res, next)
    .catch(catch_render_error(req, res, next));
  }
}

function not_found(req, res, next){
  req.partial = views.requests["404"];
  return render_page(req, res, next)
  .catch(catch_render_error(req, res, next));
}

function get_request_key(req){
  return Object.keys(views.requests)
         .find(regexp => req.path.match(regexp));
}

function catch_render_error(req, res, next){
  return (err) => {
    console.error(err);
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
  fs.readFile(path.join(config.views.path, views.partials["500"].path), (err, data) => {
    if(err){
      res.sendStatus(500);
    }else{
      req.html = data;
      serve(req, res, ()=>{ res.sendStatus(500); });
    }
  });
}

function render_page(req, res, next){
  console.log(`render: ${req.partial}`);
  let data;
  if(!views.partials[req.partial] || req.partial === "404"){
    console.log("render: view not found; render as 404");
    req.partial = "404";
    data = {
      preloaded_state: "{}",
      not_found: views.requests[get_request_key(req)] === "article" ? "article": "page"
    };
    console.log(`data.not_found: ${data.not_found}`);
  }else{
    console.log("render: view found");
    data = {
      ...req.data,
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
    path: path.join(config.views.path, views.partials[key].path),
    content: undefined
  };
}

function set_assets(key, assets = { compiled: [], styles: [], scripts: { head: [], foot: [] } }){
  // Get the assets for partial {key}
  let newassets = views.partials[key].assets;
  return {
    styles: newassets.styles.length
            ? [ ...newassets.styles , ...assets.styles ]
              .filter((e, i, a) => a.indexOf(e) === i)
            : assets.styles,
    scripts: {
      head: newassets.scripts.head.length
            ? [ ...newassets.scripts.head , ...assets.scripts.head ]
              .filter((e, i, a) => a.indexOf(e) === i)
            : assets.scripts.head,
      foot: newassets.scripts.foot.length
            ? [ ...newassets.scripts.foot , ...assets.scripts.foot ]
              .filter((e, i, a) => a.indexOf(e) === i)
            : assets.scripts.foot
    }
  };
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
  .then(() => {
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
      content = content.replace(/\/blog\/article\//g, `/blog/${data.article.hash}/`);
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
  let render_data = { ...data };
  if(page.type === "foot" && assets.scripts.foot.length){
    render_data.scripts = assets.scripts.foot;
  }else if(page.type === "head"){
    if(assets.scripts.head.length) render_data.scripts = assets.scripts.head;
    if(assets.styles.length) render_data.styles = assets.styles;
  }
  return mustache.render(page.content, render_data, page.partials);
}

function serve(req, res, next){
  if(req.html) res.send(req.html);
  else next();
}

/**
 * Watches the filesystem for any externally-triggered changes in configuration
 * This prevents the need for complex asynchronous operations each time a
 * variably-named asset name is requested by a user (essentially every time).
 **/
function watch_views(path) {
  var last = Date.now();
  // Watching the filesystem for changes in the partials.json config file
  console.log(`Starting ${path} config file watcher...`);
  chokidar
    .watch(
      path, { depth: 1, awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 } }
    )
    .on('change', () => {
      console.log(`Changes detected on ${path} config file, updating...`);
      last = Date.now();
      views = require(path);
    })
    .on('error', (error) => { console.error(error); });
  console.log(`Watching ${path} config file`);
  // This is because I don't fully trust the filesystem watch capabilities of NodeJS
  setInterval(() => {
    let curr = Date.now();
    if(last - curr >= config.view.update_interval){
      console.log(`Polling interval reached for ${path} config file, updating...`);
      last = Date.now();
      views = require(path);
    }
  }, config.view.update_interval);
}
