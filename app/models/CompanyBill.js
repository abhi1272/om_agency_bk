const mongoose = require('mongoose');

const companyBillSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
    },
    bill_no: {
      type: String,
      require: true,
      unique:true
    },
    bill_amount: {
      type: Number,
      require: true,
    },
    bill_date: {
      type: Date,
      required:true
    },
    trDate: {
      type: Date,
      required:true
    },
    due_date:{
      type: Date
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
    company_uuid: {
      type: String,
    },
    amount_left: {
      type: Number,
    },
    full_paid_status: {
      type: Boolean,
      default: false,
    },
    company: {
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

module.exports = mongoose.model('CompanyBill', companyBillSchema);