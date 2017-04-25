import config from './config';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/routes';
import models from './models/index';
import uploader from './services/articles/uploader';

// Setting some config points
config.views.path = path.join(process.argv[1], '../../', config.views.path);
console.log(config.views.path);

// CMS Service
uploader.watch();

models.Author.initCache();
models.Article.initCache();

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
