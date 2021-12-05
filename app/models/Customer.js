const mongoose = require('mongoose');
const CustomerSchema = mongoose.Schema({
    uuid:{
      type: String,
      unique:true
    },
    name: {
      type:String,
      required:true
    },
    area: {
      type:String
    },
    uniqueName: {
      type:String
    },
    address:{
      type:String
    },
    place:{
      uuid: {type: String},
      name:{type:String}
    },
    email:{
        type: String
      },
    type:{
      type:String
    },
    customer_type:{
      type:String,
    },
    phoneNumber:{
      type :Number
    },
    notes:{
      tye:String
    },
    orgId:{
      type: String
    },
    totalBillAmount:{
        type :Number,
        default:0
    },
    totalPaymentAmount:{
        type :Number
    },
    active: {
      type: Boolean,
      default: true
    }
},
{
  timestamps:true
});


module.exports = mongoose.model('Customer',CustomerSchema); 