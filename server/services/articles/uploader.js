"use strict";

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const spawn = require('child_process').spawn;
const hash = require('../secure/hash');
const env = process.env.NODE_ENV || 'development';
const config = require('../../../.config/server/index')[env];

//watch the folder for zip files
//on new zip file creation
  //trigger spawn process to extract zip file in a folder of the name of the zip file
//open folder
//validate
  //read yaml description file & validate
  //verify there is an html file
  //verify there is an image file of size < 2MB
  //if validation fails
    //delete zip
    //delete extraction folder
//add to database
  //generate hash of article
  //generate url of article
  //create folder client/blog/views/articles/name-of-article-hash
  //move image and html file to folder client/blog/views/articles/name-of-article-hash
  //if all is well
    //delete zip
    //delete extraction folder
//confirm
  //send an email to the to-be-notified list (uploaders) confirming/infirming success

//next steps:
//update html folder structure for better structure (css folder, html folder, etc)
//update html to make template engine match
  //create a header
  //create a nav menu
  //create a footer
  //blog:
    //use feed_article as a template
    //use logic-based templating to list 8 first articles
  //articles
    //use content.html as a template
    //generate the article from the database information
    //generate the body of the article from the html

//create javascript for loading next articles via ajax
  //research: scroll point event
    //find a way to dynamically load articles in the list as the person scrolls
  //build an endpoint with pagination of articles
    //build a CRUD op with pagination on mongo
