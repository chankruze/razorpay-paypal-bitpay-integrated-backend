/*
Author: chankruze (chankruze@geekofia.in)
Created: Sat Oct 31 2020 01:33:47 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const isDevEnv = () => {
  return process.env.NODE_ENV !== "production";
};

const isEmpty = (str) => {
  return !str || 0 === str.length;
};

const isBlank = (str) => {
  return !str || /^\s*$/.test(str);
};

module.exports = Object.freeze({
  isDevEnv,
  isEmpty,
  isBlank,
});
