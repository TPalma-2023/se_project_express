const router = require("express").Router();
const clothingItems = require("./clothingItems");
const users = require("./users");
const { createUser, login } = require("../controllers/users");
const {
  validateUserInfoBody,
  validateUserLogin,
} = require("../middlewares/validation");
const NotFoundError = require("../controllers/errors/NotFoundError");

router.use("/items", clothingItems);
router.use("/users", users);
router.post("/signin", validateUserLogin, login);
router.post("/signup", validateUserInfoBody, createUser);

router.use((req, res, next) => {
  next(new NotFoundError("Error: unknown route"));
});

module.exports = router;
