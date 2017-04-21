const env = process.NODE_ENV || 'development';
const config = require('../../../.config/client/index')[env];

export default config;
