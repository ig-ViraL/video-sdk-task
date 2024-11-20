const express = require("express");
const { initMiddlewares } = require("../middleware");

const app = express();

initMiddlewares(app);

module.exports = app;
