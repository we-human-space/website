'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const env = process.env.NODE_ENV || 'development';
const config = require('../.config/server/index')[env];
const mongoose = require('mongoose');


// App
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', config.global.port);

//Setting up Mongoose ES6 Promises
mongoose.Promise = global.Promise;
// Database Connection
console.log(`Initiating connection to mongodb @ ${config.mongodb.host}:${config.mongodb.port}`);
//mongoose.connect(`mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.dbname}`);
mongoose.connect(`mongodb://${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.dbname}`);

app.listen(config.global.port, function() {
  console.log(`Listening to port ${config.global.port}`);
});
