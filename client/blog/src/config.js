import config from '../../../.config/client/index';

module.exports = config[process.NODE_ENV || 'development'];
