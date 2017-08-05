"use strict";

const mongoose = require('mongoose');

// mongoose uses its promise library, instead of the default of callbacks
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/TodoApp", {
  useMongoClient: true,
});

module.exports = {
  mongoose
};
