/*
Author: chankruze (chankruze@geekofia.in)
Created: Sat Oct 31 2020 01:29:52 GMT+0530 (India Standard Time)

Copyright (c) Geekofia 2020 and beyond
*/

const utils = require("./utils"),
  os = require("os"),
  express = require("express"),
  bodyParser = require("body-parser"),
  helmet = require("helmet"),
  cors = require("cors"),
  connectMongoDB = require("./mongo/db");

// create an express app instance
const app = express();
app.use(helmet());
// CORS
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// parse incoming request bodies
app.use(bodyParser.json());
// connect mongo DB
connectMongoDB();

// Public
// POST
app.use("/", require("./routes/order"));
app.use("/", require("./routes/verify"));
app.use("/", require("./routes/check"));
// GET
app.use("/store", require("./routes/store"));

// Admin Only
// POST
app.use("/admin", require("./routes/admin/auth"));
app.use("/admin", require("./routes/admin/fetch"));
app.use("/admin", require("./routes/admin/create"));
app.use("/admin", require("./routes/admin/update"));
app.use("/admin", require("./routes/admin/delete"));

// Print sevrer IP
const networkInterfaces = os.networkInterfaces();
let SERV_URL = networkInterfaces.eth0[0].address;

app.listen(process.env.PORT, () => {
  console.log(`Server on network: http://${SERV_URL}:${process.env.PORT}`);
  if (utils.isDevEnv()) {
    console.log(`Server on local: http://localhost:${process.env.PORT}`);
  }
});
