const mongoose = require("mongoose");
const PlaceSchema = new mongoose.Schema([
  {
    name: { type: String, require: true, unique: true, default: "" },
    uuid: { type: String, require: true, unique: true}
  },
]);
module.exports = mongoose.model("Place", PlaceSchema);
