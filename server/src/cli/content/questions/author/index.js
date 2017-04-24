"use strict";

import inquire from '../../../inquire';
import register from './register';
//import delete from './delete';

module.exports = function(supermenu){
  let q = {
    type: 'rawlist',
    name: 'action',
    message: 'Manage authors - Pick an action',
    actions: {}
  };
  q.actions["Register a futureboy/futuregirl"] = register(() => inquire.single(q));
  //q.actions["Modify a futureboy/futuregirl"] = modify(() => inquire.single(q));
  //q.actions["Delete a futureboy/futuregirl"] = delete(() => inquire.single(q));
  q.actions["Back"] = supermenu;
  q.choices = Object.keys(q.actions);
  return () => inquire.single(q);
};
