/*
Author: chankruze (chankruze@geekofia.in)
Created: Sat Oct 31 2020 03:21:43 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const axios = require("axios");

const utils = require("./utils"),
  sendInBlueMail = require("./sendInBlueMail"),
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
  const { amount, currency, receipt, notes } = req.body;

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

// @route   POST /verify
// @desc    verify using razorpay webhook
router.post("/verify", async (req, res) => {
  const checksum = crypto.createHmac("sha256", process.env.RAZORPAY_SHA_SECRET);
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

// @route   POST /check
// @desc    verify using razorpay webhook
router.post("/check", async (req, res) => {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    const checksum = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    );
    checksum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = checksum.digest("hex");

    if (digest !== razorpaySignature) {
      return res
        .status(400)
        .json({ msg: "Transaction not legit!", isLegit: false });
    }

    // get order details
    const { data: orderData } = await axios
      .get(`${process.env.RAZORPAY_GET_API}/orders/${razorpayOrderId}`)
      .catch((err) => {
        console.error("Error fetching order data");
        console.log(err);
      });

    const { data: paymentData } = await axios
      .get(`${process.env.RAZORPAY_GET_API}/payments/${razorpayPaymentId}`)
      .catch((err) => {
        console.error("Error fetching payment data");
        console.log(err);
      });

    // Prepare data for email
    const purchaseData = {
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      product: orderData.notes,
      email: paymentData.email,
      mobile: paymentData.contact,
      date_time: new Date(paymentData.created_at * 1000).toString(),
      hack_key: "MONTH7C8F99C87FCB4CBFBE13C8962C0305F9",
      receipt: orderData.receipt,
      price: `₹${`${paymentData.amount}`.slice(
        0,
        -2
      )}.${`${paymentData.amount}`.slice(-2)}`,
      method: paymentData.method,
      description: paymentData.description,
    };

    // send key
    if (orderData.status == "paid") {
      sendInBlueMail(purchaseData).then((response) => {
        res.json({
          payment: "success",
          mailed:
            utils.isEmpty(response) || utils.isBlank(response) ? false : true,
          maillId: response,
          purchaseData,
        });
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
