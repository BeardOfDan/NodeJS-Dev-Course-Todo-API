"use strict";

const {mongoose} = require('./db/mongoose');
const express = require('express');
const bodyParse = require('body-parser');

const {Todo} = require('./models/todo');
const {User} = require('./models/user');

let app = express();

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
