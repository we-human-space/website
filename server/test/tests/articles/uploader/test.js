"use strict";

const fs = require('fs');
const path = require("path");
const database = require('../../../common/database');
const fswrapper = require('../../../../services/filesystem/index');
const models = require('../../../../models/index');
const Author = models.Author;
const Article = models.Article;

const context = __dirname;
const INSERT_DATA = 'insert.json';
const REMOVE_DATA = 'remove.json';
const SOURCE_PATH = path.join(__dirname, "./test-file-1.zip");
const DESTINATION_PATH = path.join(__dirname, "../../../../", config.views.path, "/uploads/test-file-1.zip");
const ARTICLE_DIR = path.join(__dirname, "../../../../", config.views.path, config.views.articles.path);
const THUMBNAIL_EXT_REGEXP = /thumbnail\.(gif|jpg|jpeg|jpe|png|svg|bmp|tiff)/;

var articles = [];
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
      .get(routing['uploader/clear'])
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

it("should return the correct dataset for the specified article upload", function(done) {
  this.timeout(4000);
  var data;
  upload({filename: "test-file-1"})
  .then(get_report)
  .then((result) => data = result)
  .then(check_files)
  .then(check_db)
  .then((data) => {
    articles.push(data);
    done();
  }).catch((err) => {
    articles.push(data);
    console.log(err);
    done(err);
  });
});

function upload(data){
  return new Promise((resolve, reject) => {
    fswrapper.copy(SOURCE_PATH, DESTINATION_PATH, function(err) {
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
      .get(routing['uploader/report'])
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

function check_files(data){
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(ARTICLE_DIR, data.article.url), (err, files) => {
      if(err){
        reject(err);
      }else{
        let rejected = false;
        if(!files.some((file) => file.match("index.html"))){
          rejected = true;
          reject(new Error(`HTML file was not uploaded properly`));
        }
        if(!files.some((file) => file.match(THUMBNAIL_EXT_REGEXP))){
          rejected = true;
          reject(new Error(`Thumbnail was not uploaded properly`));
        }
        data.files.images.forEach((img) => {
          if(!files.some((file) => file.match(img))){
            rejected = true;
            reject(new Error(`Image ${img} was not uploaded properly`));
          }
        });
        if(!rejected) resolve(data);
      }
    });
  });
}

function check_db(data){
  return Article.findOne({url: data.article.url})
  .then((article) => {
    assert.equal(data.article.title, article.title, "Title should be the test title");
    assert.equal(data.article.subject, article.subject, "Subject should be the test subject");
    assert.equal(data.article.category, article.category, "Category should be the test category");
    assert.equal(data.article.thumbnail.width, article.thumbnail.width, "Thumbnail width should be the test thumbnail width");
    assert.equal(data.article.thumbnail.height, article.thumbnail.height, "Thumbnail height should be the test thumbnail height");
    assert.equal(data.article.summary, article.summary, "Article summary should be the test article summary");
    return new Promise((resolve, reject) => {
      article.populate({path: 'author'}, (err, author) => {
        if(err) reject(err);
        else resolve(author);
      });
    });
  }).then((article) => {
    assert.equal(authors[0].username, article.author.username, "Author should be the test author");
    return Promise.resolve();
  });
}

function dump(){
  Author.find({username: /^test-/})
  .then((all) => {
    authors = all;
    return Promise.resolve();
  });
}
