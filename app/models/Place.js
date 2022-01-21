const mongoose = require('mongoose');
const PlaceSchema = new mongoose.Schema([
  {
    name: { type: String, require: true, unique: true, default: '' }
  }
]);
module.exports = mongoose.model('Place',PlaceSchema);
