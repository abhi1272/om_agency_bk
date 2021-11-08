const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    place: {
      type: String,
    },
    owner:{
        type: String
    },
    subscription: {
      type: Date,
      require: true
    },
    logo:{
      type: String
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Organization", organizationSchema);
