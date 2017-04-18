"use strict";

//Start/End printing function
module.exports = function (point, exit){
  if(point === "start"){
    console.log("");
    console.log("============================================================");
    console.log("FutureboyHQ Command Line Content Management System");
    console.log("");
  }else if(point === "end"){
    console.log("");
    console.log("END=========================================================");
    console.log("");
    console.trace("Process exited");
    process.exit(typeof exit === "number" ? exit : 0);
  }
};
