const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const BadRequestError = require("./errors/BadRequestError");
const ConflictError = require("./errors/ConflictError");
const ForbiddenError = require("./errors/ForbiddenError");
const NotFoundError = require("./errors/NotFoundError");
const UnauthorizedError = require("./errors/UnauthorizedError");

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if (!password) {
    next(new BadRequestError("Error from create user - password"));
  }

  if (!email) {
    next(new BadRequestError("Error from create user - email"));
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return next(ConflictError("Duplicate email"));
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
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Error from create user"));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new BadRequestError("Error in login - no email and/or password"),
    );
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ data: token });
    })
    .catch(() => {
      next(new UnauthorizedError("Error from login user"));
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((e) => {
      if (e.name === "CastError") {
        next(new ForbiddenError("Error in get current user"));
      } else if (e.name === "DocumentNotFoundError") {
        next(
          new NotFoundError("Error in get current user - document not found"),
        );
      } else {
        next(e);
      }
    });
};

const updateProfile = (req, res, next) => {
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
        next(new ForbiddenError("Error in update profile"));
      } else if (e.name === "DocumentNotFoundError") {
        next(new NotFoundError("Error in update profile - document not found"));
      } else if (e.name === "ValidationError") {
        next(new BadRequestError("Error in update profile - validation"));
      } else {
        next(e);
      }
    });
};

module.exports = { createUser, login, getCurrentUser, updateProfile };
