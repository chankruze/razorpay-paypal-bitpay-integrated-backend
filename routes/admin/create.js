/*
Author: chankruze (chankruze@geekofia.in)
Created: Wed Nov 04 2020 23:08:22 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("../../utils"),
  router = require("express").Router(),
  axios = require("axios"),
  Key = require("../../mongo/model/KeySchema"),
  Category = require("../../mongo/model/CategorySchema");

// check for prod or dev environment
// if dev import dotenv
if (utils.isDevEnv()) {
  require("dotenv").config();
}

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
        console.log(`[E] Error finding documents`);
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

router.post("/create/categories", async (req, res) => {
  const { categorydata, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
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

    // count total keys of same category
    let keysCount = 0;
    await Key.countDocuments({ type: category }, (error, count) => {
      if (count) {
        keysCount = count;
      }

      if (error) {
        console.log(error);
      }
    });

    await Category.create(
      {
        name,
        category,
        mrp,
        price,
        currency,
        description,
        image,
        tag,
        count: keysCount,
      },
      (error, data) => {
        if (error) {
          console.log(error);
          res.json({
            status: "failed",
            msg: "Couldn't add category",
          });
        }
        console.log(data);
        res.json({
          status: "ok",
          msg: "Category add successfully",
        });
      }
    );
  }
});

module.exports = router;
