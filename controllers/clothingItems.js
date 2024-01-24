const ClothingItem = require("../models/clothingItem");
const {
  HTTP_NOT_FOUND,
  INVALID_DATA_ERROR,
  DEFAULT_ERROR,
} = require("../utils/errors");

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.send({ data: item });
    })
    .catch((e) => {
      if (e.name === "ValidationError") {
        return res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid request error for createItem" });
      }
      return res
        .status(DEFAULT_ERROR)
        .send({ message: "Error from createItems" });
    });
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => res.status(DEFAULT_ERROR).send({ message: err.message }));
};

// const updateItem = (req, res) => {
//   const { itemId } = req.params;
//   const { imageUrl } = req.body;

//   ClothingItem.findByIdAndUpdate(itemId, { $set: { imageUrl } })
//     .orFail()
//     .then((item) => res.status.send(200).send({ data: item }))
//     .catch((e) => {
//       if (e.name === INVALID_DATA_ERROR) {
//         res
//           .status(INVALID_DATA_ERROR)
//           .send({ message: "Invalid data in updateItems" });
//       } else if (e.name === "DocumentNotFoundError") {
//         res
//           .status(HTTP_NOT_FOUND)
//           .send({ message: "Item not found in updateItem" });
//       } else {
//         res
//           .status(DEFAULT_ERROR)
//           .send({ message: "Get updateItems failed", e });
//       }
//     });
// };

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then(() => res.send({ message: "Item was deleted" }))
    .catch((e) => {
      if (e.name === "CastError") {
        res
          .status(INVALID_DATA_ERROR)
          .send({ message: "Invalid data in deleteItem" });
      } else if (e.name === "DocumentNotFoundError") {
        res
          .status(HTTP_NOT_FOUND)
          .send({ message: "Item not found in deleteItems" });
      } else {
        res.status(DEFAULT_ERROR).send({ message: "Get deleteItem failed" });
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
        res.status(DEFAULT_ERROR).send({ message: "likeItem failed" });
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
  // updateItem,
  deleteItem,
  likeItem,
  dislikeItem,
};