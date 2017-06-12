import fs from 'fs';
import chokidar from 'chokidar';
import config from '../../../config';
import partials from './partials.js';
import deployment from './deployment/requests.json';
import localhost from './development/requests.json';
import production from './production/requests.json';

const DEPLOY_ROUTES = require(config.paths.root('routing/deployment/routing.json'));
const DEV_ROUTES = require(config.paths.root('routing/development/routing.json'));
const PROD_ROUTES = require(config.paths.root('routing/production/routing.json'));
const COMPILED_INDEX_FILE = config.paths.config('server/compiled.json');

function requests(){
  if(__DEV__ || __TEST__){
    return localhost;
  }else if(__DEPLOY__){
    return deployment;
  }else if(__PROD__){
    return production;
  }
}

function routes(key){
  if(__DEV__ || __TEST__){
    if(key) return DEV_ROUTES[key];
    else return DEV_ROUTES;
  }else if(__DEPLOY__){
    if(key) return DEPLOY_ROUTES[key];
    else return DEPLOY_ROUTES;
  }else if(__PROD__){
    if(key) return PROD_ROUTES[key];
    else return PROD_ROUTES;
  }
}

function require_or_fallback(target, prop, path, fallback = {}, sync) {
  fs[sync ? 'readFileSync' : 'readFile'](path, 'utf8', function (err, data) {
    if(err){
      target[prop] = fallback;
    }else{
      try{
        target[prop] = JSON.parse(data);
      }catch(e){
        target[prop] = fallback;
      }
    }
    console.log(target[prop]);
    console.log(`Updated views[${prop}].`);
  });
}

/**
 * Watches the filesystem for any externally-triggered changes in configuration
 * This prevents the need for complex asynchronous operations each time a
 * variably-named asset name is requested by a user (essentially every time).
 **/
function watch_views(target, prop, path) {
  var last = Date.now();

  // Watching the filesystem for changes in the partials.json config file
  console.log(`Starting ${path} config file watcher...`);
  chokidar
    .watch(
      path, { depth: 1, awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 1000 } }
    )
    .on('add', () => {
      console.log(`Changes detected on ${path} config file.`);
      last = Date.now();
      require_or_fallback(target, prop, path, target[prop]);
    })
    .on('change', () => {
      console.log(`Changes detected on ${path} config file.`);
      last = Date.now();
      require_or_fallback(target, prop, path, target[prop]);
    })
    .on('error', (error) => { console.log(error); });

  // This is because I don't fully trust the filesystem watch capabilities of NodeJS
  setInterval(() => {
    let curr = Date.now();
    if(curr - last >= config.views.update_interval){
      console.log(`Polling interval reached for ${path} config file, updating...`);
      last = Date.now();
      require_or_fallback(target, prop, path, target[prop]);
    }
  }, config.views.update_interval);

  console.log(`Watching ${path} config file`);
}

const routing = {
  partials,
  requests,
  routes
};

require_or_fallback(routing, 'compiled', COMPILED_INDEX_FILE, {}, true);
watch_views(routing, 'compiled', COMPILED_INDEX_FILE);

module.exports = routing;
