/*
Author: chankruze (chankruze@geekofia.in)
Created: Sat Oct 31 2020 03:21:43 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("./utils"),
  router = require("express").Router(),
  Razorpay = require("razorpay"),
  crypto = require("crypto");

// check for prod or dev environment
// if dev import dotenv
if (utils.isDevEnv()) {
  require("dotenv").config();
}

/**
 * create a new Razorpay instance
 */

const razorpay = new Razorpay({
  // reads from .env(dev) or environmental variable(prod)
  // generated from https://dashboard.razorpay.com/app/keys
  key_id: process.env.RAZORPAY_KEY_ID, // Key Id
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Key Secret
});

/**
 * define Routes
 */

// @route   POST /order
// @desc    Create an order and returns order_id
router.post("/order", async (req, res) => {
  // extract data form req
  const { amount, currency, receipt } = req.body;

  try {
    // create an order (post /orders)
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    });

    if (!order) return res.status(500).send("Can't create order");

    // send order data
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

// @route   POST /verify
// @desc    verify using razorpay webhook
router.post("/verify", async (req, res) => {
  const checksum = crypto.createHmac("sha256", process.env.SHA_SECRET);
  checksum.update(JSON.stringify(req.body));
  const digest = checksum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    // process it
  } else {
    // pass it
  }
  res.json({ status: "ok" });
});

module.exports = router;
