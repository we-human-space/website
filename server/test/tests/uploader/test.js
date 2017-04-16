const path = require("path");
const database = require('../../common/database');
const fswrapper = require('../../../services/filesystem/index');
const models = require('../../../models/index');
const Author = models.Author;
const Article = models.Article;

const context = __dirname;
const insert = 'insert.json';
const remove = 'remove.json';

before(function(done){
  database.query(context, insert)
  .then(() => {
    done();
  }).catch((err) => {
    console.log(err);
    done(err);
  });
});

after(function(done){
  database.query(context, remove)
  .then(() => {
    done();
  }).catch((err) => {
    console.log(err);
    done(err);
  });
});

it("should return the correct dataset for the specified article upload", function(done) {
  const source = path.join(__dirname, "./test-file-1.zip");
  const destination = path.join(__dirname, "../../../", config.views.path, "/uploads/test-file-1.zip");
  console.log("In test");
  //Added the two following calls to Author and Article to see if data was inserted
  Author.find()
  .then((all) => {
    console.log("All authors");
    console.log(all);
    // if(!all.length){
    //   return database.query(context, insert)
    //   .then(() => { return Article.find(); })
    // }else{
      return Article.find();
    // }
  }).then((all) => {
    console.log("All articles");
    console.log(all);
    return new Promise((resolve, reject) => {
      fswrapper.copy(source, destination, function(err) {
        if(err){
          reject(err);
        }else{
          resolve();
        }
      });
    });
  }).then(() => {
    return new Promise((resolve, reject) => {
      server
        .get("/test/uploader/report")
        .send({filename: "test-file-1"})
        .end(function(err, res) {
          console.log(err);
          console.log(res.body);
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
      console.log(err);
      done(err);
    });

  })
});
