const mongoose = require("mongoose");

const companyPaymentSchema = new mongoose.Schema(
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
    company_uuid: {
      type: String,
      required: true,
    },
    bill_uuid: {
      type: String,
    },
    payment_date: {
      type: Date,
    },
    bill: {
      type: Object,
    },
    company: {
      type: Object,
    },
    check_number:{
      type: String
    },
    credit_note:{
      type: Number
    },
    debit_note:{
      type: Number
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

module.exports = mongoose.model("CompanyPayment", companyPaymentSchema);
