const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();

module.exports = {
  stop: stop,
  confirm: confirm
};

function stop (message, default_timeout) {
  var self = this;
  self.timeout(timelimit);

  var timelimit = default_timeout ? default_timeout : 10000;
  var timestep = 1000;
  var interval = setInterval(()=>{ timelimit += timestep; self.timeout(timelimit); }, timestep);

  var questions = [
    {
      type: 'input',
      name: 'moveon',
      message: message ? message : 'Ready to move on whenever you want, Master.'
    }
  ];
  return prompt(questions)
  .then(function() {
    clearInterval(interval);
    return Promise.resolve();
  });
}

function confirm (message, default_timeout) {
  var self = this;
  self.timeout(timelimit);

  var timelimit = default_timeout ? default_timeout : 10000;
  var timestep = 1000;
  var interval = setInterval(()=>{ timelimit += timestep; self.timeout(timelimit); }, timestep);

  var questions = [
    {
      type: 'confirm',
      name: 'confirm',
      message: message ? message : 'Is everything all good?',
      default: true
    }
  ];
  return prompt(questions)
  .then(function(answer) {
    clearInterval(interval);
    if(answer.confirm) return Promise.resolve();
    else return Promise.reject();
  });
}
