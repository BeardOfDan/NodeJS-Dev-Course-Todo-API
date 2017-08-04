"use strict";

const mongoose = require('mongoose');

// mongoose uses its promise library, instead of the default of callbacks
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/TodoApp", {
  useMongoClient: true,
});

let Todo = mongoose.model("Todo", {
  text: {
    type: String,
    required: true,
    minlength: 5,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    // Unix time stamp
    type: Number,
    default: null
  }
});

// let newTodo = new Todo({
//   text: "Do some thing"
// });
//
// newTodo.save().then((doc) => {
//   console.log("Saved todo", JSON.stringify(doc, undefined, 2));
// }, (err) => {
//   console.log("Unable to save todo", err);
// })
//   .then(() => {
//     mongoose.disconnect();
// });

// User model
// email - required - trim - type string - min length 5

// create a new user with + without an email to test requirements
// chekc the database to see it

let User = mongoose.model("User", {
  email : {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  }
});

let user = new User({
  email: "a@s.d"
});

user.save().then((doc) => {
  console.log("Saved the new user:\n", doc);
}, (err) => {
  console.log("Error, was unable to save new user:\n", err);
}).then(() => {
  mongoose.disconnect();
});

