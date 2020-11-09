/*
Author: chankruze (chankruze@geekofia.in)
Created: Mon Nov 02 2020 19:23:02 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const mongoose = require("mongoose");

// const opts = {
//   toJSON: {
//     virtuals: true,
//   },
//   toObject: {
//     virtuals: true,
//   },
//   timestamps: false,
// };

const keySchema = new mongoose.Schema(
  {
    key: { type: String, trim: true },
    type: { type: String, trim: true },
    isSold: { type: Boolean, default: false },
    isActivated: { type: Boolean, default: false },
    dateCreated: { type: String, default: new Date().toISOString() },
    dateSold: { type: String, default: "" },
  },
  // opts
);

module.exports = mongoose.model("Key", keySchema);
