const router = require("express").Router();
const { getCurrentUser, updateProfile } = require("../controllers/users");
const { auth } = require("../middlewares/auth");

// const { getUsers, getUser, createUser } = require("../controllers/users");

// router.get("/", getUsers);

// router.get("/:userId", getUser);

// router.post("/", createUser);

router.get("/me", auth, getCurrentUser);
router.post("/me", auth, updateProfile);

module.exports = router;
