/*
Author: chankruze (chankruze@geekofia.in)
Created: Wed Nov 04 2020 23:08:31 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const { countDocuments } = require("../../mongo/model/KeySchema");

// add a secret to server env & host env, shahmac with username & pass and timestamp, send hash & timestamp
// to server. on server encode with server secret + client time stamp + username + pass
// token = hex with username + pass
// x-hunter-signature = hex with token + username + pass

const utils = require("../../utils"),
  router = require("express").Router(),
  axios = require("axios"),
  Key = require("../../mongo/model/KeySchema"),
  Category = require("../../mongo/model/CategorySchema");

router.post("/update/key", async (req, res) => {
  const { keydata, timestamp } = req.body;

  const config = {
    proxy: utils.isDevEnv
      ? {
          host: "localhost",
          port: 6969,
          protocol: "http",
        }
      : false,
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post("/admin/auth", { timestamp }, config)
    .catch((err) => res.status(403).json(err));

  if (auth.status === 69) {
    await Key.findById(keydata.id, (err, data) => {
      if (err) {
        console.log(`[E] Error finding documents`);
        console.log(err);
      } else {
        const { key, type, duration, isActivated, isSold } = keydata;
        data.key = key;
        data.type = type;
        data.duration = duration;
        data.isActivated = isActivated;
        data.isSold = isSold;
        data.dateSold = new Date().toISOString();
        data.save();
      }
    });

    res.json({
      status: "ok",
      msg: "Key updated",
    });
  }
});

router.post("/update/category", async (req, res) => {
  const { categorydata, timestamp } = req.body;

  const config = {
    proxy: utils.isDevEnv
      ? {
          host: "localhost",
          port: 6969,
          protocol: "http",
        }
      : false,
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post("/admin/auth", { timestamp }, config)
    .catch((err) => res.status(403).json(err));

  if (auth.status === 69) {
    // count total keys of same category
    let keysCount = 0;
    await Key.countDocuments(
      { type: categorydata.category },
      (error, count) => (keysCount = count)
    );

    await Category.findById(categorydata.id, (err, data) => {
      if (err) {
        console.log(`[E] Error finding documents`);
        console.log(err);
      } else {
        const {
          name,
          category,
          mrp,
          price,
          currency,
          description,
          image,
          tag,
        } = categorydata;

        // update category data
        data.name = name;
        data.category = category;
        data.mrp = mrp;
        data.price = price;
        data.currency = currency;
        data.description = description;
        data.image = image;
        data.tag = tag;
        data.count = keysCount;
        data.dateUpdated = new Date().toISOString();
        data.save();
      }
    });

    res.json({
      status: "ok",
      msg: "Category updated",
    });
  }
});

module.exports = router;
