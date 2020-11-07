/*
Author: chankruze (chankruze@geekofia.in)
Created: Wed Nov 04 2020 23:08:41 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("../../utils"),
  router = require("express").Router(),
  axios = require("axios"),
  Key = require("../../mongo/model/KeySchema"),
  Category = require("../../mongo/model/CategorySchema");

router.post("/delete/key", async (req, res) => {
  const { keyId, timestamp } = req.body;

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
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    Key.findByIdAndDelete(keyId, (error) => {
      if (error) {
        res.json({
          status: "failed",
          msg: "Couldn't delete key",
        });
      }
      res.json({
        status: "ok",
        msg: "Key deleted successfully",
      });
    });
  }
});

router.post("/delete/category", async (req, res) => {
  const { categoryId, timestamp } = req.body;

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
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    Category.findByIdAndDelete(categoryId, (error) => {
      if (error) {
        res.json({
          status: "failed",
          msg: "Couldn't delete Category",
        });
      }
      res.json({
        status: "ok",
        msg: "Category deleted successfully",
      });
    });
  }
});

module.exports = router;
