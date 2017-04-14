"use strict";

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const spawn = require('child_process').spawn;
const yaml = require('js-yaml');
const Ajv = require('ajv');
const env = process.env.NODE_ENV || 'development';
const config = require('../../../.config/server/index')[env];
const auschema = require('../secure/validation/article-upload.json');
const hash = require('../secure/hash');
const mailer = require('../mail/mailer');
const models = require('../../models/index');
const Article = models.Article;
const Author = models.Author;

const UPLOAD_PATH = path.join(__dirname, '../../../', config.views.path, config.views.articles.uploads);
const ARTICLE_DIR = path.join(__dirname, '../../../', config.views.path, config.views.articles.path);
const IMAGE_EXT_REGEXP = /\.(gif|jpg|jpeg|jpe|png|svg|bmp|tiff)/;

module.exports = {
  watch: watch
};

function watch() {
  let watcher = chokidar.watch(UPLOAD_PATH, { depth: 1, awaitWriteFinish: true});
  watcher.on('add', function(p) {
    console.log(`New article uploaded in ${p}`);
    return extract(p);
  });
}

function extract(source) {
  console.log(`Extracting ${source}`);
  let destination = path.join(path.dirname(source), path.basename(source, path.extname(source)));
  var data;
  var unzip = spawn('unzip', ['-d' , destination, source]);
  var extraction = new Promise((resolve, reject) => {
    unzip.on('close', (code) => {
      console.log(`unzip process exited with code ${code}`);
      if(!code){
        data = {folder: destination, zip: source};
        resolve(data);
      }else{
        let err = new Error(`unzip process exited with code ${code}`);
        err.code = code;
        reject(err);
      }
    });
  });

  return extraction
  .then(validate_folder)
  .then(validate_yaml)
  .then(generate_article)
  .then(move)
  .then(persist)
  .then(clear)
  .then(notify_success)
  .catch((err) => {
    console.log(data);
    console.error(err);
    // return notify_failure({
    //   data: JSON.stringify(data),
    //   error: JSON.stringify(err)
    // });
  });
}

function validate_folder(data) {
  var folder = data.folder;
  console.log(`Validating ${folder}`);
  return new Promise((resolve, reject) => {
    var content;
    var thumbnail;
    var yaml_file;
    var rejected = false;
    fs.readdir(folder, (err, files) => {
      files.forEach(file => {
        if(!rejected){
          //Find all the necessary files
          if(path.extname(file) === ".html"){
            if(!content) content = file;
            else {
              rejected = true;
              reject(new Error("Multiple html files uploaded"));
            }
          }else if(path.extname(file) === ".yaml" || path.extname(file) === ".yml"){
            if(!yaml_file) yaml_file = file;
            else {
              rejected = true;
              reject(new Error("Multiple yaml files uploaded"));
            }
          }else if(file.match(IMAGE_EXT_REGEXP)){
            if(!thumbnail) thumbnail = file;
            else {
              rejected = true;
              reject(new Error("Multiple image files uploaded"));
            }
          }
        }
      });
      if(!rejected){
        //Check if any file is missing
        if(!content) reject(new Error("No html file uploaded"));
        else if(!thumbnail) reject(new Error("No image file uploaded"));
        else if(!yaml_file) reject(new Error("No yaml file uploaded"));
        else {
          //Return paths of important files
          data.files = {
            content: content,
            thumbnail: thumbnail,
            yaml_file: yaml_file
          };
          resolve(data);
        }
      }
    });
  });
}

function validate_yaml(data) {
  console.log(`Validating yaml file`);
  var ajv = new Ajv();
  var fields = yaml.safeLoad(fs.readFileSync(data.files.yaml_file, 'utf-8'));
  if(ajv.validate(auschema, fields)){
    return Author.findOne({username: fields.author})
    .then((a) => {
      if(a === null){
        return Promise.reject(new Error(`Author with username ${fields.author} was not found`));
      }else{
        data.recipients = fields.recipients;
        data.content = {
          title: fields.title,
          subject: fields.subject,
          category: fields.category,
          author: a,
          tags: fields.tags,
          thumbnail: fields.thumbnail,
          summary: fields.summary
        };
        return Promise.resolve(data);
      }
    });
  }else{
    return Promise.reject(new Error(JSON.stringify(ajv.errors)));
  }

  //js-yaml read yaml file
  //validate each field using json validator
  //return object with article properties {files: files, content: yaml}
}

function generate_article(data) {
  console.log(`Generating article`);
  var content = data.content;
  var article = new Article();
  for(let key in content){
    if(content.hasOwnProperty(key)){
      if(key === "author"){
        article[key] = content[key]._id;
      }else{
        article[key] = content[key];
      }
    }
  }
  article.hash = hash.shortener(content);
  article.url = `${sanitize_title(content.title)}-${article.hash}`;
  content.url = article.url;
  console.log("Result:");
  console.log(article);
  data.article = article;
  return data;
}

function sanitize_title(title) {
  return title.toLowerCase()
              .replace("'", "")
              .match(/[a-z]+/g)
              .join('-');
}

function move(data){
  console.log(`Moving files to ${ARTICLE_DIR}`);
  var files = Object.values(data.files);
  return new Promise((resolve, reject) => {
    fs.mkdir(path,function(e){
      if(e && ! e.code === 'EEXIST'){
        reject(e);
      }else if(e && e.code === 'EEXIST'){
        reject(e);
      }else{
        resolve();
      }
    });
  }).then(() => {
    return Promise.all(files.map((file) => {
      let old_path = file;
      let new_path;
      let extname = path.extname(file);
      //Renaming file
      if(extname === ".html"){
        new_path = path.join(ARTICLE_DIR, data.article.url, "index.html");
      }else if(extname.match(IMAGE_EXT_REGEXP)){
        new_path = path.join(ARTICLE_DIR, data.article.url, `thumbnail${extname}`);
      }else if(extname === ".yaml"){
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        fs.rename(old_path, new_path, function(err){
          if(err) reject(err);
          else resolve();
        });
      });
    }));
  }).then(() => {
    return data;
  });
}

function persist(data) {
  console.log(`Persisting "${data.article.title}" to database`);
  return data.article.save()
  .then(() => {
    return Article.findOne({hash: data.article.hash});
  }).then((a) => {
    if(a === null) return Promise.reject(new Error("Article was not persisted to database"));
    else return Promise.resolve(data);
  });
}

function clear(data) {
  console.log("Clearing old files");
  return remove(data.folder)
  .then(() => remove(data.zip))
  .then(() => data);
}

function notify_success(data) {
  return mailer.renderAndSend({
    to: data.recipients,
    subject: "New Article Successfully Uploaded",
    path: path.join(__dirname, '../../emails/blog/upload-success.html'),
    data: {
      article: data.content
    }
  });
}

function notify_failure(data) {
  return mailer.renderAndSend({
    to: data.recipients,
    subject: "New Article Failed to Upload",
    path: path.join(__dirname, '../../emails/blog/upload-failure.html'),
    data: {
      data: data.data,
      error: data.error
    }
  });
}

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
