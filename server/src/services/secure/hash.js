'use strict';

import crypto from 'crypto';

module.exports = {
  shortener: generate_base_62_hash,
  hash: generate_pwd_hash,
  match: validate_pwd_hash,
  isBase62Hash: is_base_62_hash,
  base62ToDec: base62_to_dec
};

function generate_base_62_hash(data) {
  var salt = genSalt(64);
  var hash = crypto.createHmac('sha256', salt);
  hash.update(JSON.stringify(data));
  return hex_to_base62(hash.digest('hex')).substring(0,10);
}

function is_base_62_hash(str) {
  const regex62 = /^[0-9a-zA-Z]{10}$/;
  return typeof str === "string" &&
         !!str.match(regex62);
}

function hex_to_base62(hexstr){
  const base62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let num = parseInt(hexstr, 16);
  let b62str = '';
  let mod = 0;
  do {
    num = num / 62;
    mod = Math.round((num - Math.floor(num))*62);
    b62str = base62.charAt(mod) + b62str;
    num = Math.floor(num);
  }while(num !== 0);
  return b62str;
}

function base62_to_dec(b62str){
  const base62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let num = 0;
  for(let i = 0; i < b62str.length; i++){
    num += Math.pow(62, i)*(base62.indexOf(b62str.charAt(b62str.length-(i+1))));
  }
  return num;
}

function generate_pwd_hash(password) {
  var salt = genSalt(64);
  return sha256(password, salt);
}

function validate_pwd_hash(password, salt, hash){
  password = sha256(password, salt);
  return password.hash === hash;
}

// Hashing algorithm sha256
function sha256(password, salt) {
  var hash = crypto.createHmac('sha256', salt);
  hash.update(password);
  var value = hash.digest('hex');
  return {
    salt: salt,
    hash: value
  };
}

function genSalt(length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    // convert to hexadecimal format
    .toString('hex')
    // return required number of characters
    .slice(0, length);
}
