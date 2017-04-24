"use strict";

import inquirer from 'inquirer';
const prompt = inquirer.createPromptModule();
import print from './print';
import loop from '../utilities/loop';

module.exports = {
  single: ask,
  many: ask_many,
  looping: looping
};

function ask(question){
  return prompt([question])
  .then(function(answer){
    //console.log(`  Answered: ${answer[question.name]}`);
    if(question.type === "rawlist" || question.type === "list"){
      return question.actions[answer[question.name]](answer[question.name]);
    }else if(question.type === "input" || question.type === "confirm"){
      if(typeof question.actions === "object" &&
         typeof question.actions[question.name] === "function"){
        return question.actions[question.name](answer[question.name]);
      }else{
        return answer;
      }
    }
  }).catch((error) => {
    console.log(error);
    print("end", 1);
  });
}

function ask_many(questions){
  return prompt(questions)
  .then(function(answers){
    questions.forEach((q) => {
      if(q.type === "rawlist" || q.type === "list"){
        q.actions[answers[q.name]]();
      }else if(q.type === "input" || q.type === "confirm"){
        q.actions[q.name](answers[q.name]);
      }
    });
  }).catch((error) => {
    console.log(error);
    print("end", 1);
  });
}

function looping(condition, question, base_value){
  return loop(
    condition,
    (value, first) => {
      let q = question(value, first);
      if(q instanceof Promise){
        return q.then((res) => { return ask(res); });
      }else{
        return ask(question(value, first));
      }
    },
    base_value
  );
}
