"use strict";

let env = process.env.NODE_ENV || "development";

if (env === "development") {
  process.env.PORT = 3000;                          // dev database
  process.env.MONGODB_URI = "mongodb://localhost:27017/TodoApp";
} else if (env === "test") {
  process.env.PORT = 3000;                          // test database
  process.env.MONGODB_URI = "mongodb://localhost:27017/TodoAppTest";
}
