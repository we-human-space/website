const path = require('path');
const mongoose = require('mongoose');
const env = process.env.NODE_ENV || 'development';
const config = require('../../.config/server/index')[env];
const Schema = mongoose.Schema;

const cache = {};

var ArticleSchema = new Schema({
  hash: {type:String, required: true, unique: true, index: true},
  page: {type:Number, required: true, index: true},
  pageIndex: {type: Number, required, true},
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
      return { pages: { [page]: [ ...cache[page] ] }, complete: true missing: []};
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
    }, { pages: {}, complete: true, missing: []});
  }
};

ArticleSchema.statics.getPage = function(page) {
  if(page){
    let cached = ArticleSchema.statics.getPageFromCache(page);
    if(results.complete){
      return Promise.resolve(cached);
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
        }, {});
      }).then((pages) => {
        cache = { ...cache, ...pages };
        return { ...cached.pages, ...pages };
      });
    }
  }else{
    return ArticleSchema.find().sort({page: -1}).limit(10)// .exect()
    .then((articles) => {
      return {
        [articles[0].page]: articles
      }
    });
  }
};

/*
 * Pre-Hook for Save Method
 * Adds pagination to saved articles and persist to cache
 * Allows to solve problems with regard to keeping the cache fresh
 * DO NOT MODIFY PAGE/PAGE INDEX OF ARTICLES ANYWHERE ELSE IN THE CODE
 * THIS WOULD RESULT IN INCONSISTENCIES IN THE CACHE
 */
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
