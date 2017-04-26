"use strict";

const print = require('../../print');
const inquire = require('../../inquire');
//import article from './article';
const author = require('./author/index');

module.exports = function(supermenu) {
  let q = {
    type: 'rawlist',
    name: 'action',
    message: 'Pick an action to perform',
    actions: {}
  };
  //q.actions["Manage articles"] = article(() => inquire.single(q));
  q.actions["Manage authors"] = author(() => inquire.single(q));
  q.actions[supermenu === undefined? "Exit" : "Back"] = supermenu === undefined? () => { print("end",0); } : supermenu;
  q.choices = Object.keys(q.actions);
  return supermenu === undefined?
         inquire.single(q):
         () => inquire.single(q);
};
