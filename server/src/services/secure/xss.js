module.exports = xss;

function xss(value){
  console.log("escaping");
  if(typeof value === "object" && value !== null){
    return xssObjectEscape(value);
  }else if(typeof value === "string"){
    return xssStringEscape(value);
  }
}

function xssStringEscape(text) {
  return text.replace(/&/g, '&amp;').
     replace(/</g, '&lt;').
     replace(/>/g, '&gt;').
     replace(/"/g, '&quot;').
     replace(/'/g, '&#039;');
}

function xssObjectEscape(object) {
  for (var prop in object) {
    console.log(prop);
    if(typeof object[prop] === "string"){
      object[prop] = xssStringEscape(object[prop]);
    }else if(Array.isArray(object[prop])){
      object[prop] = object[prop].map((i) => xss(i));
    }else if(typeof object[prop] === "object" && object[prop] !== null){
      xssObjectEscape(object[prop]);
    }
  }
  return object;
}
