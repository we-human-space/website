const read = require('./read');
const copy = require('./copy');
const mkdir = require('./mkdir');
const remove = require('./remove');
const chmod = require('./chmod');

module.exports = {
  read: read,
  copy: copy,
  mkdir: mkdir,
  remove: remove,
  chmod: chmod
};
