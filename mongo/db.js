/*
Author: chankruze (chankruze@geekofia.in)
Created: Mon Nov 02 2020 19:40:56 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("../utils"),
  mongoose = require("mongoose");

// check for prod or dev environment
// if dev import dotenv
if (utils.isDevEnv()) {
  require("dotenv").config();
}

const connectMongoDB = async () => {
  const MONGO_ATLAS_URI = `mongodb+srv://${process.env.MONGO_DB_ATLAS_USER}:${process.env.MONGO_DB_ATLAS_PASS}@cluster0.041rz.mongodb.net/${process.env.MONGO_DB_ATLAS_NAME}?retryWrites=true&w=majority`;

  try {
    mongoose.Promise = global.Promise;

    await mongoose.connect(MONGO_ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`[I] MongoDB connected`);
  } catch (err) {
    console.log(err);
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectMongoDB;
