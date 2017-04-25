/*
 * AUTHORSHIP DISCLAIMER: This config file is heavily inspired from davezuko's
 * React Redux Starter Kit, available at
 * https://github.com/davezuko/react-redux-starter-kit/tree/1a4a71b182782bc12109f98106d3a65519003447
*/

const project = require('./project.config');
const webpack = require('webpack');
const __DEV__ = project.globals.__DEV__;
const __PROD__ = project.globals.__PROD__;
const __TEST__ = project.globals.__TEST__;


const webpack_config = {
  /* BASE CONFIG */
  name: 'client',
  target: 'web',
  entry: [project.paths.src()],
  output: {
    path: project.paths.dist(),
    filename: 'bundle.js',
    //filename: '[name].[hash].js',
    //chunkFilename: '[id].[chunkhash].js'
  },
  module: {},
  plugins: [],
  /* DEV TOOLS */
  devtool: __DEV__ ? 'eval-cheap-module-source-map' : 'source-map'
};

/* ENTRY POINTS */
// webpack_config.entry = {
//   app: __DEV__
//     ? [project.paths.src('index.js'), `webpack-hot-middleware/client?path=${project.compiler.public_path}__webpack_hmr`]
//     : [project.paths.src()],
//   vendor: project.compiler.vendors
// };

webpack_config.module.loaders = [{
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  loader: 'babel-loader'
}, {
  test: /\.json$/,
  loader: 'json-loader'
}];

webpack_config.plugins.push(
  new webpack.DefinePlugin(project.globals)
);

// if(__DEV__){
//   console.log('Enabling plugins for live development (HMR, NoErrors).');
//   webpack_config.plugins.push(
//     new webpack.HotModuleReplacementPlugin(),
//     new webpack.NoEmitOnErrorsPlugin()
//   );
// }

webpack_config.externals = {};
webpack_config.externals['react/lib/ExecutionEnvironment'] = true;
webpack_config.externals['react/lib/ReactContext'] = true;
webpack_config.externals['react/addons'] = true;

module.exports = webpack_config;
