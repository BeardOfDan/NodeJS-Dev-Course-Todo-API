"use strict";

require("./config/config");

const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require("./middleware/authenticate");

let app = express();

// default value for process.env.PORT is given in config.js
const PORT = process.env.PORT;

app.use(bodyParser.json());

// =====================================
// ============= POST ==================
// =====================================

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

// should ensure that they are not already logged in
  // check the header for x-auth
  // if it exists, check for a match in the user's tokens array
    // if a match is found, then redirect them to the home page
      // or just do an error
        // ex. res.status(40?).send();
    // if no match is found, then log them in
app.post("/users/login", (req, res, next) => {
  let credentials = _.pick(req.body, ["email", "password"]);

  User.findByCredentials(credentials.email, credentials.password)
    .then((user) => {
      return user.generateAuthToken()
        .then((token) => {
          res.header("x-auth", token).send(user);
        });
    })
    .catch((err) => {
      res.status(400).send();
    });
});

app.post("/users", (req, res, next) => {
  let userInfo = _.pick(req.body, ["email", "password"]);
  let user = new User(userInfo);

  user.save().then(() => {
    return user.generateAuthToken();
  })
    .then((token) => {
      res.header("x-auth", token).send(user);
    })
    .catch((err) => {
      res.status(400).send(err);
  });
});

// =====================================
// ============= GET ===================
// =====================================

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

app.get("/todos", (req, res, next) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get("/users/me", authenticate, (req, res, next) => {
  res.send(req.user);
});

app.get("/users", (req, res, next) => {
  User.find().then((users) => {
    res.send({users});
  })
    .catch((err) => {
      res.status(400).send(err);
  });
});

// =====================================
// ============= DELETE ================
// =====================================

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

// consider making an identical version of this that's just /logout
  // for a humanly intuitive way of logging out without using the front-end
app.delete("/users/me/token", authenticate, (req, res, next) => {
  req.user.removeToken(req.token)
    .then(() => {
      res.status(200).send();
    }, (err) => {
      res.status(400).send();
    });
});

// =====================================
// ============= PATCH =================
// =====================================

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
