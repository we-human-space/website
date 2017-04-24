"use strict";

const spawn = require('child_process').spawn;

module.exports = function(path, chmod, options){

  chmod = chmod ? chmod : 0o755;
  let args = [];
  if(options){
    if(options.recursive) args.push('-R');
    if(options.executable) args.push('-x');
  }
  args.push(path);

  let child = spawn('chmod', args);

  child.stdout.on('data', (data) => {
    if(typeof options.stdout === "function") options.stdout(data);
  });
  child.stderr.on('data', (data) => {
    if(typeof options.stderr === "function") options.stderr(data);
  });

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      let msg = `chmod process exited with code ${code}`;
      if(typeof options.stdout === "function") options.stdout(msg);
      if(!code){
        resolve();
      }else{
        let err = new Error(msg);
        err.code = code;
        reject(err);
      }
    });
  });
};
