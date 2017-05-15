import path from 'path';
import raw from '../../.config/server/index';

global.__ENV__ = process.NODE_ENV || 'development';
global.__PROD__ = __ENV__ == 'production';
global.__DEV__ = __ENV__ == 'development';
global.__TEST__ = __ENV__ == 'test';

const config = raw[process.NODE_ENV || 'development'];

config.global = {
  port: 8080,
  env: process.env.NODE_ENV || 'development',
  path_base: path.resolve(__dirname, '..'),
  server_port: 3000,
  dir_root: '../../',
  dir_config: '../../.config',
  dir_src: 'src',
  dir_dist: 'dist',
  dir_public: 'public',
  dir_test: 'test',
  dir_views: '../../client/blog/views'
};

config.paths = {
  base: base,
  root: base.bind(null, config.dir_root),
  config: base.bind(null, config.dir_config),
  src: base.bind(null, config.dir_src),
  dist: base.bind(null, config.dir_dist),
  views: base.bind(null, config.dir_views)
};

function base () {
  const args = [config.path_base].concat([].slice.call(arguments));
  return path.resolve.apply(path, args);
}

export default config;
