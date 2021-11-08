const mongoose = require('mongoose');

const billSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
    },
    bill_no: {
      type: String,
      require: true,
      unique:true
    },
    basic_amount: {
      type: String,
    },
    bill_amount: {
      type: Number,
      require: true,
    },
    type: {
      type: String,
    },
    bill_date: {
      type: Date,
      required:true
    },
    firm_name: {
      type: String,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    notes: {
      tye: String,
    },
    customer_uuid: {
      type: String,
    },
    amount_left: {
      type: Number,
    },
    full_paid_status: {
      type: Boolean,
      default: false,
    },
    customer: {
      type: Object,
    },
    orgId: {
      type: String,
    },
    image: {
      type: String,
    },
    payments: [],
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Bill', billSchema);