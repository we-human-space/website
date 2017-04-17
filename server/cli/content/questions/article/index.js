"use strict";

const inquire = require('../../../inquire');
const post = require('./post');
//const delete = require('./delete');

module.exports = function(supermenu){
  let q = {
    type: 'rawlist',
    name: 'action',
    message: 'Manage articles - Pick an action',
    actions: {}
  };
  q.actions["Post a new article"] = post(() => inquire.single(q));
  //q.actions["Modify an existing article"] = modify(() => inquire.single(q));
  //q.actions["Delete an existing article"] = delete(() => inquire.single(q));
  q.actions["Back"] = supermenu;
  q.choices = Object.keys(q.actions);
  return () => inquire.single(q);
};
