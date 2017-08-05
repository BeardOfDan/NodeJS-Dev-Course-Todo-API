"use strict";

const mongoose = require('mongoose');

// mongoose uses its promise library, instead of the default of callbacks
mongoose.Promise = global.Promise;

const mongooseURI = process.env.MONGODB_URI || "mongodb://localhost:27017/TodoApp";

mongoose.connect(mongooseURI, {
  useMongoClient: true,
});

module.exports = {
  mongoose
};
