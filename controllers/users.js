const User = require("../models/user");
const {
  HTTP_NOT_FOUND,
  INVALID_DATA_ERROR,
  DEFAULT_ERROR,
} = require("../utils/errors");

// GET /users — returns all users
const getUsers = (req, res) => {
  User.find({})
    .then((user) => res.status(200).send(user))
    .catch(res.status(DEFAULT_ERROR).send({ message: "Error from getUsers" }));
};

// GET /users/:userId - returns a user by _id
const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send({ data: user }))
    .catch((e) => {
      if (e.name === "CastError") {
        res.status(INVALID_DATA_ERROR).send({ message: "Invalid input data" });
      } else if (e.name === "DocumentNotFoundError") {
        res
          .status(HTTP_NOT_FOUND)
          .send({ message: "DocumentNotFoundError from getUser" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Error from getUser" });
      }
    });
};

// POST /users — creates a new user
const createUser = (req, res) => {
  const { name, avatar } = req.body;
  User.create({ name, avatar })
    .then((user) => {
      res.send(user);
    })
    .catch((e) => {
      if (e.name === "ValidationError") {
        res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid input on createUser" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Error from createUser" });
      }
    });
};

module.exports = { getUsers, getUser, createUser };
