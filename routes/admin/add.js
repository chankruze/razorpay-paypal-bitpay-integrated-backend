/*
Author: chankruze (chankruze@geekofia.in)
Created: Wed Nov 04 2020 23:08:22 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const router = require("express").Router(),
  Category = require("../mongo/model/categorySchema");

router.post("/keys/add", async (req, res) => {
  await Category.find({}, (err, data) => {
    res.json(data);
  });
});

router.post("/categories/add", async (req, res) => {
  await Category.find({}, (err, data) => {
    res.json(data);
  });
});

module.exports = router;
