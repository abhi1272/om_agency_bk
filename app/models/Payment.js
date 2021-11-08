const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    paid_amount: {
      type: Number,
      required: true,
    },
    customer_uuid: {
      type: String,
      required: true,
    },
    bill_uuid: {
      type: String,
    },
    payment_date: {
      type: Date,
    },
    created_time: {
      type: Date,
    },
    bill: {
      type: Object,
    },
    customer: {
      type: Object,
    },
    check_number:{
      type: String
    },
    credit_note:{
      type: String
    },
    verify:{
      type: Boolean,
      default: false
    },
    adjustable_left_amount: {
      type: Number
    },
    orgId:{
      type: String
    },
    notes: {
      tye: String,
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
