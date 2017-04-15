const path = require("path");
const database = require('../../common/database');
const fswrapper = require('../../../services/filesystem/index');

const context = __dirname;
const insert = 'insert.json';
const remove = 'remove.json';

before(function(done){
  database.query(context, insert)
  .then(() => {
    done();
  });
});

after(function(done){
  database.query(context, remove)
  .then(() => {
    done();
  });
});

it("should return the correct dataset for the specified article upload", function(done) {
  const source = "./test-file-1.zip";
  const destination = path.join("../../../", config.views.path, "/uploads/test-file-1.zip");
  fswrapper.copy(source, destination)
  .then(() => {
    return new Promise((resolve, reject) => {
      server
        .get("/test/uploader/report")
        .end(function(err, res) {
          //Request error
          if(err){
            reject(err);
          //Error was thrown alongside the uploading
          }else if(res.body.data.error){
            reject(res.body.data.error);
          //Email notification catch error
          }else if(res.body.error){
            reject(res.body.error);
          }else{
            resolve(res.body.data);
          }
        });
    }).then((data) => {
      console.log(data);
      done();
    }).catch((err) => {
      done(err);
    });

  })
});
