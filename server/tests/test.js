"use strict";

const common = require("./common/index");
const tests = require("./tests.json");
const User = models.User;

function importTest(name, path) {
  describe(name, function () {
    require(path);
  });
}

describe("Futureboy Testing Suite", function () {
  before(function(done){ clearUserDb(done); });
  if(process.env.TESTS){
    let envtests = process.env.TESTS.split(",");
    for(let key in tests){
      if(envtests.indexOf(key) !== -1){
        importTest(tests[key].name, tests[key].path);
      }
    }
    if(envtests.indexOf('phone') !== -1){
      importTest("SMS Validation Code Testing", './sms/test.js');
    }
  }else{
    for(let key in tests){
      importTest(tests[key].name, tests[key].path);
    }
  }

  after(function(done){ clearUserDb(done); });
});

function clearUserDb(done){
  var userData = {
    email: {
      $in: ["qtest10@abc.com"]
    }
  };

  User.remove(userData)
  .then(() => {
    return User.find(userData);
  }).then((result) => {
    assert.equal(result.length, 0);
    done();
  });
}
