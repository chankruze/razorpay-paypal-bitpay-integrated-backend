/*
Author: chankruze (chankruze@geekofia.in)
Created: Sun Nov 15 2020 17:15:48 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const router = require("express").Router(),
  axios = require("axios"),
  qs = require("qs"),
  sendInBlueMail = require("../sendInBlueMail"),
  Key = require("../mongo/models/KeySchema");

// generate bearer token
const getBearerToken = async () => {
  // data
  const query = qs.stringify({
    grant_type: "client_credentials",
  });
  // config
  const config = {
    headers: {
      Authorization: `Basic ${process.env.PAYPAL_BASIC_AUTH}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  // get token in response
  const { data } = await axios
    .post(process.env.PAYPAL_OAUTH_URL, query, config)
    .catch(function (error) {
      console.log(error);
    });

  // console.log(data);

  if (data) return data.access_token;
  return null;
};

router.post("/success", async (req, res) => {
  console.log(req.body.resource);
  const orderUrl = req.body.resource.links.filter(
    (d) => d.rel === "up" && d.href.includes("/v2/checkout/orders/")
  )[0].href;

  const accessToken = await getBearerToken();

  console.log(accessToken);

  if (accessToken !== null) {
    const config = {
      method: "get",
      url: orderUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const { data: order } = await axios(config).catch((error) => {
      console.log(error);
    });

    if (order.status === "COMPLETED") {
      console.log(order);
      const unit = order.purchase_units[0];
      const item = unit.items[0];
      const payer = order.payer;
      const paymentData = unit.payments.captures.filter(
        (d) => d.status === "COMPLETED" && d.final_capture === true
      )[0];

      const receipt = unit.invoice_id;
      const orderId = order.id;
      const paymentId = paymentData.id;
      const name = unit.description;
      const price = item.unit_amount.value;
      const quantity = parseInt(item.quantity);
      const keysMultiplier = parseInt(item.description.split(" ")[0]);
      const keyType = item.description.split(" ")[1].toLowerCase().toString();
      const keysCount = quantity * keysMultiplier;
      const total = unit.amount.value;
      const buyer = `${payer.name.given_name} ${payer.name.surname}`;
      const dateTime = order.update_time;

      // receipt: unit.invoice_id
      // total_price: unit.amount.value
      // currency: unit.amount.currency_code
      // description: unit.description
      // items: unit.items
      // price: item.unit_amount.value
      // keysCount: items[0].quantity * description.split(" ")[0]
      // payer_name: `${payer.name.given_name} ${payer.name.surname}`
      // payer_email: payer.email_address
      // payer_id: payer_id
      // payment_id: paymentData.id

      // store keys only for delivery purpose
      const hack_keys = [];

      // get key and update key count in category
      if (keysCount > 1) {
        await Key.find(
          { type: keyType, isSold: false, isActivated: false },
          (err, data) => {
            if (err) {
              console.log(`[E] Error finding documents`);
              console.log(err);
            } else {
              for (let i = 0; i < keysCount; ++i) {
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
          { type: keyType, isSold: false, isActivated: false },
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

      // Prepare data for email
      const purchaseData = {
        products: hack_keys,
        orderId, // ok
        paymentId, // ok
        receipt, // ok
        method: "PayPal", // ok
        name, // ok
        price: `${price} ${unit.amount.currency_code}`, // ok
        quantity, // ok
        keysCount, // ok
        keyType, // ok
        total: `${total} ${unit.amount.currency_code}`,
        buyer,
        email: payer.email_address,
        date: new Date(dateTime).toLocaleString(),
      };

      sendInBlueMail(purchaseData)
        .then((response) => {
          if (response === "success") {
            res.json({
              status: "ok",
              payment: "success",
              keyDelivery: "success",
              purchaseData,
            });
          } else {
            res.json({
              status: "ok",
              payment: "success",
              keyDelivery: "failed",
              purchaseData,
            });
          }
        })
        .catch((err) => {
          res.status(500).json({
            status: "ok",
            payment: "success",
            keyDelivery: "failed",
            purchaseData,
          });
          console.log(err);
        });
    }
  }
});

module.exports = router;
