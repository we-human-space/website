const fs = require('fs-extra');
const webpack = require('webpack');
const project = require('../config/project.config');
const webpack_config = require('../config/webpack.config');

// Wrapper around webpack to promisify its compiler and supply friendly logging
const webpack_compiler = (webpack_config) =>
  new Promise((resolve, reject) => {
    const compiler = webpack(webpack_config);

    compiler.run((err, stats) => {
      if (err) {
        console.log('Webpack compiler encountered a fatal error.', err);
        return reject(err);
      }

      const jsonStats = stats.toJson();
      console.log('Webpack compile completed.');

      if (jsonStats.errors.length > 0) {
        console.log('Webpack compiler encountered errors.');
        console.log(jsonStats.errors.join('\n'));
        return reject(new Error('Webpack compiler encountered errors'));
      } else if (jsonStats.warnings.length > 0) {
        console.log('Webpack compiler encountered warnings.');
        console.log(jsonStats.warnings.join('\n'));
      } else {
        console.log('No errors or warnings encountered.');
      }
      resolve(jsonStats);
    });
  });

const compile = () => {
  console.log('Starting compiler.');
  return Promise.resolve()
    .then(() => webpack_compiler(webpack_config))
    .then(stats => {
      console.log('Copying static assets to dist folder.');
      fs.copySync(project.paths.public(), project.paths.dist());
    })
    .then(() => {
      console.log('Compilation completed successfully.');
    })
    .catch((err) => {
      console.log('Compiler encountered an error.', err);
      process.exit(1);
    });
};

compile();
