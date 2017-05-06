import Ajv from 'ajv';
import FreshMail from 'freshmail-js';
import mongo_sanitize from 'mongo-sanitize';
import models from '../../models';
import config from '../../config';
import sub_schema from './subscribe.schema.json';

const Subscriber = models.Subscriber;
const freshmail = new FreshMail(config.freshmail.api.key, config.frehsmail.api.secret);

export function subscribe(req, res) {
  var subscriber;
  // Sanitizing & Validating
  Promise.resolve(mongo_sanitize(req.body))
  .then((body) => {
    var ajv = new Ajv();
    if(ajv.validate(sub_schema, body)){
      return body;
    }else{
      let err = ajv.errors;
      err.status = 400;
      return Promise.reject(err);
    }
  }).then((validated) => {
    subscriber = new Subscriber(validated);
    return freshmail.addSubscriber(subscriber.email, config.freshmail.newsletter.main.hash);
  }).then(() => {
    return subscriber.save();
  }).then(() => {
    res.sendStatus(200);
  }).catch((err) => {
    console.log(err);
    res.status = err.status || 500;
    res.json({error: err});
  });
}

const newsletter = {
  subscribe: subscribe
};

export default newsletter;
