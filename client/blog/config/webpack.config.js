/*
 * AUTHORSHIP DISCLAIMER: This config file is heavily inspired from davezuko's
 * React Redux Starter Kit, available at
 * https://github.com/davezuko/react-redux-starter-kit/tree/1a4a71b182782bc12109f98106d3a65519003447
*/

const path = require('path');
const project = require('./project.config');

const webpack_config = {
  name: 'client',
  target: 'web',
  entry: project.paths.src(),
  output: {
    path: project.paths.dist(),
    filename: `bundle.js`
  },
  module: {
    // rules: [
    //  {test: /\.(js|jsx)$/, use: 'babel-loader'}
    // ]
  },
  plugins: []
};

webpack_config.module.loaders = [{
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  loader: 'babel-loader'
}, {
  test: /\.json$/,
  loader: 'json'
}];

webpack_config.externals = {};
webpack_config.externals['react/lib/ExecutionEnvironment'] = true;
webpack_config.externals['react/lib/ReactContext'] = true;
webpack_config.externals['react/addons'] = true;

module.exports = webpack_config;
