const mongoose = require("mongoose");
const CompanySchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    area: {
      type: String,
    },
    email: {
      type: String,
    },
    customer_type: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    dueDays:{
      type:Number
    },
    notes: {
      tye: String,
    },
    orgId: {
      type: String,
    },
    totalBillAmount: {
      type: Number,
      default: 0,
    },
    totalPaymentAmount: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", CompanySchema);
