const mongoose = require("mongoose");

mongoose.connect(`${process.env._DB_URL_MONGO}`);
mongoose.Promise = global.Promise;

module.exports = mongoose;