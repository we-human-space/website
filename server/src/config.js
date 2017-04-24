const env = process.NODE_ENV || 'development';
const config = require('../../.config/server/index')[env];

module.exports = config;
