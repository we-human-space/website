import path from 'path';
import raw from '../../../.config/client/index';

global.__ENV__ = process.NODE_ENV || 'development';
global.__PROD__ = global.__ENV__ === 'production';
global.__DEV__ = global.__ENV__ === 'development';
global.__TEST__ = global.__ENV__ === 'test';

const config = raw[process.NODE_ENV || 'development'];

config.routing = require(`../../../routing/${global.__ENV__}`);

config.global = {
  env: process.env.NODE_ENV || 'development',
  path_base: path.resolve(__dirname, '..'),
  server_port: 3000,
  dir_root: '../../',
  dir_config: '../../.config',
  dir_src: 'src',
  dir_dist: 'dist',
  dir_public: 'public',
  dir_test: 'test',
  dir_views: 'views'
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

export default config;
