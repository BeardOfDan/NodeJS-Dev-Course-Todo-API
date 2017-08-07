"use strict";

const jwt = require("jsonwebtoken");
const {ObjectID} = require("mongodb");

const {Todo} = require("./../../models/todo");
const {User} = require("./../../models/user");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: "first@example.com",
  password: "userOnePassword!",
  tokens: [{
    access: "auth",
    token: jwt.sign({_id: userOneId, access: "auth"}, "abc123").toString()
  }]
}, {
  _id: userTwoId,
  email: "second@example.com",
  password: "userTwoPassword!",
  tokens: [{
    access: "auth",
    token: jwt.sign({_id: userTwoId, access: "auth"}, "abc123").toString()
  }]
}];

const todos = [{
  _id: new ObjectID(),
  text: "First test todo",
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: "Second test todo",
  completed: true,
  completedAt: 1234,
  _creator: userTwoId
}];

// ensures that the database is empty before every test is run
const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => {
    done();
  });
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let user1 = new User(users[0]).save();
    let user2 = new User(users[1]).save();

    return Promise.all([user1, user2]);
  }).then(() => {
    done();
  });
};

module.exports = {
  todos,
  users,
  populateTodos,
  populateUsers
};
