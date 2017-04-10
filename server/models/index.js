'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../../.config/server/index')[env];

//Setting up Mongoose ES6 Promises
mongoose.Promise = global.Promise;
// Database Connection
logger.log(`Initiating connection to mongodb @ ${config.mongodb.host}:${config.mongodb.port}`);
//mongoose.connect(`mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.dbname}`);
mongoose.connect(`mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.dbname}`);

var db = {};

fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    let schema = require(`./${file}`);
    let name = capitalize(file.substring(0, file.length-3));
    let model = mongoose.model(name, schema);
    db[name] = model;
  });

db.mongoose = mongoose;

module.exports = db;

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
