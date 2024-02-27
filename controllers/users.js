const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const {
  HTTP_NOT_FOUND,
  INVALID_DATA_ERROR,
  DEFAULT_ERROR,
  CONFLICT_ERROR,
  AUTHORIZATION_ERROR,
} = require("../utils/errors");

// // GET /users — returns all users
// const getUsers = (req, res) => {
//   User.find({})
//     .then((user) => res.status(200).send(user))
//     .catch((err) => res.status(DEFAULT_ERROR).send({ message: err.message }));
// };

// // GET /users/:userId - returns a user by _id
// const getUser = (req, res) => {
//   const { userId } = req.params;
//   User.findById(userId)
//     .orFail()
//     .then((user) => res.status(200).send({ data: user }))
//     .catch((e) => {
//       if (e.name === "CastError") {
//         res.status(INVALID_DATA_ERROR).send({ message: "Invalid input data" });
//       } else if (e.name === "DocumentNotFoundError") {
//         res
//           .status(HTTP_NOT_FOUND)
//           .send({ message: "DocumentNotFoundError from getUser" });
//       } else {
//         res.status(DEFAULT_ERROR).send({ message: "Error from getUser" });
//       }
//     });
// };

// POST /users — creates a new user
const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      res.send(user);
    })
    .catch((e) => {
      if (e.name === "ValidationError") {
        res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid input on createUser" });
      } else if (e.code === 11000) {
        res.status(CONFLICT_ERROR).send({ message: "Email already in system" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Error from createUser" });
      }
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password).then((user) => {
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status.send({ token });
    if (!email || !password) {
      res
        .status(INVALID_DATA_ERROR)
        .send({ message: "Login attempt failed - invalid data" });
    }
    res.status(AUTHORIZATION_ERROR).send({ message: "Authorization error" });
  });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findByIf(userId)
    .orFail()
    .then((user) =>
      res.send(user).catch((e) => {
        if (e.name === "CastError") {
          res
            .status(INVALID_DATA_ERROR)
            .send({ message: "Invalid data error" });
        } else if (e.name === "DocumentNotFoundError") {
          res.status(HTTP_NOT_FOUND).send({ message: "HTTP not found" });
        } else if (e.name === "ValidationError") {
          res.status(INVALID_DATA_ERROR).send({ message: "Validation error" });
        } else {
          res.status(DEFAULT_ERROR).send({ message: e.message });
        }
      }),
    );
};

const updateProfile = (req, res) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;
  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      return user;
    })
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
