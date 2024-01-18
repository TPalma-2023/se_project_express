const mongoose = require("mongoose");
var validator = require("validator");

const clothingItem = new mongooseSchema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  weather: {
    type: String,
    required: true,
    enum: ["hot", "warm", "cold"],
  },
  imageUrl: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return validator.isURL(v);
      },
      message: 'You must enter a valid URL',
    }
  },
  owner: {
    type: mongoose.isObjectIdOrHexString,
    required: true,
  },
  likes: {},
  createdAt: {},
});
