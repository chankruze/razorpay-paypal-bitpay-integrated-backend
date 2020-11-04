/*
Author: chankruze (chankruze@geekofia.in)
Created: Mon Nov 02 2020 19:23:02 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const mongoose = require("mongoose");

const keySchema = new mongoose.Schema({
  key: String,
  type: String,
  duration: Number,
  isSold: Boolean,
  isActivated: Boolean,
  dateCreated: { type: String, default: Date.now },
  dateSold: { type: String, default: "TBD" },
});

module.exports = mongoose.model("Key", keySchema);