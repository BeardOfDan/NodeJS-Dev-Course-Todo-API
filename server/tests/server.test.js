"use strict";

const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// ensures that the database is empty before every test is run
beforeEach((done) => {
  Todo.remove({}).then(() => {
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
        Todo.find().then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        });
      }).catch((err) => {
      done(err);
    });
  });

  it("should not create todo with invalid body data", (done) => {
    request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .then(() => {
        Todo.find().then((todos) => {
          expect(todos.length).toBe(0);
          done();
        });
      }).catch((e) => {
        done(e);
    });
  });

}); // end of describe "POST /todos"
