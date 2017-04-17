module.exports = loop;

function loop(condition, body, value, first) {
  //check if first loop
  first = first === undefined || typeof first !== "boolean" ? true : false;
  //loop condition is run against value
  var bool = condition(value);
  var flag = false;
  if(bool instanceof Promise){
    //then => body is executed, condition successful
    //catch => out of body, condition failed.
    return bool
    .then(() => {
      return body(value, first)
        .then((v) => { return loop(condition, body, v, false); })
        .catch((err) => { flag = true; return Promise.reject(err); });
    }).catch((err) => {
      return !flag ? Promise.resolve(value) : Promise.reject(err);
    });
  }else if(typeof bool === "boolean"){
    if(bool){
      return body(value, first).then((v) => { return loop(condition, body, v, false); });
    }else{
      return Promise.resolve(value);
    }
  }else{
    throw new TypeError("Return value of condition function must be a Promise or a boolean");
  }
}
