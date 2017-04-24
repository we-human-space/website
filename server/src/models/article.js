/**
 * Article MongoDB Model
 * Represents the articles for the blog
 * The caching implementation assumes that there is only a single database and a
 * single server. So a refactoring is in order when we will scale.
**/

import hash from 'object-hash';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/**
* cache = { int: [ Article, ... ] , ...}
**/
var cache = {};

/**
* subject_cache = [string, ...]
**/
const subject_cache = {};

/**
* tag_cache = [string, ...]
**/
const tag_cache = {};

/**
* query_cache = { int: [ {index: int, hash: string }, ... ] , ...}
**/
const query_cache = {};

var ArticleSchema = new Schema({
  hash: {type:String, required: true, unique: true, index: true},
  page: {type:Number, required: true, index: true},
  pageIndex: {type: Number, required: true},
  title: {type:String, required: true, unique: false},
  url: {type:String, required: true, unique: true, index: true},
  subject: {type:String, required: true, unique: false},
  category: {type:String, required: true, unique: false},
  summary: {type:String, required: true, unique: false},
  author: {type: Schema.Types.ObjectId, ref: 'Author'},
  tags: [{type:String, index: true}],
  thumbnail: {
    mime: {type:String, required: true},
    width: {type:Number, required: true, unique: false},
    height: {type:Number, required: true, unique: false},
  }
});

ArticleSchema.statics.getPageFromCache = function(page){
  if(Number.isInt(page)){
    if(cache[page]){
      return { pages: { [page]: [ ...cache[page] ] }, complete: true, missing: []};
    }else{
      return { pages: {}, complete: false, missing: [page]};
    }
  }else if(Array.isArray(page.$in)){
    return page.$in.reduce((acc, p) => {
      if(cache[p]){
        acc.pages[p] = cache[p];
      }else{
        acc.complete = false;
        acc.missing.push(p);
      }
      return acc;
    }, { pages: {}, complete: true, missing: []});
  }else{
    let key = Math.max.apply(null, Object.keys(cache));
    return {
      pages: {
        [key]: cache[key]
      },
      complete: true,
      missing: []
    };
  }
};

ArticleSchema.statics.setPageToCache = function(pages) {
  cache = { ...cache, ...pages };
};

/**
 * Fetches articles according to their paging
 * @param {int/object/undefined} page : , or
 * - value 1: <int> : Number of the page to lookup
 * - value 2: {$in: [<int>]}  : Query with number of the pages to lookup
 * - value 3: <undefined> : Automatically fetch the most recent page
 **/
ArticleSchema.statics.getPage = function(page) {
  if(page){
    let cached = ArticleSchema.statics.getPageFromCache(page);
    if(cached.complete){
      let pages = cached.pages;
      return Promise.resolve({ ...pages });
    }else{
      // Finding missing pages
      let query = {
        page: cached.missing.length === 1 ?
              cached.missing[0] :
              { $in: cached.missing }
      };
      return ArticleSchema.find(query).sort({page: -1, pageIndex: -1})// .exect()
      .then((articles) => {
        return articles.reduce((acc, article) => {
          if(acc[article.page]){
            acc[article.page].push(article);
          }else{
            acc[article.page] = [article];
          }
          return acc;
        }, {});
      }).then((pages) => {
        cache = { ...cache, ...pages };
        return { ...cached.pages, ...pages };
      });
    }
  }else{
    let cached = ArticleSchema.statics.getPageFromCache();
    if(cached.complete){
      return Promise.resolve(cached);
    }else{
      return ArticleSchema.find().sort({page: -1, pageIndex: -1}).limit(20)// .exect()
      .then((articles) => {
        let count_articles = 0;
        return articles.reduce((acc, a) => {
          if(!acc[a.page] && count_articles < 10){
            acc[a.page] = [a];
          }else{
            acc[a.page].push(a);
          }
          count_articles++;
          return acc;
        }, {});
      }).then((pages) => {
        ArticleSchema.statics.setPageToCache(pages);
        return { ...cached.pages, ...pages };
      });
    }

  }
};

ArticleSchema.statics.validatePage = function(page) {
  let maxpage = Math.max.apply(null, Object.keys(cache));
  if(Number.isInt(page)){
    if(page > maxpage){
      return {valid: [], invalid: {[page]: null}};
    }else{
      return {valid: [page], invalid: null};
    }
  }else if(Array.isArray(page.$in)) {
    let invalid = page.$in.filter((p) => p > maxpage);
    let valid = page.$in.filter((p) => p < maxpage+1);
    if(invalid.length){
      invalid =  invalid.reduce((acc, p) => {
        acc[p] = null;
        return acc;
      }, {});
      return {valid, invalid};
    }else{
      return {valid, invalid: null};
    }
  }
};

ArticleSchema.statics.filterArticles = function(payload) {
  if(payload.action == "REFRESH"){
    if(payload.cached) {
      let maxpage = payload.cached.index === 10?
                    Math.max.apply(null, payload.cached.pages) +1:
                    Math.max.apply(null, payload.cached.pages);
      return Promise.all([
        ArticleSchema.statics.getQueryResults(payload.query, "eq", maxpage),
        ArticleSchema.statics.getPage(maxpage)
      ]).then(([match, pages]) => ({pages, match}));
    }else{
      return ArticleSchema.statics.filterArticles({ ...payload, action: "REQUEST_INITIAL"});
    }
  }else if(payload.action == "REQUEST_INITIAL") {
    if(payload.cached) {
      let maxpage = Math.max.apply(null, payload.cached.pages)+1;
      let match;
      return ArticleSchema.statics.getQueryResults(payload.query, "lt", maxpage)
      .then((matches) => {
        match = matches;
        let match_pages = Object.keys(matches);
        // Check if there is a need for pages to be sent to the frontend
        let new_pages = match_pages.filter(p => payload.cached.pages.indexOf(p) == -1);
        if(new_pages.length) return ArticleSchema.statics.getPage({$in: new_pages});
        else return Promise.resolve({});
      }).then((pages) =>  ({pages, match}));
    }else{
      let maxpage = Math.max.apply(null, Object.keys(cache))+1;
      let match;
      return ArticleSchema.statics.getQueryResults(payload.query, "lt", maxpage)
      .then((matches) => {
        match = matches;
        return ArticleSchema.statics.getPage({$in: Object.keys(match)});
      }).then((pages) =>  ({pages, match}));
    }
    // TODO: This should not happen
  }else if(payload.action == "REQUEST_MORE") {
    if(payload.cached) {
      let maxpage = Math.min.apply(null, payload.cached.pages);
      let match;
      return ArticleSchema.statics.getQueryResults(payload.query, "lt", maxpage)
      .then((matches) => {
        match = matches;
        return ArticleSchema.statics.getPage({$in: Object.keys(matches)});
      }).then((pages) =>  ({pages, match}));
    }else{
      return ArticleSchema.statics.filterArticles({ ...payload, action: "REQUEST_INITIAL"});
    }
  }
};

ArticleSchema.statics.getQueryResults = function(query, op, page) {
  var cached;
  if(page < Math.max.apply(null, Object.keys(cache))){
    cached = ArticleSchema.statics.getQueryResultsFromCache(query, op, page);
  }
  if(!cached) {
    return ArticleSchema.statics.findQueryResult(query, op, page);
  }else{
    let count_articles = 0;
    let reached_bottom = false;
    for(let pg in cached){
      count_articles += cached[pg];
      // to avoid calling db if we are already at the bottom of articles
      reached_bottom = pg == 1 ? true : false;
    }
    if(count_articles < 10 && !reached_bottom){
      return ArticleSchema.statics.findQueryResult(query, op, page)
      .then((matches) => {
        let pages = Object.keys(matches);
        return pages.reduce((result, page) => {
          if(count_articles > 10) {
            return result;
          }else{
            result[page] = matches[page];
            count_articles += matches[page].length;
          }
        }, cached);
      });
    }else{
      return Promise.resolve(cached);
    }
  }
};

ArticleSchema.statics.findQueryResult  = function(query, op, page) {
  let qpage;
  if(op == "eq") qpage = page;
  else qpage = { [`$${op}`]: page };
  let q = { ...query, page: qpage };
  return ArticleSchema.find(q).limit(20)
  .then((articles) => {
    let count_matches = 0;
    let match = articles.reduce((acc, article) => {
      if(!acc[article.page] && count_matches < 10){
        acc[article.page] = [{index: article.pageIndex, hash: article.hash}];
      }else{
        acc[article.page].push({index: article.pageIndex, hash: article.hash});
      }
      count_matches++;
      return acc;
    }, {});

    ArticleSchema.statics.setQueryResultsToCache(query, match);
    return match;
  });
};

ArticleSchema.statics.getQueryResultsFromCache = function(query, op, page) {
  let hashkey = hash(query);
  console.log(`hashkey works: ${hashkey === hash({ ...query })}`); //to check for consistency
  if(query_cache[hashkey]){
    let result;
    let count = 0;
    for(let key in query_cache[hashkey].pages){
      if((op == "eq" && key == page) ||
         (op == "lt" && key < page)  ||
         (op == "gt" && key > page)) {
        // updating the results
        if(!result) result = {};
        result[key] = query_cache[hashkey].pages[key];
        // counting number of matches - if >= 10, stop searching
        count += result[key].length;
        if(count >= 10) break;
      }
    }
    return result;
  }
  return ;
};

ArticleSchema.statics.setQueryResultsToCache = function(query, pages) {
  let hashkey = hash(query);
  if(query_cache[hashkey]){
    query_cache[hashkey].pages = { ...query_cache[hashkey].pages, ...pages };
  }else{
    query_cache[hashkey] = {query, pages};
  }
};

ArticleSchema.statics.getSubjectsAndTags = function(){
  return {subject: subject_cache, tags: tag_cache };
};

/**
 * Pre-Hook for Save Method
 * Adds pagination to saved articles and persist to cache
 * Allows to solve problems with regard to keeping the cache fresh
 * DO NOT MODIFY PAGE/PAGE INDEX OF ARTICLES ANYWHERE ELSE IN THE CODE
 * THIS WOULD RESULT IN INCONSISTENCIES IN THE CACHE
 **/
ArticleSchema.pre('save', function(next){
  if(Object.keys(cache).length){
    // If there is already articles in the cache, check latest page
    var page = Math.max.apply(null, Object.keys(cache));
    // If object already paginated, don't change anything
    // Else if object not paginated, take the latest pagination
    this.pageIndex = this.pageIndex || (cache[page].length % 10) + 1;
    this.page = this.page || this.pageIndex === 1 ? page+1 : page;
  }else{
    //First article!
    this.page = 1;
    this.pageIndex = 1;
  }
  // Adding new page to cache
  if(!cache[this.page]){
    cache[this.page] = [this];
  // Ensure that we are not inserting a duplicata in the cache
  }else if(!cache[this.page].some((e) => e._id === this._id)){
    cache[this.page].push(this);
  }
  next();
});

/**
 * Pre-Hook for Save Method
 * Updates the subject cache
 **/
ArticleSchema.pre('save', function(next){
  subject_cache[this.subject] = 1;
  this.tags.forEach((t) => (tag_cache[t] = 1));
  next();
});



ArticleSchema.methods.export = function(){
  return {
    title: this.title,
    page: this.page,
    url: this.url,
    hash: this.hash,
    subject: this.subject,
    category: this.category,
    author: typeof this.author === "object" && this.author ? this.author.export() : null,
    summary: this.summary,
    thumbnail: this.thumbnail
  };
};

module.exports = ArticleSchema;
