const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      trim: true,
    },
    expenses_date: {
      type: Date,
      default: Date()
    },
    type:{
        uuid: {type: String},
        name:{type:String}
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expense", expenseSchema);