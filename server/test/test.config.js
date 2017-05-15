const path = require('path');
const raw = require('../../.config/server/index');

const config = raw[process.NODE_ENV || 'development'];

config.global = {
  host: process.env.SERVER_HOST || 'http://172.19.0.3',
  port: process.env.SERVER_PORT || 8080,
  env: process.env.NODE_ENV || 'development',
  path_base: path.resolve(__dirname, '..'),
  server_port: 3000,
  dir_root: '../',
  dir_config: '../.config',
  dir_src: 'src',
  dir_dist: 'dist',
  dir_public: 'public',
  dir_test: 'test',
  dir_views: '../client/blog/views'
};

config.paths = {
  base: base,
  root: base.bind(null, config.global.dir_root),
  config: base.bind(null, config.global.dir_config),
  src: base.bind(null, config.global.dir_src),
  dist: base.bind(null, config.global.dir_dist),
  views: base.bind(null, config.global.dir_views)
};

function base () {
  const args = [config.global.path_base].concat([].slice.call(arguments));
  return path.resolve.apply(path, args);
}

global.__ENV__ = config.env;
global.path = path;
global.assert = require('assert');
global.supertest = require('supertest');
global.config = config;
global.models = require('../../dist/models/index');
global.routing = require(config.paths.root(`routing/${config.global.env}/routing.json`));
global.server = supertest.agent(`${config.global.host}:${config.global.port}`);
