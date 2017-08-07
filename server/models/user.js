"use strict";

const bcrypt = require("bcryptjs");
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');

let UserSchema = new mongoose.Schema({
  email : {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: `{VALUE} is not a valid email`
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function() {
  let user = this;

  let userObject = user.toObject();

  return _.pick(userObject, ["_id", "email"]);
};

UserSchema.methods.generateAuthToken = function () {
  let user = this;

  let access = "auth";
  let token = jwt.sign({_id: user._id.toString(), access}, "abc123").toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.findByToken = function (token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, "abc123");
  } catch (err) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

UserSchema.pre("save", function (next) {
  let user = this;

  // if the password is still plain text
  if(user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) {
          // return console.log("There was an error!");
        }
        user.password = hash;
        next();
      });
    });
  } else { // the password is already hashed
    next();
  }
});

let User = mongoose.model("User", UserSchema);

module.exports = {
  User
};
