const ClothingItem = require("../models/clothingItem");
const {
  HTTP_NOT_FOUND,
  INVALID_DATA_ERROR,
  DEFAULT_ERROR,
  FORBIDDEN_ERROR,
} = require("../utils/errors");

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.send({ data: item });
    })
    .catch((e) => {
      if (e.name === "ValidationError" || e.name === "CastError") {
        return res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid request error for createItem" });
      }
      return res.status(DEFAULT_ERROR).send({ message: "Error creating item" });
    });
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => res.status(DEFAULT_ERROR).send({ message: err.message }));
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  return ClothingItem.findById({ _id: itemId })
    .orFail()
    .then((item) => {
      if (!item.owner.equals(req.user._id)) {
        return res
          .status(FORBIDDEN_ERROR)
          .send({ message: "Action forbidden" });
      }
      return ClothingItem.deleteOne({ _id: itemId }).then(() => {
        res.send({ data: item, message: "Item was deleted" });
      });
    })
    .catch((e) => {
      if (e.name === "CastError") {
        res.status(INVALID_DATA_ERROR).send({ message: "Invalid data" });
      } else if (e.name === "DocumentNotFoundError") {
        res.status(HTTP_NOT_FOUND).send({ message: "Document not found" });
      } else if (e.name === "DefaultError") {
        res.status(DEFAULT_ERROR).send({ message: "Server error" });
      }
    });
};

const likeItem = (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true },
  )
    .orFail()
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      if (err.name === `DocumentNotFoundError`) {
        res
          .status(HTTP_NOT_FOUND)
          .send({ message: `${err.name} error on likeItem` });
      } else if (err.name === "CastError") {
        res.status(INVALID_DATA_ERROR).send({
          message: "Invalid ID passed",
        });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Failed to like item" });
      }
    });
};

const dislikeItem = (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true },
  )
    .orFail()
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      if (err.name === `DocumentNotFoundError`) {
        res
          .status(HTTP_NOT_FOUND)
          .send({ message: `${err.name} error on dislikeItem` });
      } else if (err.name === "CastError") {
        res.status(INVALID_DATA_ERROR).send({
          message: "Invalid ID passed",
        });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "dislikeItem failed" });
      }
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
