require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const WS = require("./websocket");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

require("./app/controllers")(app);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server listening on port: ${process.env.PORT}`);
});

WS(server);