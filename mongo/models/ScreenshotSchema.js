/*
Author: chankruze (chankruze@geekofia.in)
Created: Sat Dec 26 2020 16:21:25 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const mongoose = require("mongoose");

const screenshotSchema = new mongoose.Schema({
  url: { type: String, trim: true },
  dateAdded: {
    type: String,
    default: new Date().toISOString(),
    trim: true,
  },
});

module.exports = mongoose.model("Screenshot", screenshotSchema);
