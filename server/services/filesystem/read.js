const fs = require('fs');

module.exports = function read(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if(err) {
        console.log(err);
        reject(err);
      }else{
        resolve(data);
      }
    });
  });
};
