/*
Author: chankruze (chankruze@geekofia.in)
Created: Mon Nov 02 2020 19:47:08 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("../utils"),
  router = require("express").Router(),
  crypto = require("crypto"),
  axios = require("axios"),
  sendInBlueMail = require("../sendInBlueMail"),
  Key = require("../mongo/model/KeySchema");

// check for prod or dev environment
// if dev import dotenv
if (utils.isDevEnv()) {
  require("dotenv").config();
}

// @route   POST /check
// @desc    verify using razorpay webhook
router.post("/check", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

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

    // payment not legit
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

    const {
      product_name,
      product_duration,
      product_mrp,
      product_price,
      product_discount,
      product_type,
      product_quantity,
      total_price,
      total_discount,
    } = orderData.notes;

    // store keys only for delivery purpose
    const hack_keys = [];

    // get key and update key count in category
    if (product_quantity > 1) {
      await Key.find(
        { type: product_type, isSold: false, isActivated: false },
        (err, data) => {
          if (err) {
            console.log(`[E] Error finding documents`);
            console.log(err);
          } else {
            for (let i = 0; i < product_quantity; ++i) {
              const doc = data[i];
              hack_keys.push(doc.key);
              doc.isActivated = true;
              doc.isSold = true;
              doc.dateSold = new Date().toISOString();
              doc.save();
            }
          }
        }
      );
    } else {
      await Key.findOne(
        { type: product_type, isSold: false, isActivated: false },
        (err, doc) => {
          if (err) {
            console.log(`[E] Error finding documents`);
            console.log(err);
          } else {
            console.log(doc);
            hack_keys.push(doc.key);
            doc.isActivated = true;
            doc.isSold = true;
            doc.dateSold = new Date().toISOString();
            doc.save();
          }
        }
      );
    }

    // if (hack_keys.length === 0) {
    //   res.staus(500).json({
    //     error: "Mongoose hanging",
    //   });
    // }

    // Prepare data for email
    const purchaseData = {
      duration: product_duration,
      products: hack_keys,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      name: product_name,
      mrp: `₹${product_mrp}`,
      discount: `₹${product_discount}`,
      price: `₹${product_price}`,
      quantity: product_quantity,
      total: `₹${`${paymentData.amount}`.slice(
        0,
        -2
      )}.${`${paymentData.amount}`.slice(-2)}`,
      totalDiscount: `₹${total_discount}`,
      email: paymentData.email,
      mobile: paymentData.contact,
      receipt: orderData.receipt,
      method: paymentData.method,
      date: new Date(paymentData.created_at * 1000).toLocaleString(),
    };

    // send key
    if (orderData.status == "paid") {
      sendInBlueMail(purchaseData).then((response) => {
        if (response == "success") {
          res.json({
            payment: "success",
            maillId: response,
            purchaseData,
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
