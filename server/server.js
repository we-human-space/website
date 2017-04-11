'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const consolidate = require('consolidate');
const env = process.env.NODE_ENV || 'development';
const config = require('../.config/server/index')[env];
const models = require('./models/index');


// App
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', consolidate.mustache);
app.set('view engine', 'html');
app.set("views", config.views.path);
app.set('port', config.global.port);

app.listen(config.global.port, function() {
  console.log(`Listening to port ${config.global.port}`);
});
