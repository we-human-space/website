const path = require("path");

module.exports = {
  query: query
};

function query(context, filepath, cb) {
  console.log("Querying");
  var action = require(path.join(context, filepath));
  var promises = [];
  var keys = Object.keys(action);
  for(let i = 0 ; i < keys.length ; i++){
    let key = keys[i];
    if(action.hasOwnProperty(key)){
      console.log(action[key]);
      promises.push(models[key].collection.bulkWrite(action[key]));
    }
  }
  if(typeof cb === "function"){
    return Promise.all(promises)
    .then((res) => {
      console.log("Callback Then");
      console.log(res);
      cb(null, Promise.resolve(res.map((r, i) => {
        return {key: keys[i], result: r};
      })));
    }).catch((err) => {
      console.log("Callback Catch");
      console.log(err);
      cb(err, null);
    });
  }else{
    return Promise.all(promises)
    .then((res) => {
      console.log("No Callback Then");
      console.log(res);
      return Promise.resolve(res.map((r, i) => {
        return {key: keys[i], result: r};
      }));
    }).catch((err) => {
      console.log("No Callback Catch");
      console.log(err);
      return Promise.reject(err);
    });
  }
}
