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
const subject_cache = [];

/**
* tag_cache = [string, ...]
**/
const tag_cache = [];

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

/*
 * Initializing Cache with Latest 200 Articles from DB
 * To be called on server start
 */
ArticleSchema.statics.initCache = function(){
  console.log("Initializing Article Cache");
  this
    .find()
    .sort({page: -1, pageIndex: -1})
    .limit(200)
    .then((articles) => {
      articles.forEach((a) => {
        a.setPropsToCache();
      });
      reduce_to_pages(articles, cache);
    })
    .then(() => console.log("Article Cache initialized"));
};

ArticleSchema.statics.getCachedTags = function(){
  return tag_cache.slice();
};

ArticleSchema.statics.getCachedSubjects = function(){
  return subject_cache.slice();
};

ArticleSchema.statics.getPageFromCache = function(page){
  if(page && Number.isInteger(page)){
    if(cache[page]){
      return { pages: { [page]: [ ...cache[page] ] }, complete: true, missing: []};
    }else{
      return { pages: {}, complete: false, missing: [page]};
    }
  }else if(page && Array.isArray(page.$in)){
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
    let cached = this.getPageFromCache(page);
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
      return this.find(query).sort({page: -1, pageIndex: -1})// .exect()
      .then(reduce_to_pages)
      .then((pages) => {
        cache = { ...cache, ...pages };
        return { ...cached.pages, ...pages };
      });
    }
  }else{
    let cached = this.getPageFromCache();
    if(cached.complete){
      return Promise.resolve(cached.pages);
    }else{
      return this.find().sort({page: -1, pageIndex: -1}).limit(20)// .exect()
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
        this.setPageToCache(pages);
        return { ...cached.pages, ...pages };
      });
    }

  }
};

ArticleSchema.statics.validatePage = function(page) {
  let maxpage = Math.max.apply(null, Object.keys(cache));
  if(Number.isInteger(page)){
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
  console.log(payload);
  if(payload.action == "REFRESH"){
    if(payload.cached) {
      let minpage = payload.cached.index === 10
                    ? Math.max.apply(null, payload.cached.pages)
                    : Math.max.apply(null, payload.cached.pages) -1;
      return this.getQueryResultsAndProcessMatchPages(payload, "gt", minpage);
    }else{
      return this.filterArticles({ ...payload, action: "REQUEST_INITIAL"});
    }
  }else if(payload.action == "REQUEST_INITIAL") {
    if(payload.cached) {
      let maxpage = Math.max.apply(null, Object.keys(cache))+1;
      return this.getQueryResultsAndProcessMatchPages(payload, "lt", maxpage);
    }else{
      let maxpage = Math.max.apply(null, Object.keys(cache))+1;
      return this.getQueryResultsAndProcessMatchPages(payload, "lt", maxpage);
    }
  }else if(payload.action == "REQUEST_MORE") {
    // No cache or cursor? Go to GO and do not get 200$. I mean, goto REQUEST_INITIAL.
    if(payload.cached && payload.cached.cursor) {
      return this.getQueryResultsAndProcessMatchPages(payload, "lt", payload.cached.cursor);
    }else{
      return this.filterArticles({ ...payload, action: "REQUEST_INITIAL"});
    }
  }
};

ArticleSchema.statics.getQueryResultsAndProcessMatchPages = function(payload, op, page) {
  let match;
  return this.getQueryResults(payload.query, op, page)
  .then((matches) => {
    match = matches;
    let match_pages = Object.keys(matches);
    // Check if there is a need for pages to be sent to the frontend
    let new_pages = match_pages.filter(p => payload.cached.pages.findIndex((i) => i == p) == -1);
    if(new_pages.length) return this.getPage({$in: new_pages});
    else return Promise.resolve({});
  }).then((pages) =>  {
    let page_ids = Object.keys(pages);
    // Get the lowest query page sent
    let cursor = payload.action === "REQUEST_MORE" && page_ids.length ? parseInt(Math.min.apply(null, page_ids)) : undefined;
    return {
      pages,
      match,
      cursor
    };
  });
};

ArticleSchema.statics.getQueryResults = function(query, op, page) {
  console.log(`${JSON.stringify(query)}, ${op}, ${page}`);
  var cached = this.getQueryResultsFromCache(query, op, page);
  if(!cached) {
    return this.findQueryResult(query, op, page);
  }else{
    if(this.needToUpdateQueryCache(cached, op, page)){
      return this.findQueryResult(query, op, page)
      .then((matches) => {
        return Object.keys(matches).reduce((result, page) => {
          if(result.count > 10) {
            return result;
          }else{
            result.pages[page] = matches[page];
            result.count += matches[page].length;
            return result;
          }
        }, cached);
      });
    }else{
      return Promise.resolve(cached.pages);
    }
  }
};

ArticleSchema.statics.needToUpdateQueryCache = function(qcache, op, page) {
  let maxcached = Math.max.apply(Object.keys(cache));
  let maxquerycached = Math.max.apply(Object.keys(qcache.pages));
  // Update if
  // - Cache is stale wrt latest pages not being queried & those pages being requested (REQUEST_INITIAL)
  // - Cache is stale wrt latest page being incomplete and that page being requested (REFRESH)
  // - Cache is incomplete (but not stale) wrt early pages not being loaded and those pages being requested (REQUEST_MORE)
  return (maxquerycached < maxcached && (
                                         (op === "lt" && page > maxquerycached) ||
                                         (op === "gt" && page < maxquerycached && qcache.count < 10) ||
                                         (op === "eq" && page == maxquerycached)
                                        )) ||
         (!qcache.complete && (
                               (op === "lt" && page > maxquerycached) ||
                               (op === "gt" && page < maxquerycached && qcache.count < 10) ||
                               (op === "eq" && page == maxquerycached)
                              )) ||
         (qcache.count < 10 && !qcache.reached_bottom);
};

ArticleSchema.statics.findQueryResult = function(query, op, page) {
  let qpage;
  if(op == "eq") qpage = page;
  else qpage = { [`$${op}`]: page };
  let q = { ...query, page: qpage };
  return this.find(q).sort({ page:-1, pageIndex: -1 }).limit(20)
  .then((articles) => {
    let match = reduce_to_match_pages(articles);
    this.setQueryResultsToCache(query, match);
    return match;
  });
};

ArticleSchema.statics.getQueryResultsFromCache = function(query, op, page) {
  let hashkey = hash(query);
  if(query_cache[hashkey]){
    let result;
    let maxcached = Math.max.apply(null, Object.keys(query_cache[hashkey].pages));
    let maxcached_is_complete = query_cache[hashkey].complete;
    // Latest matches should be returned first, thus the reverse
    let keys = Object.keys(query_cache[hashkey].pages).reverse();
    for(let i = 0 ; i < keys.length ; i++){
      let key = keys[i];
      if((op == "eq" && key == page) ||
         (op == "lt" && key < page)  ||
         (op == "gt" && key > page)) {
        // updating the results
        if(!result) result = { pages: {}, count: 0, complete: true, reached_bottom: false };
        result.pages[key] = query_cache[hashkey].pages[key];
        // Updating reached_bottom & complete
        if(key == 1) result.reached_bottom = true;
        if(key == maxcached) result.complete = maxcached_is_complete;
        // counting number of matches - if >= 10, stop searching
        result.count += result.pages[key].length;
        if(result.count >= 10) break;
      }
    }
    return result;
  }
  return ;
};

ArticleSchema.statics.setQueryResultsToCache = function(query, pages) {
  let hashkey = hash(query);
  let maxcached = Math.max.apply(null, Object.keys(cache));
  let maxcached_is_complete = cache[maxcached].findIndex(a => a.pageIndex == 10) !== -1;
  if(query_cache[hashkey]){
    // This overrides new changes to pages already cached since pages expansion
    // is after query_cache[hashkey].pages expansion.
    query_cache[hashkey].pages = { ...query_cache[hashkey].pages, ...pages };
    // Flag to ensure that the latest page query cache is not left stale afterwards
    query_cache[hashkey].complete = pages[maxcached] ? maxcached_is_complete : true;
    query_cache[hashkey].reached_bottom = Math.min.apply(null, Object.keys(query_cache[hashkey].pages)) == 1;
  }else{
    query_cache[hashkey] = {
      query,
      pages,
      complete: pages[maxcached] ? maxcached_is_complete : true,
      reached_bottom: Math.min.apply(null, Object.keys(pages)) == 1
    };
  }
};

ArticleSchema.statics.getSubjectsAndTags = function(){
  return {subject: subject_cache, tags: tag_cache };
};

/**
 * Pre-Hook for Save Method
 * ArticleSchema.pre('save', function) wouldn't trigger, nor wouldn't the hooker
 * monkey patching, so this is a last resort
 * Adds pagination to saved articles and persist to cache
 * Allows to solve problems with regard to keeping the cache fresh
 * DO NOT MODIFY PAGE/PAGE INDEX OF ARTICLES ANYWHERE ELSE IN THE CODE
 * THIS WOULD RESULT IN INCONSISTENCIES IN THE CACHE
 **/
ArticleSchema.methods.setPaging = function(){
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
};

/**
 * Pre-Hook for Save Method
 * ArticleSchema.pre('save', function) wouldn't trigger, nor wouldn't the hooker
 * monkey patching, so this is a last resort
 * Updates the subject cache
 **/
ArticleSchema.methods.setPropsToCache = function(){
  if(subject_cache.indexOf(this.subject) === -1) subject_cache.push(this.subject);
  this.tags.forEach((t) => { if(tag_cache.indexOf(t) === -1) tag_cache.push(t); });
};

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
    thumbnail: {
      ...(this.thumbnail),
      src: `/blog/${this.hash}/thumbnail${this.thumbnail.mime}`,
      class: this.thumbnail.width < 750 ? 'articleImgPlacementLESS750PX' : 'articleImgPlacementWIDER750PX'
    }
  };
};

function reduce_to_pages(articles, accumulator = {}) {
  return articles.reduce((acc, article) => {
    if(acc[article.page]){
      acc[article.page].push(article);
    }else{
      acc[article.page] = [article];
    }
    return acc;
  }, accumulator);
}

function reduce_to_match_pages(articles, op, page) {
  let count_matches = 0;
  let match = articles.reduce((acc, article) => {
    //Returns maximum 19 items, sorted by pages
    //Does not create a new page once >= 10 articles have been taken
    //Hence creates full pages
    if(!acc[article.page] && count_matches < 10){
      acc[article.page] = [{index: article.pageIndex, hash: article.hash}];
    }else if(acc[article.page]){
      acc[article.page].push({index: article.pageIndex, hash: article.hash});
    }
    count_matches++;
    return acc;
  }, {});

  // Filling gaps in the results
  // Pages that are in [minpage, maxpage] and that didn't return results will be replaced by empty arrays ([])
  // This ensures that pages are not mapped twice
  let minpage;
  let maxpage;
  if(op == "lt"){
    maxpage = page-1;
    // Assuming reverse order on articles
    minpage = articles.length ? articles[articles.length -1].page : Math.min.apply(null, Object.keys(cache));
  }else if(op == "gt"){
    // Assuming reverse order on articles
    maxpage = articles.length ? articles[0].page : Math.max.apply(null, Object.keys(cache));
    minpage = page+1;
  }else{
    maxpage = page;
    minpage = page;
  }
  for(let i = minpage; i < maxpage+1; i++){
    if(!match[`${i}`]) match[`${i}`] = [];
  }
  return match;
}

module.exports = ArticleSchema;
