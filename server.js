/*
Author: chankruze (chankruze@geekofia.in)
Created: Sat Oct 31 2020 01:29:52 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("./utils"),
  os = require("os"),
  path = require("path"),
  express = require("express"),
  bodyParser = require("body-parser");

// create an express app instance
const app = express();
// parse incoming request bodies
app.use(bodyParser.json());

app.use("/", require("./routes"));

// Print sevrer IP
const networkInterfaces = os.networkInterfaces();
let SERV_URL = networkInterfaces.eth0[0].address;

app.listen(process.env.PORT, () => {
  console.log(`Server on network: http://${SERV_URL}:${process.env.PORT}`);
  if (utils.isDevEnv()) {
    console.log(`Server on local: http://localhost:${process.env.PORT}`);
  }
});
