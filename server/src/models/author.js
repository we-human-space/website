const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cache = [];

var AuthorSchema = new Schema({
  username: {type: String, required: true, unique: true, index: true},
  name: {type: String, required: true, unique: true, index: true},
  email: {type: String, required: true, unique: true},
  age: {type: Number, required: true},
  bio: {type: String, required: true},
  interests: {type: String, required: false},
  title: {type: String, required: true},
  twitter: {type: String, required: false},
  behance: {type: String, required: false},
  youtube: {type: String, required: false},
  instagram: {type: String, required: false},
  website: {type: String, required: false},
  country: {type: String, required: false},
});

AuthorSchema.statics.findFromCache = function(query){
  return cache.find((author) => {
    let found = true;
    for(let key in query){
      found = found &&
              query.hasOwnProperty(key) &&
              author[key] === query[key];
    }
    return found;
  });
};

AuthorSchema.pre('save', function(next) {
  let self = this;
  let index = cache.findIndex((a) => a.username === self.username);
  if(index !== -1){
    cache[index] = this;
  }
});

AuthorSchema.methods.export = function(){
  return {
    username: this.username,
    name: this.name,
    email: this.email,
    age: this.age,
    interests: this.interests,
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
