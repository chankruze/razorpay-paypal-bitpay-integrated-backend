/*
Author: chankruze (chankruze@geekofia.in)
Created: Wed Nov 04 2020 20:12:55 GMT+0530 (India Standard Time)

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
//   timestamps: true,
// };

const keySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    category: String,
    keysMultiplier: { type: Number, default: 1 },
    mrp: Number,
    price: Number,
    currency: { type: String, default: "INR" },
    shortDesc: {
      type: String,
      default:
        "SX VIP is our own cheat tool for gameloop it has an inbuilt Bypass, So with SX VIP you will be matched against mobile players. For more info click read more.",
      trim: true,
    },
    description: { type: String, default: "" },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/chankruze/image/upload/v1604513114/Hunter/sx.png",
    },
    tag: { type: String, default: "", trim: true },
    screenshots: { type: Array, default: [] },
    count: { type: Number, default: 0 },
    dateUpdated: { type: String, default: new Date().toISOString() },
  }
  // opts
);

module.exports = mongoose.model("Category", keySchema);
