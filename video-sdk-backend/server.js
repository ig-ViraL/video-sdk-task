const http = require("http");
const app = require("./app/index");
const config = require("./config");
const { initDatabaseConnection } = require("./utils/dbConnection");

const server = http.createServer(app);

initDatabaseConnection();

server.listen(config.port, () => {
  console.log(`Server listing at http://localhost:${config.port}.`);
});
