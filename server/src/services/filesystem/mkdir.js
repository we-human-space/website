const fs = require('fs');

module.exports = function mkdir(folder) {
  return new Promise((resolve, reject) => {
    fs.mkdir(folder, (err) => {
      if(err && err.code !== "EEXIST") {
        console.log(err);
        reject(err);
      }else{
        resolve();
      }
    });
  });
};
