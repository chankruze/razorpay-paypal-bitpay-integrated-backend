/*
Author: chankruze (chankruze@geekofia.in)
Created: Wed Nov 04 2020 23:08:31 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("../../utils"),
  router = require("express").Router(),
  axios = require("axios"),
  Key = require("../../mongo/models/KeySchema"),
  Category = require("../../mongo/models/CategorySchema"),
  Download = require("../../mongo/models/DownloadSchema");

// check for prod or dev environment
// if dev import dotenv
if (utils.isDevEnv()) {
  require("dotenv").config();
}

router.post("/update/key", async (req, res) => {
  const { data, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((err) => res.status(403).json(err));

  if (auth.status === 69) {
    await Key.findById(data.id, async (err, doc) => {
      if (err) {
        console.log(`[E] Error finding documents`);
        console.log(err);
      } else {
        const { key, type, duration, isActivated, isSold } = data;
        doc.key = key;
        doc.type = type;
        doc.duration = duration;
        doc.isActivated = isActivated;
        doc.isSold = isSold;
        await doc.save();
      }
    });

    res.json({
      status: "ok",
      msg: "Key updated",
    });
  }
});

router.post("/update/category", async (req, res) => {
  const { data, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((err) => res.status(403).json(err));

  if (auth.status === 69) {
    // count total keys of same category
    let keysCount = 0;
    await Key.countDocuments({ type: data.category }, (error, count) => {
      if (error) {
        console.log(error);
      }

      if (count) {
        keysCount = count;
      }
    });

    await Category.findById(data.id, async (err, doc) => {
      if (err) {
        console.log(`[E] Error finding documents`);
        console.log(err);
      } else {
        const {
          name,
          category,
          keysMultiplier,
          mrp,
          price,
          currency,
          description,
          image,
          tag,
        } = data;

        // update category data
        doc.name = name;
        doc.category = category;
        doc.keysMultiplier = keysMultiplier;
        doc.mrp = mrp;
        doc.price = price;
        doc.currency = currency;
        doc.description = description;
        doc.image = image;
        doc.tag = tag;
        doc.count = keysCount;
        doc.dateUpdated = new Date().toISOString();
        await doc.save();
      }
    });

    res.json({
      status: "ok",
      msg: "Category updated",
    });
  }
});

// update download post
router.post("/update/download", async (req, res) => {
  const { data, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((err) => res.status(403).json(err));

  if (auth.status === 69) {
    await Download.findById(data.id, async (err, doc) => {
      if (err) {
        console.log(`[E] Error finding documents`);
        console.log(err);
      } else {
        const { title, sub, image, description, link, tags } = data;
        doc.title = title;
        doc.sub = sub;
        doc.image = image;
        doc.description = description;
        doc.link = link;
        doc.tags = tags;
        await doc.save();
      }
      console.log(doc);
    });

    res.json({
      status: "ok",
      msg: "Key updated",
    });
  }
});

module.exports = router;
