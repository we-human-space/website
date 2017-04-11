"use strict";

const inquire = require('./inquire');

module.exports = function(options){
  return function(){
    let target = options.target;
    let callbacks = options.callbacks;
    let copy = make_shallow_copy(target, Object.keys(callbacks));
    let commit = options.commit ?
                 options.commit :
                 () => { commit_on_target(target, copy); return Promise.resolve(target); };
    let cancel = options.cancel ?
                 options.cancel :
                 () => { return Promise.reject(null); };

    let q = {
      type: 'list',
      name: 'choice',
      message: 'Please review the entered information: '
    };
    set_actions(q, copy, callbacks, commit, cancel);
    return inquire.looping(
      (a) => {console.log("this is");console.log(a);console.log("sparta");return !(a.choice === ">> Commit" || a.choice === ">> Cancel");},
      (t, first) => { if(!first) set_actions(q, t, callbacks, commit, cancel); return q; },
      {}
    );
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


function set_actions(q, copy, callbacks, commit, cancel){
  q.actions = {};
  q.choices = undefined;
  set_callback_actions(q, copy, callbacks);
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
    q.actions[`${capitalize(key)}: ${value}${shortened}`] = () => callbacks[key](target);
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
