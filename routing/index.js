import fs from 'fs';
import chokidar from 'chokidar';
import partials from './partials.json';
import api from './production/api/partials.json';
import base from './production/default/partials.json';
import phaseone from './production/phase-one/partials.json';
import weeklypurpose from './production/weeklypurpose/partials.json';
import localhost from './development/partials.json';
import dev_routes from './development/routing.json';
import prod_routes from './production/routing.json';

const COMPILED_INDEX_FILE = config.paths.config('server/compiled.json');

function requests(host){
  if(__DEV__ || __TEST__){
    return localhost;
  }else if(__PROD__){
    switch(host){
    case 'maat.space':
      return base;
    case 'api.maat.space':
      return api;
    case 'phase-one.maat.space':
      return phaseone;
    case 'weeklypurpose.maat.space':
      return weeklypurpose;
    default:
      return base;
    }
  }
}

function routes(key){
  if(__DEV__ || __TEST__){
    if(key) return dev_routes[key];
    else return dev_routes;
  }else if(__PROD__){
    if(key) return prod_routes[key];
    else return prod_routes;
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
function watch_views(path, prop) {
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
      require_or_fallback(views, prop, path, views[prop]);
    })
    .on('change', () => {
      console.log(`Changes detected on ${path} config file.`);
      last = Date.now();
      require_or_fallback(views, prop, path, views[prop]);
    })
    .on('error', (error) => { console.log(error); });

  // This is because I don't fully trust the filesystem watch capabilities of NodeJS
  setInterval(() => {
    let curr = Date.now();
    if(curr - last >= config.views.update_interval){
      console.log(`Polling interval reached for ${path} config file, updating...`);
      last = Date.now();
      require_or_fallback(views, prop, path, views[prop]);
    }
  }, config.views.update_interval);

  console.log(`Watching ${path} config file`);
}

const routing = {
  partials,
  requests,
  routes
};

require_or_fallback(routing, 'compiled', COMPILED_INDEX_FILE, views.compiled, true);
watch_views(COMPILED_INDEX_FILE, 'compiled');

export default routing;
