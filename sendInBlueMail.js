/*
Author: chankruze (chankruze@geekofia.in)
Created: Sun Nov 01 2020 15:13:26 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/
const axios = require("axios");

// url = process.env.SEND_IN_BLUE_API_URL
const sendInBlueMail = async (email, params) => {
  const body = {
    to: [
      {
        email,
      },
    ],
    params: params,
    templateId: 1,
  };

  const config = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": process.env.SEND_IN_BLUE_KEY_SIB,
    },
  };

  const { data: sendInBlue } = await axios
    .post(process.env.SEND_IN_BLUE_API_URL, body, config)
    .catch((err) => console.log(err));

  return sendInBlue.messageId;
};

module.exports = sendInBlueMail;
