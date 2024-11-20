const express = require("express");
const cors = require("cors");
const errorHandler = require("../utils/errorHandler");

const initMiddlewares = (app) => {
  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  app.use(cors());

  app.use("/", require("../routes/index"));

  app.use(errorHandler);

  app.use("*", (req, res) => {
    return res
      .status(200)
      .json({ status: "success", message: "Video SDK backend root." });
  });
};

module.exports = {
  initMiddlewares,
};
