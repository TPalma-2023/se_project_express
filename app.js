const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { PORT = 3001 } = process.env;
const app = express();
const routes = require("./routes/index");

app.use(express.json());
app.use(cors());
app.use(routes);

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => console.error(err));

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
