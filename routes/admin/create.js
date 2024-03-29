/*
Author: chankruze (chankruze@geekofia.in)
Created: Wed Nov 04 2020 23:08:22 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("../../utils"),
  router = require("express").Router(),
  axios = require("axios"),
  Key = require("../../mongo/models/KeySchema"),
  Category = require("../../mongo/models/CategorySchema"),
  Download = require("../../mongo/models/DownloadSchema"),
  Screenshot = require("../../mongo/models/ScreenshotSchema");

// check for prod or dev environment
// if dev import dotenv
if (utils.isDevEnv()) {
  require("dotenv").config();
}

// create new keys
router.post("/create/keys", async (req, res) => {
  const { data, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    await Key.insertMany(data, async (err, doc) => {
      if (err) {
        console.log(`[E] Error inserting documents`);
        console.log(err);
      } else {
        // all ok
      }
    });

    res.json({
      status: "ok",
      msg: "Keys inserted",
    });
  }
});

// create a new category
router.post("/create/category", async (req, res) => {
  const { data, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    const {
      name,
      shortDesc,
      category,
      mrp,
      price,
      currency,
      description,
      image,
      screenshots,
      tag,
    } = data;

    const keysCount = await Key.countDocuments({ type: category });

    await Category.create(
      {
        name,
        shortDesc,
        category,
        mrp,
        price,
        currency,
        description,
        image,
        tag: tag.toLowerCase(),
        screenshots,
        count: keysCount || 0,
      },
      (error, data) => {
        if (error) {
          console.log(error);
          res.json({
            status: "failed",
            msg: "Couldn't add category",
          });
        }
        // console.log(data);
      }
    );

    res.json({
      status: "ok",
      msg: "Category add successfully",
    });
  }
});

// create a new download post
router.post("/create/download", async (req, res) => {
  const { data, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    const { title, sub, description, downloadLink, tags } = data;

    await Download.create(
      {
        title,
        sub,
        description,
        downloadLink,
        tags: tags.map((tag) => tag.toLowerCase()),
      },
      (error, data) => {
        if (error) {
          console.log(error);
          res.json({
            status: "failed",
            msg: "Couldn't add category",
          });
        }
        // console.log(data);
      }
    );

    res.json({
      status: "ok",
      msg: "Category add successfully",
    });
  }
});

// add screenshots
router.post("/create/review", async (req, res) => {
  const { data, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    await Screenshot.insertMany(data, async (err, doc) => {
      if (err) {
        console.log(`[E] Error inserting documents`);
        console.log(err);
      } else {
        // all ok
      }
    });

    res.json({
      status: "ok",
      msg: "Review inserted",
    });
  }
});

module.exports = router;
