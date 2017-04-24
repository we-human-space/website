import config from '../../.config/server/index';

global.__ENV__ = process.NODE_ENV || 'development';
global.__PROD__ = __ENV__ == 'production';
global.__DEV__ = __ENV__ == 'development';
global.__TEST__ = __ENV__ == 'test';

module.exports = config[process.NODE_ENV || 'development'];
