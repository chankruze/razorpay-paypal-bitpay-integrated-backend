/*
Author: chankruze (chankruze@geekofia.in)
Created: Thu Nov 05 2020 01:27:03 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const router = require("express").Router(),
  Key = require("../../mongo/model/KeySchema"),
  Category = require("../../mongo/model/CategorySchema");

router.get("/list/keys", async (req, res) => {
  await Key.find({}, (err, data) => {
    res.json(data);
  });
});

router.get("/list/categories", async (req, res) => {
  await Category.find({}, (err, data) => {
    res.json(data);
  });
});

module.exports = router;
