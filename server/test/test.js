"use strict";

require("./test.config.js");
const tests = require("./tests.json");

function importTest(name, path) {
  describe(name, function () {
    require(path);
  });
}

describe("Futureboy Testing Suite", function () {
  if(process.env.TESTS){
    let envtests = process.env.TESTS.split(",");
    for(let key in tests){
      if(envtests.indexOf(key) !== -1){
        importTest(tests[key].name, tests[key].path);
      }
    }
  }else{
    for(let key in tests){
      importTest(tests[key].name, tests[key].path);
    }
  }
});
