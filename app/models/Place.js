const mongoose = require("mongoose");

let PlaceSchema = new mongoose.Schema({
  uuid: {
    type: String,
    index: true,
    trim:true
  },
  name: {
    type: String,
    default: '',
    trim:true,
    required:true
  },
  orgId:{
    type: String,
    required: true
  },
  canAccessAll:{
    type:Boolean
  }
},
{
  timestamps:true
}
);
module.exports = mongoose.model("Place", PlaceSchema);
