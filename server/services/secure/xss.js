module.exports = xss;

function xss(value){
  if(typeof value === "object" && value !== null){
    return xssObjectEscape(value);
  }else if(typeof value === "string"){
    return xssStringEscape(value);
  }
}

function xssStringEscape(text) {
   return text.replace(/&/g, '&amp;').
     replace(/</g, '&lt;').  // it's not necessary to escape >
     replace(/"/g, '&quot;').
     replace(/'/g, '&#039;');
}

function xssObjectEscape(object) {
  for (var prop in object) {
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
