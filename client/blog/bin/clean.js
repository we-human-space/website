const fs = require('fs');
const project = require('../config/project.config');
const folder = project.paths.dist();

const read_versionning_file = () => {
  return new Promise((resolve, reject) => {
    fs.mkdir(folder, (err) => {
      if(err && err.code !== 'EEXIST') {
        reject(err);
      }else{
        resolve();
      }
    });
  }).then(() => {
    return new Promise((resolve, reject) => {
      let version_file = project.paths.dist(project.clean.versionning.file);
      fs.readFile(version_file, 'utf8', function (err, data) {
        if(err){
          // Write default value to file if not exist
          if(err.code === 'ENOENT'){
            let versions = [];
            fs.writeFile(version_file, JSON.stringify(versions), { flag: 'w' }, function(err, data) {
              if(err){
                reject(err);
              }else{
                resolve(versions);
              }
            });
          // If another error, reject
          }else{
            reject(err);
          }
        // Resolve with data
        }else{
          resolve(JSON.parse(data.toString()));
        }
      });
    });
  }).catch((err) => {
    console.log(`Cleaning utility has encountered errors while reading the versionning file, exiting`);
    console.error(err);
    process.exit(1);
  });
};

const clean = (versions) => {
  if(versions.length > project.clean.versionning.keep_count){
    versions = versions.slice(versions.length - project.clean.versionning.keep_count);
  }
  let keep = versions.slice();
  keep.push(project.clean.versionning.file);
  return new Promise((resolve, reject) => {
    fs.readdir(folder, function(err, files) {
      if(err){
        err.folder = folder;
        reject(err);
      }else{
        resolve(files);
      }
    });
  }).then((files) => {
    return Promise.all(
      files
        .filter(f => keep.indexOf(f) === -1)
        .map(f => {
          return new Promise((resolve, reject) => {
            fs.unlink(project.paths.dist(f), function(err) {
              if(err) {
                err.f = f;
                reject(err);
              }else resolve(f);
            });
          });
        })
    ).catch((err) => {
      console.log(`Cleaning utility has encountered errors while deleting file ${err.f}, exiting`);
      console.error(err);
      process.exit(1);
    });
  }).then(() => versions)
  .catch((err) => {
    console.log(`Cleaning utility has encountered errors while reading the directory ${err.folder}, exiting`);
    console.error(err);
    process.exit(1);
  });
};

const update_versionning = (versions) => {
  return new Promise((resolve, reject) => {
    let version_file = project.paths.dist(project.clean.versionning.file);
    fs.writeFile(version_file, JSON.stringify(versions), { flag: 'w' }, function(err, data) {
      if(err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
};


read_versionning_file()
.then(clean)
.then(update_versionning)
.then(() => console.log(`Cleaning utility has completed successfully.`))
.catch((err) => {
  console.log(`Cleaning utility has encountered errors, exiting`);
  console.error(err);
  process.exit(1);
});
