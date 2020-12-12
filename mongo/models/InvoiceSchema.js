/*
Author: chankruze (chankruze@geekofia.in)
Created: Fri Dec 11 2020 18:15:57 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  orderId: { type: String, trim: true },
  invoiceId: { type: String, trim: true },
  invoiceUrl: { type: String, trim: true },
  posData: { type: String, trim: true },
  method: { type: String, trim: true },
  invoiceTime: { type: String, trim: true },
  expirationTime: { type: String, trim: true },
  callbackTime: { type: String, trim: true, default: "" },
  status: { type: Number, trim: true },
  buyerFields: { buyerEmail: { type: String, trim: true } },
  amountPaid: { type: String, trim: true },
  transactionCurrency: { type: String, trim: true },
  keys: { type: Array, default: null },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
