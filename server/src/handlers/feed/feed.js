import Ajv from 'ajv';
import mongo_sanitize from 'mongo-sanitize';
import models from '../../models';
import reqschema from './request.schema.json';

const Article = models.Article;

export default function handler(req, res){
  //Sanitizing
  Promise.resolve(mongo_sanitize(req.body))
  //Validating
  .then((body) => {
    var ajv = new Ajv();
    if(ajv.validate(reqschema, body)){
      return body;
    }else{
      let err = ajv.errors;
      err.status = 400;
      return Promise.reject(err);
    }
  }).then((validated) => {
    if(validated.query){
      return get_pages_with_filter(validated);
    }else{
      return get_pages(validated)
      .then((p) => ({pages: p}));
    }
  }).then((result) => {
    res.json(result);
  }).catch((err) => {
    console.log(err);
    res.status = err.status || 500;
    res.json({error: err});
  });
}

function get_pages(payload){
  if(payload.cached){
    if(payload.action == 'REFRESH'){
      if(payload.cached.index === 10){
        return Article.getPage(Math.max.apply(null, payload.cached.pages)+1);
      }else{
        return Article.getPage(Math.max.apply(null, payload.cached.pages));
      }
    }else if(payload.action == 'REQUEST_PAGES') {
      // Refactor - add to the AJV validation
      // Check to see if pages are set in payload
      if(payload.pages){
        return Article.getPage({$in: payload.pages});
      }else{
        return {};
      }
    // Refactor - this case shouldn't happen, but no check established,
    // so left this instead
    }else if(payload.action == 'REQUEST_INITIAL') {
      return Article.getPage();
    }else if(payload.action == 'REQUEST_MORE') {
      let page = Math.min.apply(null, payload.cached.pages);
      if(page-1){
        return Article.getPage(page-1);
      }else{
        let err = new Error('Already at the earliest page');
        err.status = 400;
        return Promise.reject(err);
      }
    }
  }else{
    if(payload.action == 'REFRESH' || payload.action == 'REQUEST_INITIAL' ||
       payload.action == 'REQUEST_MORE'){
      return Article.getPage();
    }else if(payload.action == 'REQUEST_PAGES') {
      // Refactor - add to the AJV validation
      // Check to see if pages are set in payload
      if(payload.pages){
        return Article.getPage({$in: payload.pages});
      }else{
        return {};
      }
    }
  }
}

function get_pages_with_filter(payload){
  // Refactor - include this check in AJV validation
  if(payload.action == 'REFRESH' || payload.action == 'REQUEST_INITIAL' ||
     payload.action == 'REQUEST_MORE'){
    return Article.filterArticles(payload);
  }else{
    let err = new Error('Currently unsupported action for getting pages with filter');
    err.status = 400;
    return Promise.reject(err);
  }
}
