/*
Author: chankruze (chankruze@geekofia.in)
Created: Mon Nov 02 2020 19:51:50 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("../utils"),
  crypto = require("crypto"),
  router = require("express").Router();

// check for prod or dev environment
// if dev import dotenv
if (utils.isDevEnv()) {
  require("dotenv").config();
}

// @route   POST /verify
// @desc    verify using razorpay webhook
router.post("/verify", async (req, res) => {
  const checksum = crypto.createHmac("sha256", process.env.RAZORPAY_SHA_SECRET);
  checksum.update(JSON.stringify(req.body));
  const digest = checksum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    // can send email here
  } else {
  }
  res.json({ status: "ok" });
});

module.exports = router;
