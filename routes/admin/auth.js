/*
Author: chankruze (chankruze@geekofia.in)
Created: Sat Nov 07 2020 03:20:22 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

// add a secret to server env & host env, shahmac with username & pass and timestamp, send hash & timestamp
// to server. on server encode with server secret + client time stamp + username + pass
// token = hex with username + pass
// x-hunter-signature = hex with token + username + pass

const utils = require("../../utils"),
  router = require("express").Router(),
  Hmacsha256 = require("crypto-js/hmac-sha256");

// check for prod or dev environment
// if dev import dotenv
if (utils.isDevEnv()) {
  require("dotenv").config();
}

router.post("/auth", async (req, res) => {
  const { timestamp } = req.body;
  const signature = req.headers["x-hunter-signature"];

  if (!timestamp) {
    res
      .status(401)
      .json({ status: 0, msg: "You're not authorized, plaes fuck off!" });
  }

  // generate token
  const servToken = Hmacsha256(
    timestamp.toString(),
    process.env.HUNTER_CRED
  ).toString();

  // generate hash
  const servHash = Hmacsha256(
    servToken & timestamp.toString(),
    process.env.HUNTER_CRED
  ).toString();

  // unauthorized user
  if (servHash !== signature) {
    console.log(`[ADMIN] Fake admin restricted`);
    return res
      .status(401)
      .json({ status: 0, msg: "You're not authorized, plaes fuck off!" });
  }

  console.log(`[ADMIN] Admin authenticated`);
  res.json({
    status: 69,
    msg: "You're either hunter or chankruze",
  });
});

module.exports = router;
