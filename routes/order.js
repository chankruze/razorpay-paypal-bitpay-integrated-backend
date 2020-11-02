/*
Author: chankruze (chankruze@geekofia.in)
Created: Mon Nov 02 2020 19:50:24 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("../utils"),
  Razorpay = require("razorpay"),
  router = require("express").Router();

// check for prod or dev environment
// if dev import dotenv
if (utils.isDevEnv()) {
  require("dotenv").config();
}

// @route   POST /order
// @desc    Create an order and returns order_id
router.post("/order", async (req, res) => {
  // extract data form req
  const { amount, currency, receipt, notes } = req.body;

  // create a new Razorpay instance
  const razorpay = new Razorpay({
    // reads from .env(dev) or environmental variable(prod)
    // generated from https://dashboard.razorpay.com/app/keys
    key_id: process.env.RAZORPAY_KEY_ID, // Key Id
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Key Secret
  });

  try {
    // create an order (post /orders)
    await razorpay.orders
      .create({
        amount,
        currency,
        receipt,
        notes,
      })
      .then((response) => res.json(response))
      .catch((err) => res.status(500).send(err));
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
