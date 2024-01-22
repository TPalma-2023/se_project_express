const router = require("express").Router();
const clothingItem = require("./clothingItems");
const users = require("./users");
const { NOTFOUND_ERROR } = require("../utils/errors");

router.use("./items", clothingItem);
router.use("./users", users);

router.use((req, res) => {
  res.status(NOTFOUND_ERROR).send({ message: "Router not found" });
});

module.exports = router;
