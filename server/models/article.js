const mongoose = require('mongoose');
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
    width: {type:Number, required: true, unique: false},
    height: {type:Number, required: true, unique: false},
  }
});

module.exports = ArticleSchema;
