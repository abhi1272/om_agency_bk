const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const categorySchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4(),
    },
    name: {
      type: String,
      default: "",
    },
    orgId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('Category',categorySchema);
