/*
Author: chankruze (chankruze@geekofia.in)
Created: Sun Nov 01 2020 15:13:26 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/
const axios = require("axios");

// url = process.env.SEND_IN_BLUE_API_URL
const sendInBlueMail = async (params) => {
  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": process.env.SEND_IN_BLUE_KEY_SIB,
    },
  };

  // send this to customer
  const clientBody = {
    to: [
      {
        email: params.email,
      },
    ],
    params,
    templateId: 1,
  };

  // send this to staff
  const adminBody = {
    to: [
      {
        email: process.env.ADMIN_EMAIL,
      },
    ],
    params,
    templateId: 1,
  };

  await axios
    .post(process.env.SEND_IN_BLUE_API_URL, clientBody, config)
    .catch((err) => console.log(err));

  await axios
    .post(process.env.SEND_IN_BLUE_API_URL, adminBody, config)
    .catch((err) => console.log(err));
};

module.exports = sendInBlueMail;
