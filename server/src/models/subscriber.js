import mongoose from 'mongoose';
const Schema = mongoose.Schema;

var SubscriberSchema = new Schema({
  firstname: {type: String, required: true},
  lastname: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  userEnabled: {type: Boolean, default: false},
});

export default SubscriberSchema;
