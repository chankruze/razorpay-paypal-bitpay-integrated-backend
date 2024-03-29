/*
Author: chankruze (chankruze@geekofia.in)
Created: Mon Nov 09 2020 12:35:06 GMT+0530 (India Standard Time)

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

const downloadSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    sub: {
      type: String,
      trim: true,
      default: "Required for hack",
    },
    // images: { type: Array, default: [] },
    description: { type: String, default: "" },
    // extLinks: { type: Array, default: [] },
    // ytLinks: { type: Array, default: [] },
    downloadLink: { type: String, default: "#", trim: true },
    date: { type: String, default: new Date().toISOString(), trim: true },
    tags: { type: Array, default: ["new"] },
  }
  // opts
);

module.exports = mongoose.model("Download", downloadSchema);
