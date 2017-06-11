import config from './config';
import models from './models/index';
import uploader from './services/articles/uploader';
import HTTPServer from './routes/HTTPServer';

// CMS Service
uploader.watch();

console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

// Cache Initialization
models.Author.initCache();
models.Article.initCache();

// ExpressJS App Initialization
const app = new HTTPServer();
app.port = config.global.port;
app.start();
