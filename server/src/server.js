import path from 'path';
import config from './config';
import models from './models/index';
import uploader from './services/articles/uploader';
import HTTPServer from 'routes/HTTPServer';

// Setting some config points
config.views.path = path.join(process.argv[1], '../../', config.views.path);
console.log(config.views.path);

// CMS Service
uploader.watch();

// Cache Initialization
models.Author.initCache();
models.Article.initCache();

// ExpressJS App Initialization
const app = new HTTPServer();
app.port = config.global.port;
app.start();
