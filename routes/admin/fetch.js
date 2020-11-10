/*
Author: chankruze (chankruze@geekofia.in)
Created: Thu Nov 05 2020 01:27:03 GMT+0530 (India Standard Time)

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

router.post("/fetch/keys", async (req, res) => {
  const { timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    await Key.find({}, (error, data) => {
      if (error) {
        res.json({
          status: "failed",
          msg: "Couldn't fetch keys",
        });
      }
      res.json(data);
    });
  }
});

router.post("/fetch/categories", async (req, res) => {
  const { timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    await Category.find({}, (error, data) => {
      if (error) {
        res.json({
          status: "failed",
          msg: "Couldn't fetch categories",
        });
      }
      res.json(data);
    });
  }
});

router.post("/fetch/downloads", async (req, res) => {
  const { timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    await Download.find({}, (error, data) => {
      if (error) {
        res.json({
          status: "failed",
          msg: "Couldn't fetch categories",
        });
      }
      res.json(data);
    });
  }
});

module.exports = router;
