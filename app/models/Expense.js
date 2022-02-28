const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const expenseSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4(),
    },
    type: {
      type: Object,
      require: true,
    },
    amount: { type: Number, require: true },
    date: { type: Date, require: true },
    orgId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expense", expenseSchema);
