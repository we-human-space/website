"use strict";

const models = require('../../../../models/index');
const inquire = require('../../../inquire');
const print = require('../../../print');
const reviewer = require('../../../reviewer');
const set_tags = require('./tags');
const Article = models.Article;
const Author = models.Author;

module.exports = function(supermenu){
  return function() {
    var article = new Article();
    var review = reviewer({
      target: article,
      callbacks: {
        title: set_string('title'),
        subject: set_string('subject'),
        category: set_string('category'),
        summary: set_string('summary'),
        author: set_author,
        tags: set_tags,
        thumbnail: pick_image
      }
    });
    return Promise.resolve(article)
    .then(set_string('title'))
    .then(set_string('subject'))
    .then(set_string('category'))
    .then(set_string('summary'))
    .then(set_author)
    .then(set_tags)
    .then(pick_article)
    .then(pick_image)
    .then(review)
    .then(commit)
    .then(supermenu)
    .catch((err) => {
      console.log(err);
      if(err === null) supermenu;
      else print("end", 1);
    });
  };
};

function set_string(prop){
  return function(article){
    var q = {
      type: 'input',
      name: prop
    };
    return inquire.looping(
      (a) => !a[prop],
      (answer, first) => {
        q.message = `What is the ${prop} of the article?`;
        if(!answer[prop] && !first) q.message = "Please enter a valid string.";
        return q;
      },
      {}
    ).then((answer) => {
      article[prop] = answer[prop];
      return article;
    });
  }
}

function set_author(article){
  var q = {
    type: 'input',
    name: 'author'
  };
  var futureperson = null;
  return inquire.looping(
    //Checks if the person has been found in db
    () => !!futureperson,
    (answer, first) => {
      q.message = "What's the futurename (unique username, like github)? (Required)";
      if(!answer.username && !first) {
        return Author.findOne({username: answer.author})
        .then((result) => {
          if(result === null){
            q.message = "Could not find futurename in db; are you sure there is such a futureperson?";
          }else{
            futureperson = result._id;
          }
          return q;
        });
      }
      return Promise.resolve(q);
    },
    {}
  ).then((answer) => {
    article.username = answer.username;
    return article;
  });
}

function set_url(prop){
  return function(article){
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
      article[prop] = answer[prop];
      return article;
    });
  };
}

function commit(article){
  return article.save()
  .then(() => {
    return Article.findOne({title: article.title});
  })
  .then((a) => {
    console.log(`  Article ${artri} was successfully saved to database!\n`);
  });
}
