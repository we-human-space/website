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
      let p = models[key].collection.bulkWrite(action[key])
              .catch((err) => { console.log(err); console.log(key); console.log(action[key]); return Promise.reject(err);});
      promises.push(p);
    }
  }
  if(typeof cb === "function"){
    return Promise.all(promises)
    .then((res) => {
      console.log("Hullooo");
      console.log(res);
      cb(null, Promise.resolve(res.map((r, i) => {
        return {key: keys[i], result: r};
      })));
    }).catch((err) => {
      console.log(err);
      cb(err, null);
    });
  }else{
    return Promise.all(promises)
    .then((res) => {
      console.log("Well hellooooooo");
      console.log(res);
      return Promise.resolve(res.map((r, i) => {
        return {key: keys[i], result: r};
      }));
    }).catch((err) => {
      console.log("Well fuck u");
      //console.log(err);
      return Promise.reject(err);
    });
  }
}
