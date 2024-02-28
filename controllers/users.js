const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");

const {
  HTTP_NOT_FOUND,
  INVALID_DATA_ERROR,
  DEFAULT_ERROR,
  CONFLICT_ERROR,
  AUTHORIZATION_ERROR,
  DB_ERROR,
} = require("../utils/errors");

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!password) {
    return res
      .status(INVALID_DATA_ERROR)
      .send({ message: "No password found" });
  }

  if (!email) {
    return res.status(INVALID_DATA_ERROR).send({ message: "No email found" });
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        throw new Error("Duplicate email");
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) =>
      res.send({
        name: user.name,
        avatar: user.avatar,
        email: user.email,
      }),
    )
    .catch((e) => {
      if (e.code === 11000 || e.name === "MongoServerError") {
        return res.status(DB_ERROR).send({ message: "DB error" });
      }
      if (e.name === "ValidationError") {
        return res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid input on createUser" });
      }
      if (e.message === "Duplicate email") {
        return res.status(CONFLICT_ERROR).send({ message: "Duplicate email" });
      }
      return res
        .status(DEFAULT_ERROR)
        .send({ message: "Error from createUser" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(INVALID_DATA_ERROR)
      .send({ message: "Invalid email or password" });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({ data: token });
    })
    .catch((e) => {
      if (e.message === "Invalid email or password") {
        res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid email or password" });
      } else {
        res.status(AUTHORIZATION_ERROR).send({ message: "DB error" });
      }
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((e) => {
      if (e.name === "CastError") {
        res.status(INVALID_DATA_ERROR).send({ message: "Invalid data error" });
      } else if (e.name === "DocumentNotFoundError") {
        res.status(HTTP_NOT_FOUND).send({ message: "HTTP not found" });
      } else if (e.name === "ValidationError") {
        res.status(INVALID_DATA_ERROR).send({ message: "Validation error" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: e.message });
      }
    });
};

const updateProfile = (req, res) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;
  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true },
  )
    .then((user) => user)
    .then((user) => res.status(200).send({ data: user }))
    .catch((e) => {
      if (e.name === "CastError") {
        res.status(INVALID_DATA_ERROR).send({ message: "Invalid data error" });
      } else if (e.name === "DocumentNotFoundError") {
        res.status(HTTP_NOT_FOUND).send({ message: "HTTP not found" });
      } else if (e.name === "ValidationError") {
        res.status(INVALID_DATA_ERROR).send({ message: "Validation error" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: e.message });
      }
    });
};

module.exports = { createUser, login, getCurrentUser, updateProfile };
