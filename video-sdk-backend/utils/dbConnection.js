const mongoose = require("mongoose");
const config = require("../config");

const initDatabaseConnection = async () => {
  mongoose.connect(config.dbURL);

  const connection = mongoose.connection;

  connection.on("connected", async () => {
    console.log("MongoDB :: Connected");
  });

  connection.on("disconnected", () => {
    console.log("MongoDB :: Disconnected");
  });

  connection.on("error", (error) => {
    console.log(`MongoDB :: Connection error : ${error}`);
    mongoose.disconnect();
    process.exit(1);
  });

  module.exports = connection;
};

module.exports = {
  initDatabaseConnection,
};
