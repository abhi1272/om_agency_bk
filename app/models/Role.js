'use strict';
/** Module Dependencies **/
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let roleSchema = new Schema({
  uuid: {
    type: String,
    default: uuidv4(),
    index: true,
    trim:true
  },
  name: {
    type: String,
    default: '',
    trim:true,
    required:true
  },
  page:{
    type:{String}
  },
  method:{
    type:String
  },
  canAccessAll:{
    type:Boolean
  }
},
{
  timestamps:true
}
);



const User = mongoose.model('Role', roleSchema);

module.exports = User;