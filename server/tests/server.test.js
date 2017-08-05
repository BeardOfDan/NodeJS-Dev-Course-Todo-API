"use strict";

const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: "First test todo"
}, {
  _id: new ObjectID(),
  text: "Second test todo",
  completed: true,
  completedAt: 1234
}];

// ensures that the database is empty before every test is run
beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => {
    done();
  });
});

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
    // it is virtually impossible that it would randomly generate an existing ID
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

