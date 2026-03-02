require("dotenv").config();

const app = require("./app");
const { connectMongo } = require("./config/mongo");
const { checkPostgres } = require("./config/postgres");

const port = process.env.PORT || 3000;

Promise.all([connectMongo(), checkPostgres()])
  .then(() => {
    app.listen(port, () => {
      console.log(`API escuchando en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error iniciando la API", error);
    process.exit(1);
  });
