'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const env = process.env.NODE_ENV || 'development';
const config = require('../.config/server/index')[env];
const routes = require('./routes/routes');
const models = require('./models/index');

//Setting some config points
config.views.path = path.join(process.argv[1], config.views.path);

// App
const app = express();
//Adding bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Setting Port
app.set('port', config.global.port);
app.use('/', routes);

app.listen(config.global.port, function() {
  console.log(`Listening to port ${config.global.port}`);
});
