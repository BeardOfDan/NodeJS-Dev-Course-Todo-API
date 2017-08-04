"use strict";

const mongoose = require('mongoose');

// mongoose uses its promise library, instead of the default of callbacks
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/TodoApp", {
  useMongoClient: true,
});

let Todo = mongoose.model("Todo", {
  text: {
    type: String
  },
  completed: {
    type: Boolean
  },
  completedAt: {
    // Unix time stamp
    type: Number
  }
});

let newTodo = new Todo({
  text: "Cook dinner",
  completed: true,
  completedAt: 1234
});

newTodo.save().then((doc) => {
  console.log("Saved todo", JSON.stringify(doc, undefined, 2));
}, (err) => {
  console.log("Unable to save todo", err);
})
  .then(() => {
    mongoose.disconnect();
});

