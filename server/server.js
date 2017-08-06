"use strict";

require("./config/config");

const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

let app = express();

// default value for process.env.PORT is given in config.js
const PORT = process.env.PORT;

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

app.get("/todos/:id", (req, res, next) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Todo.findById(id).then((todo) => {
    if (todo) {
      return res.send({todo});
    }

    res.status(404).send();
  }).catch((err) => {
    res.status(400).send();
  });
});

app.delete("/todos/:id", (req, res, next) => {
  let id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.status(200).send({todo});
  }).catch((err) => {
    res.status(400).send();
  });
});

app.patch("/todos/:id", (req, res, next) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["text", "completed"]);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  // should also check if it is already true
    // otherwise it would allow you to overwrite the completedAt field
    // making it seem like it was completed at a later time than it was
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  })
    .catch((err)=> {
      res.status(400).send();
    });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = {
  app
};
