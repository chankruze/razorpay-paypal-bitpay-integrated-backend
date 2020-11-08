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

// check for prod or dev environment
// if dev import dotenv
if (utils.isDevEnv()) {
  require("dotenv").config();
}

router.post("/delete/key", async (req, res) => {
  const { id, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    Key.findByIdAndDelete(id, (error) => {
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

// bulk delete
router.post("/delete/keys", async (req, res) => {
  const { ids, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    await Key.deleteMany(
      {
        _id: {
          $in: ids,
        },
      },
      (error, response) => {
        if (error) {
          res.json({
            status: "failed",
            msg: "Couldn't delete keys",
          });
        }
        const { ok, n } = response;
        if (ok === 1) {
          res.json({
            status: "ok",
            count: n,
            msg: "Keys deleted successfully",
          });
        }
      }
    );
  }
});

router.post("/delete/category", async (req, res) => {
  const { id, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    Category.findByIdAndDelete(id, (error) => {
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

// bulk delete
router.post("/delete/categories", async (req, res) => {
  const { ids, timestamp } = req.body;

  const config = {
    headers: { "x-hunter-signature": req.headers["x-hunter-signature"] },
  };

  const { data: auth } = await axios
    .post(`${process.env.AUTH_URL_BASE}/admin/auth`, { timestamp }, config)
    .catch((error) => res.status(403).json(error));

  if (auth.status === 69) {
    Category.deleteMany(
      {
        _id: {
          $in: ids,
        },
      },
      (error, response) => {
        if (error) {
          res.json({
            status: "failed",
            msg: "Couldn't delete Categories",
          });
        }
        const { ok, n } = response;
        if (ok === 1) {
          res.json({
            status: "ok",
            count: n,
            msg: "Keys deleted successfully",
          });
        }
      }
    );
  }
});

module.exports = router;
