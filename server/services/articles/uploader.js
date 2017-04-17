"use strict";

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const spawn = require('child_process').spawn;
const yaml = require('js-yaml');
const Ajv = require('ajv');
const env = process.env.NODE_ENV || 'development';
const config = require('../../../.config/server/index')[env];
const fswrapper = require('../filesystem/index');
const auschema = require('../secure/validation/article-upload.json');
const hash = require('../secure/hash');
const mailer = require('../mail/mailer');
const models = require('../../models/index');
const Article = models.Article;
const Author = models.Author;

const UPLOAD_PATH = path.join(__dirname, '../../', config.views.path, config.views.articles.uploads);
const ARTICLE_DIR = path.join(__dirname, '../../', config.views.path, config.views.articles.path);
const IMAGE_EXT_REGEXP = /\.(gif|jpg|jpeg|jpe|png|svg|bmp|tiff)/;
const THUMBNAIL_EXT_REGEXP = /thumbnail\.(gif|jpg|jpeg|jpe|png|svg|bmp|tiff)/;
const devcache = {};
const processing = [];

module.exports = {
  watch: watch,
  report: report
};

function watch() {
  console.log(`Watching ${UPLOAD_PATH}`);
  let watcher =
    chokidar.watch(
      UPLOAD_PATH,
      { depth: 1,
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 50
        }
      }
    );
  watcher
    //.on('all', (e, p) => console.log(`Catched ${e} event for path ${p}`))
    .on('add', function(p) {
      if(processing.indexOf(p) === -1){
        console.log(`New article uploaded in ${p}`);
        processing.push(p);
        return upload(p);
      }
    })
    .on('error', (error) => { console.error(error); });
}

function report(filename){
  for(let key in devcache){
    if(devcache.hasOwnProperty(key) && key.match(filename)){
      return devcache[key];
    }
  }
  return Promise.reject(new Error(`Could not find ${filename}`));
}

function upload(source) {
  console.log(`Extracting ${source}`);
  var data = {
    zip: source,
    folder: path.join(path.dirname(source), path.basename(source, path.extname(source)))
  };

  let upload =
  fswrapper.mkdir(data.folder)
  .then(() => extract(data))
  .then(validate_folder)
  .then(validate_yaml)
  .then(generate_article)
  .then(move)
  .then(persist)
  .then(clear_processing)
  .then(clear_files)
  .then(notify_success)
  .catch((err) => {
    console.error(err);
    clear_processing(data);
    return clear_files(data)
    .then(() => {
      if(!data.recipients || (Array.isArray(data.recipients) && !data.recipients.length)){
        data.recipients = config.upload.default_recipients;
      }
      data.error = err;
      return notify_failure(data);
    });
  });

  if(env === "development"){
    devcache[path.basename(source)] = upload;
  }

  return upload;

}

function extract(data){
  let source = data.zip;
  let destination = path.dirname(source);
  console.log(`source: ${source}`);
  console.log(`destination: ${destination}`);
  var unzip = spawn('unzip', ['-o', '-d' , destination, source]);
  unzip.stdout.on('data', (data) => {
    console.log(`unzip stdout:\n${data}`);
  });
  unzip.stderr.on('data', (data) => {
    console.log(`unzip stderr:\n${data}`);
  });

  return new Promise((resolve, reject) => {
    unzip.on('close', (code) => {
      console.log(`unzip process exited with code ${code}`);
      if(!code){
        resolve(data);
      }else{
        let err = new Error(`unzip process exited with code ${code}`);
        data.error = err;
        err.code = code;
        reject(err);
      }
    });
  });
}

function validate_folder(data) {
  console.log(`Validating ${data.folder}`);
  return new Promise((resolve, reject) => {
    var content;
    var thumbnail;
    var yaml_file;
    var images = [];
    var rejected = false;
    fs.readdir(data.folder, (err, files) => {
      files.forEach(file => {
        console.log(file);
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
          }else if(file.match(THUMBNAIL_EXT_REGEXP)){
            if(!thumbnail) thumbnail = file;
            else {
              rejected = true;
              reject(new Error("Multiple thumbnail files uploaded"));
            }
          }else if(file.match(IMAGE_EXT_REGEXP)){
            images.push(file);
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
            yaml_file: yaml_file,
            images: images
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
  var fields = yaml.safeLoad(fs.readFileSync(path.join(data.folder, data.files.yaml_file), 'utf-8'));
  if(ajv.validate(auschema, fields)){
    return Author.findOne({username: fields.author})
    .then((a) => {
      if(a === null){
        return Promise.reject(new Error(`Author with username ${fields.author} was not found`));
      }else{
        //Adding recipients to the default list and removing duplicates
        if(fields.recipients){
          data.recipients = fields.recipients.concat(config.upload.default_recipients);
        }else{
          data.recipients = config.upload.default_recipients;
        }

        data.recipients.push(a.email);
        data.recipients.filter((v, i, a) => a.indexOf(v) === i);
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
  var files = [];
  for(let key in data.files){
    if(data.files.hasOwnProperty(key)){
      if(key === "images"){
        files.concat(
          data.files[key].map((f) => {
            return path.join(data.folder, f);
          })
        );
      }else{
        files.push(path.join(data.folder, data.files[key]));
      }
    }
  }
  return new Promise((resolve, reject) => {
    fs.mkdir(path.join(ARTICLE_DIR, data.article.url),function(e){
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

function clear_files(data) {
  console.log("Clearing old files");
  let promises = [];
  if(data.folder){
    promises.push(fswrapper.remove(data.folder));
  }
  if(data.zip){
    promises.push(fswrapper.remove(data.zip));
  }
  return Promise.all(promises)
  .then(() => data);
}

function clear_processing(data){
  let index = processing.indexOf(data.source);
  if(index !== -1){
    processing.splice(index);
  }
  return data;
}

function notify_success(data) {
  console.log("Emailing upload success notification");
  console.log(data.recipients);
  return mailer.renderAndSend({
    to: data.recipients,
    subject: "New Article Successfully Uploaded",
    path: path.join(__dirname, '../../emails/blog/upload-success.html'),
    data: {
      article: data.content
    }
  }).then((res) => {
    console.log("Successfully emailed upload success notification");

    if(env === "development"){
      return Promise.resolve({result: res, error: null, data: data});
    }else{
      return Promise.resolve(res);
    }
  }).catch((err) => {
    console.log("Failed to email upload success notification");

    if(env === "development"){
      return Promise.reject({result: null, error: err, data: data});
    }else{
      return Promise.reject(err);
    }
  });
}

function notify_failure(data) {
  console.log("Emailing upload failure notification");
  console.log(data.recipients);
  let error = data.error;
  data.error = undefined;
  return mailer.renderAndSend({
    to: data.recipients,
    subject: "New Article Failed to Upload",
    path: path.join(__dirname, '../../emails/blog/upload-failure.html'),
    data: {
      data: JSON.stringify(data, null, 2),
      error: error.toString()
    }
  }).then((res) => {
    console.log("Successfully emailed upload failure notification");
    if(env === "development"){
      return Promise.resolve({result: res, error: null, data: data});
    }else{
      return Promise.resolve(res);
    }
  }).catch((err) => {
    console.log("Failed to email upload failure notification");
    if(env === "development"){
      return Promise.reject({result: null, error: err, data: data});
    }else{
      return Promise.reject(err);
    }
  });
}
