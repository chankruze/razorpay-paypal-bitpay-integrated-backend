/*
Author: chankruze (chankruze@geekofia.in)
Created: Fri Dec 11 2020 13:04:42 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("../utils"),
  router = require("express").Router(),
  axios = require("axios"),
  sendInBlueMail = require("../sendInBlueMail"),
  Invoice = require("../mongo/models/InvoiceSchema"),
  Key = require("../mongo/models/KeySchema");

// check for prod or dev environment
// if dev import dotenv
if (utils.isDevEnv()) {
  require("dotenv").config();
}

// create an invoice
router.post("/create", async (req, res) => {
  // extract data form req
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.sendStatus(200);
    return;
  }

  console.log(`[${new Date().toLocaleTimeString()}] [I] creating invoice`);
  const {
    price,
    currency,
    receipt,
    buyer: { email },
    product,
  } = req.body;

  const invoice_data = {
    currency,
    price,
    orderId: receipt,
    fullNotifications: true,
    extendedNotifications: true,
    transactionSpeed: "medium",
    notificationURL: utils.isDevEnv()
      ? `${process.env.NGROK_SSL_URL}/bitpay/verify`
      : `${process.env.AUTH_URL_BASE}/bitpay/verify`,
    notificationEmail: process.env.ADMIN_EMAIL,
    redirectURL: "https://hunter.org.in/store",
    token: process.env.BITPAY_API_TOKEN,
    posData: JSON.stringify(product),
    buyer: {
      notify: true,
      email,
    },
  };

  const config = {
    headers: {
      "x-accept-version": "2.0.0",
      "Content-type": "application/json",
    },
  };

  const {
    data: { data },
  } = await axios.post(process.env.BITPAY_INVOICE_API, invoice_data, config);

  res.status(200).send({ invoiceUrl: data.url });
});

// webhook to listen bitpay callback
router.post("/verify", async (req, res) => {
  try {
    const {
      event: { code: eventCode, name: eventName },
      data: {
        id: invoiceId,
        url: invoiceUrl,
        status,
        price,
        currency,
        invoiceTime,
        expirationTime,
        currentTime: callbackTime,
        buyerFields: { buyerEmail },
        amountPaid,
        orderId,
      },
    } = req.body;

    switch (eventCode) {
      // 1003 - invoice_paidInFull
      case 1003:
        console.log(
          `[${new Date().toLocaleTimeString()}] [I] received full payment for ${invoiceId}`
        );
        const {
          data: { posData, transactionCurrency },
        } = req.body;
        // create and store a new invoice
        Invoice.create(
          {
            orderId,
            invoiceId,
            invoiceUrl,
            status: eventCode,
            posData,
            method: "bitpay",
            invoiceTime: new Date(invoiceTime).toISOString(),
            expirationTime: new Date(expirationTime).toISOString(),
            buyerFields: { buyerEmail },
            amountPaid,
            transactionCurrency,
          },
          (error, data) => {
            if (error) {
              console.log(error);
              return;
            }
            console.log(`created invoice ${invoiceId}`);
            console.log(data);
            return;
          }
        );
        break;

      // 1004 - invoice_expired
      case 1004:
        console.log(
          `[${new Date().toLocaleTimeString()}] [I] invoice ${invoiceId} expired`
        );
      // 1013 - invoice_failedToConfirm
      case 1013:
        console.log(
          `[${new Date().toLocaleTimeString()}] [I] invoice ${invoiceId} failed to confirm`
        );
        // find, check & delete invoice status
        Invoice.deleteOne({ invoiceId, orderId, status: 1003 }, (err, doc) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log(`deleted invoice ${invoiceId}`);
          return;
        });
        break;

      // 1005 - invoice_confirmed
      case 1005:
        console.log(
          `[${new Date().toLocaleTimeString()}] [I] invoice ${invoiceId} confirmed`
        );
      // 1006 - invoice_completed
      case 1006:
        let isAlreadyConfirmed = false;
        console.log(
          `[${new Date().toLocaleTimeString()}] [I] invoice ${invoiceId} completed`
        );
        // find, check & update invoice status
        await Invoice.findOne(
          { invoiceId, orderId, status: 1003 },
          (err, doc) => {
            if (err) {
              console.log(err);
              return;
            } else {
              if (doc !== null) {
                doc.callbackTime = new Date(callbackTime).toISOString();
                doc.status = eventCode;
                doc.save();
                console.log(`updated invoice ${invoiceId} status`);
                return;
              }
              console.log(`already confirmed invoice ${invoiceId}`);
              isAlreadyConfirmed = true;
              return;
            }
          }
        );

        if (!isAlreadyConfirmed) {
          // send email with key to customer
          const {
            data: { posData: product, transactionCurrency: paymentCurrency },
          } = req.body;

          const {
            name,
            price: productPrice,
            category,
            quantity,
            keysMultiplier,
          } = JSON.parse(product);

          // store keys only for delivery purpose
          const hack_keys = [];
          const keysCount = quantity * keysMultiplier;

          // grab key(s) from db
          // get key and update key count in category
          if (keysCount > 1) {
            await Key.find(
              { type: category, isSold: false, isActivated: false },
              (err, data) => {
                if (err) {
                  console.log(`[E] Error finding keys`);
                  console.log(err);
                  return;
                } else {
                  for (let i = 0; i < keysCount; ++i) {
                    const doc = data[i];
                    hack_keys.push(doc.key);
                    doc.isActivated = true;
                    doc.isSold = true;
                    doc.dateSold = new Date().toISOString();
                    doc.save();
                  }
                  return;
                }
              }
            );
          } else {
            await Key.findOne(
              { type: category, isSold: false, isActivated: false },
              (err, doc) => {
                if (err) {
                  console.log(`[E] Error finding keys`);
                  console.log(err);
                  return;
                } else {
                  hack_keys.push(doc.key);
                  doc.isActivated = true;
                  doc.isSold = true;
                  doc.dateSold = new Date().toISOString();
                  doc.save();
                  return;
                }
              }
            );
          }

          // Prepare data for email
          const purchaseData = {
            products: hack_keys,
            orderId, // ok
            invoiceId, // ok
            invoiceUrl,
            receipt: orderId, // ok
            method: "bitpay", // ok
            name, // ok
            price: `${productPrice} ${currency}`, // ok
            quantity, // ok
            keysCount, // ok
            keyType: category, // ok
            total: `${amountPaid} ${paymentCurrency} (with mining charge)`,
            email: buyerEmail,
            date: new Date(callbackTime).toLocaleString(),
          };

          // send key
          sendInBlueMail(purchaseData).then(async (response) => {
            if (response == "success") {
              // find, check & update invoice status
              Invoice.findOne(
                { invoiceId, orderId, status: eventCode },
                (err, doc) => {
                  if (err) {
                    console.log(err);
                    return;
                  } else {
                    console.log(hack_keys);
                    console.log(`adding sold keys to ${invoiceId}`);
                    doc.keys = hack_keys;
                    doc.save();
                    return;
                  }
                }
              );
            }
          });
        }
        break;
    }
  } catch (error) {
    console.log(error);
  } finally {
    res.status(200).send();
  }
});

module.exports = router;
