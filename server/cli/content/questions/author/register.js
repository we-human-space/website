"use strict";

const models = require('../../../../models/index');
const countries = require('../../../../static/countries.json');
const inquire = require('../../../inquire');
const print = require('../../../print');
const reviewer = require('../../../reviewer');
const Author = models.Author;

module.exports = function(supermenu){
  return function() {
    var author = new Author();
    var review = reviewer({
      target: author,
      callbacks: {
        name: set_name,
        age: set_age,
        title: set_title,
        bio: set_bio,
        twitter: set_url("twitter"),
        behance: set_url("behance"),
        youtube: set_url("youtube"),
        instagram: set_url("instagram"),
        website: set_url("website"),
        country: set_country,
      }
    });
    return Promise.resolve(author)
    .then(set_name)
    .then(set_age)
    .then(set_title)
    .then(set_bio)
    .then(set_url("twitter"))
    .then(set_url("behance"))
    .then(set_url("youtube"))
    .then(set_url("instagram"))
    .then(set_url("website"))
    .then(set_country)
    .then(review)
    .then(supermenu)
    .catch((err) => {
      console.log(err);
      if(err === null) supermenu;
      else print("end", 1);
    });
  };
};

function set_name(author){
  var q = {
    type: 'input',
    name: 'username'
  };
  return inquire.looping(
    (a) => !a.username,
    (answer, first) => {
      q.message = "What's the futurename? (Required)";
      if(!answer.username && !first) q.message = "Please enter a valid name.";
      return q;
    },
    {}
  ).then((answer) => {
    author.name = answer.username;
    return author;
  });
}

function set_age(author){
  var q = {
    type: 'input',
    name: 'age'
  };
  return inquire.looping(
    (a) => {
      return !(!!a.age &&
               !!(typeof a.age === "string" && a.age.match(/^\d{2}$/)));
    },
    (answer, first) => {
      q.message = "What's their age? (Required)";
      if(!first &&
        (!answer.age || !(typeof answer.age === "string" && answer.age.match(/^\d{2}$/)))){
        q.message = "Please enter a valid integer.";
      }
      return q;
    },
    {}
  ).then((answer) => {
    author.age = parseInt(answer.age);
    return author;
  });
}

function set_title(author){
  var q = {
    type: 'input',
    name: 'title'
  };
  return inquire.looping(
    (a) => !a.title,
    (answer, first) => {
      q.message = "What's their title/soul animal? (Required)";
      if(!answer.title && !first) q.message = "Please enter a valid string.";
      return q;
    },
    {}
  ).then((answer) => {
    author.title = answer.title;
    return author;
  });
}

function set_bio(author){
  var q = {
    type: 'input',
    name: 'bio'
  };
  return inquire.looping(
    (a) => !a.bio,
    (answer, first) => {
      q.message = "Describe them to me (Required)";
      if(!answer.bio && !first) q.message = "Please enter a valid string.";
      return q;
    },
    {}
  ).then((answer) => {
    author.bio = answer.bio;
    return author;
  });
}

function set_url(prop){
  return function(author){
    var q = {
      type: 'input',
      name: prop
    };
    return inquire.looping(
      (a) => {
        return a[prop] !== '' &&
               !(!!a[prop] && !!a[prop].match(/^http\:\/\/(www\.)?[a-z]\.com\/.*/));
      },
      (answer, first) => {
        q.message = `What is their ${prop} URL? (Optional)`;
        if(!answer[prop] && !first) q.message = "Please enter a valid URL.";
        return q;
      },
      {}
    ).then((answer) => {
      author[prop] = answer[prop];
      return author;
    });
  };
}

function set_country(author){
  var q = {
    type: 'input',
    name: 'country',
    message: "Country of residence? (Required)",
  };
  return inquire.looping(
    (a) => {
      return !(!!a.country &&
             countries.some((c) => {
               return c.name.toLowerCase() === a.country.toLowerCase() ||
                      c.code === a.country.toUpperCase();
             }));
    },
    (answer, first) => {
      q.message = "Country of residence? (Required)";
      let isCountry = (!!answer.country &&
       countries.some((c) => {
         return c.name.toLowerCase() === answer.country.toLowerCase() ||
                c.code === answer.country.toUpperCase();
       }));
      if(!first && !isCountry) q.message = "Please enter a valid country.";
      return q;
    },
    {}
  ).then((answer) => {
    author.country = answer.country;
    return author;
  });
}
