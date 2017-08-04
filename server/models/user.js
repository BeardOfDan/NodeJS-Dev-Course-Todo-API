"use strict";

const mongoose = require('mongoose');

let User = mongoose.model("User", {
  email : {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  }
});

module.exports = {
  User
};
