require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "secret-secret-secret";

module.exports = { JWT_SECRET };
