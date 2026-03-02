require("dotenv").config();

const app = require("./app");
const { connectMongo } = require("./config/mongo");

const port = process.env.PORT || 3000;

connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`API escuchando en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error conectando a MongoDB", error);
    process.exit(1);
  });
