"use strict";

const path = require("path");
const database = require('../../common/database');
const generate_article = require('../../common/article');
const fswrapper = require('../../../dist/services/filesystem/index');
const stop = require('../../common/stop');
const Author = models.Author;

const context = __dirname;
const INSERT_DATA = 'insert.json';
const REMOVE_DATA = 'remove.json';
const SOURCE_PATH = path.join(__dirname, "../../common/tmp/{{filename}}.zip");
const DESTINATION_PATH = config.paths.views("uploads/{{filename}}.zip");

var articles = [];
var clears = [];
var authors;

before(function(done){
  database.query(context, INSERT_DATA)
  .then(dump)
  .then(() => {
    done();
  }).catch((err) => {
    console.log(err);
    done(err);
  });
});

after(function(done){
  new Promise((resolve, reject) => {
    server
      .get('/test/uploader/clear')
      .expect(200)
      .end(function(err, res) {
        if(err) reject(err);
        else resolve(res);
      });
  }).then(() => {
    return database.query(context, REMOVE_DATA);
  }).then(() => {
    done();
  }).catch((err) => {
    return database.query(context, REMOVE_DATA)
    .then(() => {
      console.log(err);
      done(err);
    });
  });
});

it("upload articles to the server", function(done) {
  this.timeout(10000);
  var generated_articles = [];

  var promises = [];
  var count = Math.round(Math.random()*55+10);
  console.log(`Generating ${count} articles`);
  for(let c = 0 ; c < count; c++){
    promises.push(
      generate_article(authors[c % 2].username)
      .then((result) => {
        generated_articles.push(result.article);
        return upload({filename: result.folder})
        .then(get_report)
        .then((a) => { articles.push(a); clears.push(result.clear); });
      })
    );
  }
  Promise.all(promises)
  .then(() => articles)
  .then(test_in_browser(this))
  .then(() => clears.map(c => c()))
  .then(() => done)
  .catch((err) => {
    if(!err) err = new Error("Issue found");
    console.log(err);
    done(err);
  });
});

function upload(data){
  const source = SOURCE_PATH.replace("{{filename}}", data.filename);
  const destination = DESTINATION_PATH.replace("{{filename}}", data.filename);
  return new Promise((resolve, reject) => {
    fswrapper.copy(source, destination, function(err) {
      if(err){
        reject(err);
      }else{
        setTimeout(() => resolve(data), 3000);
      }
    });
  });
}

function get_report(data){
  return new Promise((resolve, reject) => {
    server
      .get("/test/uploader/report")
      .send(data)
      .end(function(err, res) {
        //Request error
        if(err){
          reject(err);
        //Error was thrown alongside the uploading
        }else if(res.body.data && res.body.data.error){
          reject(res.body.data.error);
        //Email notification catch error
        }else if(res.body.error){
          reject(res.body.error);
        }else if(!res.body.data){
          reject(new Error("Body is empty"));
        }else{
          resolve(res.body.data.data);
        }
      });
  });
}

function test_in_browser(self){
  return (articles) => {
    try{
      let urls = articles.map((a, i) => `${i+1}: URL: localhost:8888/blog/${a.article.hash}`);
      console.log("Go test in the browser, see if everything is fine");
      console.log(urls.join('\n'));
    }catch(err){
      console.error(err);
      return stop.stop.bind(self, "We got an error here. Take your time to debug, then press return.")();
    }
    return stop.confirm.bind(self)();
  };
}

function dump(){
  Author.find({username: /^test-/})
  .then((all) => {
    console.log(all);
    authors = all;
    return Promise.resolve();
  });
}
