/*
Author: chankruze (chankruze@geekofia.in)
Created: Wed Nov 04 2020 20:12:55 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const mongoose = require("mongoose");

const keySchema = new mongoose.Schema({
  name: String,
  category: String,
  mrp: Number,
  price: Number,
  currency: { type: String, default: "INR" },
  description: { type: String, default: "" },
  image: {
    type: String,
    default:
      "https://res.cloudinary.com/chankruze/image/upload/v1604513114/Hunter/sx.png",
  },
  tag: { type: String, default: "" },
  count: { type: Number, default: 0 },
  dateUpdated: { type: String, default: new Date().toISOString() },
});

module.exports = mongoose.model("Category", keySchema);
