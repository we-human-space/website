import fs from 'fs';
import nodemailer from 'nodemailer';
import mustache from 'mustache';
import mailgun_transport from 'nodemailer-mailgun-transport';
import config from '../../config';

const mailgun_auth = {
  auth: {
    api_key: config.mailgun.auth.api_key,
    domain: config.mailgun.auth.domain
  }
};

module.exports = {
  renderAndSend: render_and_send,
  send: send,
  render: render
};

function render_and_send(options){
  return render(options.path, options.html, options.data)
  .then((body) => {
    options.body = body;
    return send(options);
  });
}

function render(path, html, data){
  if(path && data){
    return readfile(path)
    .then((html) => {
      return mustache.render(html, data);
    });
  }else if(html && data){
    return Promise.resolve(mustache.render(html, data));
  }else{
    return Promise.reject(new Error("path or html must be defined, alongside data"));
  }
}

function send(options){
  var nmmg = nodemailer.createTransport(mailgun_transport(mailgun_auth));
  var mail = {
    from: options.sender || config.mailgun.auth.sender,
    to: options.to.join(", "),
    subject: options.subject,
    html: options.body,
  };
  return new Promise((resolve, reject) => {
    nmmg.sendMail(mail, (err, res) => {
      if(err){
        reject(err);
      }else{
        resolve(res);
      }
    });
  });
}

function readfile(path){
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', function(err, content) {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}
