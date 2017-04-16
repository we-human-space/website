const fs = require('fs');

module.exports =

//http://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
function copy(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if(err){
      console.log(err);
    }    
    if(typeof cb === "function"){
      if (!cbCalled) {
        cb(err, null);
        cbCalled = true;
      }
      if(!err){
        cb(null);
      }
    }
  }
}
