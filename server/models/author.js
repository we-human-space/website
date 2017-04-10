const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var AuthorSchema = new Schema({
  name: {type: String, required: true},
  bio: {type: String, required: true},
  interests: {type: String, required: false},
  title: {type: String, required: true},
  twitter: {type: String, required: false},
  behance: {type: String, required: false},
  youtube: {type: String, required: false},
  instagram: {type: String, required: false},
  website: {type: String, required: false},
  country: {type: String, required: false}
});

AuthorSchema.index({'name': 'text'});

module.exports = AuthorSchema;
