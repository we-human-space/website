const path = require('path');
const mongoose = require('mongoose');
const env = process.env.NODE_ENV || 'development';
const config = require('../../.config/server/index')[env];
const Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  hash: {type:String, required: true, unique: true, index: true},
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

ArticleSchema.methods.export = function(){
  return {
    title: this.title,
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
