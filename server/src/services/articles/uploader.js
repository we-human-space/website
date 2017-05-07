import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
const spawn = require('child_process').spawn;
import yaml from 'js-yaml';
import Ajv from 'ajv';
import config from '../../config';
import fswrapper from '../filesystem/index';
import auschema from './uploader-yaml.schema.json';
import hash from '../secure/hash';
import mailer from '../mail/mailer';
import models from '../../models/index';
const Article = models.Article;
const Author = models.Author;

const UPLOAD_PATH = path.join(__dirname, '../../../', config.views.path, config.views.articles.uploads);
const ARTICLE_DIR = path.join(__dirname, '../../../', config.views.path, config.views.articles.path);
const IMAGE_EXT_REGEXP = /\.(gif|jpg|jpeg|jpe|png|svg|bmp|tiff)/;
const THUMBNAIL_EXT_REGEXP = /thumbnail\.(gif|jpg|jpeg|jpe|png|svg|bmp|tiff)/;
const HTML_REGEXP = /.*\.(html|hml)/;
const YAML_REGEXP = /.*\.(yaml|yml)/;
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

  if(__DEV__ || __TEST__){
    devcache[path.basename(source)] = upload;
  }

  return upload;

}

function extract(data){
  let source = data.zip;
  let destination = data.folder;
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
          if(file.match(HTML_REGEXP)){
            if(!content) content = file;
            else {
              rejected = true;
              reject(new Error('Multiple html files uploaded'));
            }
          }else if(file.match(YAML_REGEXP)){
            if(!yaml_file) yaml_file = file;
            else {
              rejected = true;
              reject(new Error('Multiple yaml files uploaded'));
            }
          }else if(file.match(THUMBNAIL_EXT_REGEXP)){
            if(!thumbnail) thumbnail = file;
            else {
              rejected = true;
              reject(new Error('Multiple thumbnail files uploaded'));
            }
          }else if(file.match(IMAGE_EXT_REGEXP)){
            images.push(file);
          }
        }
      });
      if(!rejected){
        //Check if any file is missing
        if(!content) reject(new Error('No html file uploaded'));
        else if(!thumbnail) reject(new Error('No image file uploaded'));
        else if(!yaml_file) reject(new Error('No yaml file uploaded'));
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
        // Updating cache in case db was updated indepedently
        if(!Author.isInCache(a)){
          a.setToCache(a);
        }
        // Adding recipients to the default list and removing duplicates
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
        data.content.thumbnail.mime = path.extname(data.files.thumbnail);
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
      if(key === 'author'){
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
              .replace('"', '')
              .match(/[a-z]+/g)
              .join('-');
}

function move(data){
  console.log(`Moving files to ${ARTICLE_DIR}`);
  //Loading all filenames to move
  var files = [];
  for(let key in data.files){
    if(data.files.hasOwnProperty(key)){
      if(key === 'images'){
        files = files.concat(
          data.files[key].map((f) => {
            return path.join(data.folder, f);
          })
        );
      }else{
        files.push(path.join(data.folder, data.files[key]));
      }
    }
  }
  //Making the destination directory
  return new Promise((resolve, reject) => {
    fs.mkdir(path.join(ARTICLE_DIR, data.article.hash),function(e){
      if(e && ! e.code === 'EEXIST'){
        reject(e);
      }else if(e && e.code === 'EEXIST'){
        reject(e);
      }else{
        resolve();
      }
    });
  }).then(() => {
    //Moving all files to new directory
    return Promise.all(files.map((file) => {
      let old_path = file;
      let new_path;
      let extname = path.extname(file);
      //Renaming file
      if(extname === '.html'){
        new_path = path.join(ARTICLE_DIR, data.article.hash, 'index.html');
      }else if(old_path.match(THUMBNAIL_EXT_REGEXP)){
        new_path = path.join(ARTICLE_DIR, data.article.hash, `thumbnail${extname}`);
      }else if(old_path.match(IMAGE_EXT_REGEXP)){
        new_path = path.join(ARTICLE_DIR, data.article.hash, path.basename(old_path));
      }else if(extname === '.yaml'){
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        console.log(`mv ${old_path} ${new_path}`);
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
  console.log(`Persisting '${data.article.title}' to database`);
  data.article.setPaging();
  data.article.setPropsToCache();
  return data.article.save()
  .then(() => {
    return Article.findOne({hash: data.article.hash});
  }).then((a) => {
    if(a === null) return Promise.reject(new Error('Article was not persisted to database'));
    else return Promise.resolve(data);
  });
}

function clear_files(data) {
  console.log('Clearing old files');
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
  if(config.upload.notify.success){
    console.log('Emailing upload success notification');
    console.log(data.recipients);
    return mailer.renderAndSend({
      to: data.recipients,
      subject: 'New Article Successfully Uploaded',
      path: path.join(__dirname, '../../../static/emails/upload-success.html'),
      data: {
        article: data.content
      }
    }).then((res) => {
      console.log('Successfully emailed upload success notification');

      if(__DEV__ || __TEST__){
        return Promise.resolve({result: res, error: null, data: data});
      }else{
        return Promise.resolve(res);
      }
    }).catch((err) => {
      console.log('Failed to email upload success notification');

      if(__DEV__ || __TEST__){
        return Promise.reject({result: null, error: err, data: data});
      }else{
        return Promise.reject(err);
      }
    });
  }else{
    if(__DEV__ || __TEST__){
      return Promise.resolve({result: 'Success notification is disabled', error: null, data: data});
    }else{
      return Promise.resolve();
    }
  }

}

function notify_failure(data) {
  if(config.upload.notify.failure){
    console.log('Emailing upload failure notification');
    console.log(data.recipients);
    let error = data.error;
    data.error = undefined;
    return mailer.renderAndSend({
      to: data.recipients,
      subject: 'New Article Failed to Upload',
      path: path.join(__dirname, '../../../static/emails/upload-failure.html'),
      data: {
        data: JSON.stringify(data, null, 2),
        error: error.toString()
      }
    }).then((res) => {
      console.log('Successfully emailed upload failure notification');
      if(__DEV__ || __TEST__){
        return Promise.resolve({result: res, error: null, data: data});
      }else{
        return Promise.resolve(res);
      }
    }).catch((err) => {
      console.log('Failed to email upload failure notification');
      if(__DEV__ || __TEST__){
        return Promise.reject({result: null, error: err, data: data});
      }else{
        return Promise.reject(err);
      }
    });
  }else{
    if(__DEV__ || __TEST__){
      return Promise.resolve({result: 'Failure notification is disabled', error: null, data: data});
    }else{
      return Promise.resolve();
    }
  }
}
