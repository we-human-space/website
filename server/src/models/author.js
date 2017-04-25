import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const cache = {};
const export_cache = {};

var AuthorSchema = new Schema({
  firstname: {type: String, required: true},
  lastname: {type: String, required: true},
  username: {type: String, required: true, unique: true, index: true},
  email: {type: String, required: true, unique: true},
  age: {type: Number, required: true},
  bio: {type: String, required: true},
  title: {type: String, required: true},
  twitter: {type: String, required: false},
  behance: {type: String, required: false},
  youtube: {type: String, required: false},
  instagram: {type: String, required: false},
  website: {type: String, required: false},
  country: {type: String, required: false},
});

AuthorSchema.statics.initCache = function() {
  console.log("Initializing Author Cache");
  this
    .find()
    .then((authors) => authors.forEach((a) => a.setToCache()))
    .then(() => console.log("Author Cache initialized"));
};

AuthorSchema.statics.getCachedAuthors = function(should_export) {
  console.log(export_cache);
  if(should_export){
    return export_cache;
  }else{
    return cache;
  }
};

AuthorSchema.statics.findAuthor = function(query) {
  let cached = this.findFromCache(query);
  if(!cached) {
    return this.findOne(query)
    .then((a) => {
      if(a) a.setToCache();
      return a;
    });
  }else{
    return Promise.resolve(cached);
  }
};

AuthorSchema.statics.findFromCache = function(query){
  if(query._id){
    return cache[query._id.toString()];
  }else if(query.username){
    return Object.keys(cache).reduce((acc, key) => {
      if(cache[key].username == query.username) return cache[key].username;
      else return acc || undefined;
    });
  }
};

AuthorSchema.methods.setToCache = function() {
  if(!cache[this._id.toString()]) cache[this._id.toString()] = this;
  if(!export_cache[this._id.toString()]) export_cache[this._id.toString()] = this.export();
  console.log(this);
};

AuthorSchema.methods.export = function(){
  return {
    _id: this._id.toString(),
    firstname: this.firstname,
    lastname: this.lastname,
    username: this.username,
    email: this.email,
    age: this.age,
    title: this.title,
    twitter: this.twitter,
    behance: this.behance,
    youtube: this.youtube,
    instagram: this.instagram,
    website: this.website,
    country: this.country
  };
};

module.exports = AuthorSchema;
