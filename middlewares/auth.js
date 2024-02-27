const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { AUTHORIZATION_ERROR } = require("../utils/errors");

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(AUTHORIZATION_ERROR).send({ message: "Authorization error" });
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    res.status(AUTHORIZATION_ERROR).send({ message: "Authorization required" });
  }

  req.user = payload;

  return next();
};

module.exports = { auth };