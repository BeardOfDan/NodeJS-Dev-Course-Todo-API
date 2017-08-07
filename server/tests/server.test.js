"use strict";

const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST /todos", () => {
  it("should create a new todo", (done) => {
    let text = "Test Todo Text";

    request(app)
      .post("/todos")
      .send({text})
      .expect(200)
      .expect((res, req, next) => {
        expect(res.body.text).toBe(text);
      })
      .then(() => {
        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((err) => {
          done(err);
        });
      });
  });

  it("should not create todo with invalid body data", (done) => {
    request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .then(() => {
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((err) => {
          done(err);
        });
      });
  });

}); // end of describe "POST /todos"

describe("GET /todos", () => {
  it("should get all todos", (done) => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
}); // end of describe GET /todos

describe("GET /todos/:id", () => {
  it("should return todo doc", (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("should return 404 if todo not found", (done) => {
    let unusedID = new ObjectID().toString();
    request(app)
      .get(`/todos/${unusedID}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 for non-object ids", (done) => {
    request(app)
      .get("/todos/1234")
      .expect(404)
      .end(done);
  });
}); // end of describe GET /todos/:id

describe("DELETE /todos/:id", () => {
  it("should remove a todo", (done) => {
    let id = todos[1]._id.toString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo).toNotExist();
          done();
        })
          .catch((err) => {
            done(err);
          });
      });
  });

  it("should return 404 if todo not found", (done) => {
    let unusedID = new ObjectID().toString();
    request(app)
      .delete(`/todos/${unusedID}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 if ObjectID is invalid", (done) => {
    request(app)
      .delete("/todos/1234")
      .expect(404)
      .end(done);
  });
}); // end of describe DELETE /todos/:id

describe("PATCH /todos/:id", () => {
  it("should update the todo text", (done) => {
    let id = todos[0]._id.toString();
    let newText = "updated text for PATCH test";

    request(app)
      .patch(`/todos/${id}`)
      .send({"text": newText, "completed": true})
      .expect(200)
      .expect((req, res, next) => {
        let thisTodo = req.body.todo;
        expect(thisTodo.text).toBe(newText);
        expect(thisTodo.completed).toBe(true);
        expect(thisTodo.completedAt).toBeA("number");
    })
      .end(done);
  });

  it("should clear completedAt when todo is not completed", (done) => {
    let id = todos[1]._id.toString();
    let newText = "changed text for another PATCH test";

    request(app)
      .patch(`/todos/${id}`)
      .send({"text": newText, "completed": false})
      .expect(200)
      .expect((req, res, next) => {
        let thisTodo = req.body.todo;
        expect(thisTodo.text).toBe(newText);
        expect(thisTodo.completed).toBe(false);
        expect(thisTodo.completedAt).toNotExist();
    })
      .end(done);
  });

  it("should return 404 for an invalid id", (done) => {
    let invalidId = todos[1]._id.toString();
    invalidId += "asdf124";

    request(app)
      .patch(`/todos/${invalidId}`)
      .send({"text": "this data does not matter",})
      .expect(404)
      .end(done);
  });

  it("should return 404 for a non-existing id", (done) => {
    let unusedId = new ObjectID();

    request(app)
      .patch(`/todos/${unusedId}`)
      .send({"text": "irrelevant data"})
      .expect(404)
      .end(done);
  });
}); // end of describe PATCH /todos/:id

// ====================================
// =========== User Tests =============
// ====================================

describe("GET /users/me", () => {
  it("should return user if authenticated", (done) => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it("should return 401 if not authenticated", (done) => {
    request(app)
      .get("/users/me")
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
}); // end of describe GET /users/me

describe("POST /users", () => {
  it("should create a user", (done) => {
    let email = "sample@example.com";
    let password = "123mnb!";

    request(app)
      .post("/users")
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers["x-auth"]).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) return done();

        User.findOne({email}).then((user) => {
          expect(user).toExist(); // the user was created in the database
          expect(user.password).toNotBe(password); // the password was hashed
          done();
        })
          .catch((err) => {
            done(err);
          });
      });
  });

  it("should return validation errors for invalid data", (done) => {
    request(app)
      .post("/users")
      .send({email: "asdf", password: "123"})
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toExist(); // it returned errors
        expect(res.body.errors.password.name).toBe('ValidatorError'); // the password is invalid
        expect(res.body.errors.email.name).toBe('ValidatorError');  // the email is invalid
      })
      .end(done);
  });

    // valid password
  it("should not create user if the email is in use", (done) => {
    request(app)
      .post("/users")
      .send({
        email: users[0].email,
        password: "a2#Dwn0234sdpwfr8%LN3B" // valid, but otherwise random password
      })
      .expect(400)
      .end(done);
  });
}); // end of describe POST /users

describe("POST /users/login", () => {
  it("should login user and return auth token", (done) => {
    request(app)
      .post("/users/login")
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers["x-auth"]).toExist();
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens[0]).toInclude({
              access: "auth",
              token: res.headers["x-auth"]
            });
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });

  it("should reject invalid login", (done) => {
    request(app)
      .post("/users/login")
      .send({
        email: users[1].email,
        password: users[1].password + "invalidator"
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers["x-auth"]).toNotExist();
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });
}); // end of describe POST /users/login

