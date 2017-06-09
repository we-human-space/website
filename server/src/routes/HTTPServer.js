import express from 'express';
import bodyParser from 'body-parser';
import root from './routes';
import deploy from './deployment/routes';
import dev from './development/routes';
import prod from './production/routes';

class HTTPServer {
  constructor() {
    this.props = {};
    this.express = express();
    // Adding bodyParser
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));
    // Setting routers
    this.express.use('/', root);
    if(__DEV__ || __TEST__){
      this.express.use('/', dev);
    }else if(__DEPLOY__){
      this.express.use('/', deploy);
    }else if(__PROD__){
      this.express.use('/', prod);
    }
  }

  get port() {
    return this.props.port;
  }

  set port(port) {
    this.props.port = port;
    this.express.set('port', port);
  }

  start() {
    this.props.port = this.props.port || 8080;
    this.express.listen(this.props.port, () => {
      console.log(`Listening to port ${this.props.port}`);
    });
  }

}

export default HTTPServer;
