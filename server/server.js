"use strict";

const {mongoose} = require('./db/mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const {Todo} = require('./models/todo');
const {User} = require('./models/user');

let app = express();

app.use(bodyParser.json());

app.post("/todos", (req, res, next) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get("/todos", (req, res, next) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (err) => {
    res.status(400).send(err);
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});


module.exports = {
  app
};
