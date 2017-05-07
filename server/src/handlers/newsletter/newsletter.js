import Ajv from 'ajv';
import FreshMail from '../../services/mail/freshmail-js/FreshMail';
import mongo_sanitize from 'mongo-sanitize';
import models from '../../models';
import config from '../../config';
import sub_schema from './subscribe.schema.json';

const Subscriber = models.Subscriber;
const freshmail = new FreshMail(config.freshmail.api.key, config.freshmail.api.secret);

export function subscribe(req, res) {
  var subscriber;
  // Sanitizing & Validating
  Promise.resolve(mongo_sanitize(req.body))
  .then((body) => {
    var ajv = new Ajv();
    if(ajv.validate(sub_schema, body)){
      return body;
    }else{
      let err = new Error();
      err.payload = ajv.errors;
      err.status = 400;
      return Promise.reject(err);
    }
  }).then((validated) => {
    subscriber = new Subscriber();
    subscriber.email = validated.email;
    subscriber.firstname = validated.firstname;
    return freshmail.addSubscriber(subscriber.email, config.freshmail.newsletter.main.hash, 2, 1);
  }).then(() => {
    return subscriber.save();
  }).then(() => {
    res.sendStatus(200);
  }).catch((err) => {
    console.log(err);
    res.status(err.status === 555 ? 400 : 500).send({error: err.payload});
  });
}

const newsletter = {
  subscribe: subscribe
};

export default newsletter;
