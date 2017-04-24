"use strict";

import inquire from './inquire';

module.exports = function(options){
  return function(){
    let target = options.target;
    let callbacks = options.callbacks;
    let copy = make_shallow_copy(target, Object.keys(callbacks));
    let commit = options.commit ?
                 options.commit :
                 (a) => {
                   commit_on_target(target, q.copy);
                   let ans = {};
                   ans[q.name] = a;
                   return ans;
                 };
    let cancel = options.cancel ?
                 options.cancel :
                 () => { return Promise.reject(null); };

    let q = {
      type: 'list',
      name: 'choice',
      message: 'Please review the entered information: ',
      copy: copy,
    };
    set_actions(q, callbacks, commit, cancel);
    return inquire.looping(
      (a) => {
        return a.choice === undefined || !(a.choice === ">> Commit" || a.choice === ">> Cancel");},
      (ans, first) => {
        if(!first) set_actions(q, callbacks, commit, cancel);
        return q;
      },
      {}
    ).then(() => { return target; });
  };
};

function make_shallow_copy(target, properties){
  var copy = {};
  for(let i = 0; i < properties.length; i++){
    if(target[properties[i]] === undefined){
      copy[properties[i]] = undefined;
    }else{
      copy[properties[i]] = JSON.parse(JSON.stringify(target[properties[i]]));
    }
  }
  return copy;
}


function set_actions(q, callbacks, commit, cancel){
  q.actions = {};
  q.choices = undefined;
  set_callback_actions(q, q.copy, callbacks);
  //q.actions[">> Undo"] = () => { return; };/*TODO*/
  //q.actions[">> Redo"] = () => { return; };/*TODO*/
  q.actions[">> Commit"] = commit;
  q.actions[">> Cancel"] = cancel;
  q.choices = Object.keys(q.actions);
}

function set_callback_actions(q, target, callbacks){
  for(let key in callbacks){
    let value;
    if(target[key] === null) value = "null";
    else if(target[key] === undefined) value = "<undefined>";
    else value = target[key] + "";
    let shortened = value.length > 50 ? ' ...' : '';
    value = value.length > 50 ? value.substring(0,50): value;
    q.actions[`${capitalize(key)}: ${value}${shortened}`] = (a) => {
      return callbacks[key](target)
      .then(() => {
        let ans = {};
        ans[q.name] = a;
        return ans;
      });
    };
  }
}

function commit_on_target(target, copy){
  for(let key in copy){
    target[key] = copy[key];
  }
}

function capitalize(str){
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}
