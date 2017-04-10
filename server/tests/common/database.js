const fs = require('fs');

module.exports = {
  init: init,
  populate: populate,
  clear: clear
};

var callback;
var sql;
var sqlDelete;

function init(sql_path, sqldelete_path, cb){
  callback = cb;
  sql = fs.readFileSync(__dirname + sql_path).toString().replace(/(\n|\r|\r\n)/g, ' ');
  sqlDelete = fs.readFileSync(__dirname + sqldelete_path).toString().replace(/(\n|\r|\r\n)/g, ' ');
}

function populate() {
  var p = models.sequelize.query(sql, {
    logging: false
  });
  if(typeof callback === "function"){
    return p.then(callback);
  }else{
    return p;
  }
}

function clear(){
  return models.sequelize.query(sqlDelete, {logging: false});
}
