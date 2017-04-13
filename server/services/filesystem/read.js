const fs = require('fs');

module.exports = function read(file) {
  console.log(`reading ${file}`);
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      console.log(`read ${file}; error: ${!!err}`);
      if(err) {
        console.log(err);
        reject(err);
      }else{
        resolve(data);
      }
    });
  });
};
