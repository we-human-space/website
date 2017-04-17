const path = require("path");

module.exports = {
  query: query
};

function query(context, filepath, cb) {
  var action = require(path.join(context, filepath));
  var promises = [];
  var keys = Object.keys(action);
  for(let i = 0 ; i < keys.length ; i++){
    let key = keys[i];
    if(action.hasOwnProperty(key)){
      promises.push(models[key].collection.bulkWrite(action[key]));
    }
  }
  if(typeof cb === "function"){
    return Promise.all(promises)
    .then((res) => {
      cb(null, Promise.resolve(res.map((r, i) => {
        return {key: keys[i], result: r};
      })));
    }).catch((err) => {
      cb(err, null);
    });
  }else{
    return Promise.all(promises)
    .then((res) => {
      return Promise.resolve(res.map((r, i) => {
        return {key: keys[i], result: r};
      }));
    }).catch((err) => {
      return Promise.reject(err);
    });
  }
}
