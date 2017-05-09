/*
 * AUTHORSHIP DISCLAIMER: This config file is heavily inspired from davezuko's
 * React Redux Starter Kit, available at
 * https://github.com/davezuko/react-redux-starter-kit/tree/1a4a71b182782bc12109f98106d3a65519003447
*/

const path = require('path');

const config = {
  env: process.env.NODE_ENV || 'development',
  path_base: path.resolve(__dirname, '..'),
  server_port: 3000,
  dir_src: 'src',
  dir_dist: 'dist',
  dir_public: 'public',
  dir_server: 'server',
  dir_test: 'tests'
};

config.compiler = {
  versionning: {
    file: '.versions.json'
  },
  public_path: '/',
  vendors: [
    'react',
    'react-redux',
    'react-router',
    'redux'
  ]
};

config.clean = {
  versionning: {
    keep_count: 2,
    file: '.versions.json'
  }
};

config.paths = {
  base: base,
  src: base.bind(null, config.dir_src),
  dist: base.bind(null, config.dir_dist),
  public: base.bind(null, config.dir_public)
};

config.globals = {
  'process.env': {
    'NODE_ENV': JSON.stringify(config.env)
  },
  'NODE_ENV': config.env,
  '__DEV__': config.env === 'development',
  '__PROD__': config.env === 'production',
  '__TEST__': config.env === 'test'
};

function base () {
  const args = [config.path_base].concat([].slice.call(arguments));
  return path.resolve.apply(path, args);
}

module.exports = config;
