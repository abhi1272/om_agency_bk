const mongoose = require('mongoose');
const expenseSchema = new mongoose.Schema([
  {
    type: { type: String, require: true, unique: false, default: '' },
    amount: { type: Number, require: true, unique: false, default: '' },
    date: { type: String, require: true, unique: false, default: '' }
  }
]);
module.exports = mongoose.model('Expense',expenseSchema);
