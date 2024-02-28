const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { PORT = 3001 } = process.env;
const app = express();
const routes = require("./routes/index");

// mongoose.connect(
//   "mongodb://127.0.0.1:27017/wtwr_db",
//   (r) => {
//     console.log("connected to DB", r);
//   },
//   (e) => {
//     "DB error";
//   },
// );

app.use(express.json());
app.use(routes);
app.use(cors());

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => console.error(err));

// app.use((req, res, next) => {
//   req.user = {
//     _id: "65ae9ca8e3545bbaa3404401",
//   };
//   next();
// });

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
