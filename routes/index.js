const router = require("express").Router();
const clothingItems = require("./clothingItems");
const users = require("./users");
const { HTTP_NOT_FOUND } = require("../utils/errors");

router.use("/items", clothingItems);
router.use("/users", users);

router.use((req, res) => {
  res.status(HTTP_NOT_FOUND).send({ message: "Router not found" });
});

module.exports = router;