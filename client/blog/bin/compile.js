const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const project = require('../config/project.config');
const webpack_config = require('../config/webpack.config');

// Wrapper around webpack to promisify its compiler and supply friendly logging
const webpack_compiler = (webpack_config) =>
  new Promise((resolve, reject) => {
    const compiler = webpack(webpack_config);

    compiler.run((err, stats) => {
      if(err){
        console.log('Webpack compiler encountered a fatal error.', err);
        return reject(err);
      }

      const jsonStats = stats.toJson();
      console.log('Webpack compile completed.');

      if(jsonStats.errors.length > 0){
        console.log('Webpack compiler encountered errors.');
        console.log(jsonStats.errors.join('\n'));
        return reject(new Error('Webpack compiler encountered errors'));
      }else if(jsonStats.warnings.length > 0){
        console.log('Webpack compiler encountered warnings.');
        console.log(jsonStats.warnings.join('\n'));
      }else{
        console.log('No errors or warnings encountered.');
      }
      resolve(jsonStats);
    });
  });

const create_public = () => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path.join(__dirname, '../public'), (err) => {
      if(err && err.code !== 'EEXIST') {
        reject(err);
      }else{
        resolve();
      }
    });
  });
};

const update_versionning = (version) => {
  let version_file = project.paths.dist(project.compiler.versionning.file);
  return read_and_write_to_json_file(version_file, (versions) => {
    if(!versions) versions = [];
    if(versions.indexOf(version) === -1) versions.push(version);
    return versions;
  });
};

const update_compiled = (versions) => {
  let compiled_file = project.paths.config('server', project.compiler.versionning.compile_file);
  return read_and_write_to_json_file(compiled_file, (compiled) => {
    if(!compiled) compiled = {};
    compiled.bundle = versions[versions.length -1];
    return compiled;
  });
};

const read_and_write_to_json_file = (file, cb) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', function (err, data) {
      if(err){
        if(err.code === 'ENOENT'){
          resolve(null);
        }else{
          reject(err);
        }
      }else{
        resolve(JSON.parse(data.toString()));
      }
    });
  }).then((content) => {
    content = cb(content);
    return new Promise((resolve, reject) => {
      fs.writeFile(file, JSON.stringify(content), { flag: 'w' }, function(err, data) {
        if(err){
          reject(err);
        }else{
          resolve(content);
        }
      });
    });
  });
};

const compile = () => {
  console.log('Starting compiler.');
  return create_public()
    .then(() => webpack_compiler(webpack_config))
    .then(stats => {
      console.log('Copying static assets to dist folder.');
      fs.copySync(project.paths.public(), project.paths.dist());
      return Promise.resolve(webpack_config.output.filename.replace('[hash]', stats.hash));
    })
    .then(update_versionning)
    .then(update_compiled)
    .then(() => {
      console.log('Compilation completed successfully.');
    })
    .catch((err) => {
      console.log('Compiler encountered an error.', err);
      process.exit(1);
    });
};

compile();
