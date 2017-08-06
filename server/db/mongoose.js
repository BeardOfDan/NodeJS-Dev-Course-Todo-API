"use strict";

const mongoose = require('mongoose');

// mongoose uses its promise library, instead of the default of callbacks
mongoose.Promise = global.Promise;

              // process.env.MONGODB_URI gets a default value in config.js
mongoose.connect(process.env.MONGODB_URI, {
  useMongoClient: true,
});

module.exports = {
  mongoose
};
