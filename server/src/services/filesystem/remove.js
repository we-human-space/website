"use strict";

const fs = require('fs');

module.exports = remove;

function remove(path){
  return new Promise((resolve, reject) => {
    //Found at https://gist.github.com/jorritd/1722941
    removeRecursive(path, (err, success) => {
      if(err) reject(err);
      else resolve(success);
    });
  });
}

//From https://gist.github.com/jorritd/1722941
function removeRecursive(path, cb){
  fs.stat(path, function(err, stats) {
    if(err){
      cb(err,stats);
      return;
    }
    if(stats.isFile()){
      fs.unlink(path, function(err) {
        if(err) {
          cb(err,null);
        }else{
          cb(null,true);
        }
        return;
      });
    }else if(stats.isDirectory()){
      fs.readdir(path, function(err, files) {
        if(err){
          cb(err,null);
          return;
        }
        var f_length = files.length;
        var f_delete_index = 0;
        var checkStatus = function(){
          if(f_length===f_delete_index){
            fs.rmdir(path, function(err) {
              if(err){
                cb(err,null);
              }else{
                cb(null,true);
              }
            });
            return true;
          }
          return false;
        };
        if(!checkStatus()){
          for(var i=0;i<f_length;i++){
            (function(){
              var filePath = path + '/' + files[i];
              removeRecursive(filePath, function removeRecursiveCB(err){
                if(!err){
                  f_delete_index ++;
                  checkStatus();
                }else{
                  cb(err,null);
                  return;
                }
              });

            })();
          }
        }
      });
    }
  });
}
