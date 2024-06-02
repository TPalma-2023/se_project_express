const ClothingItem = require("../models/clothingItem");
const BadRequestError = require("./errors/BadRequestError");
const ForbiddenError = require("./errors/ForbiddenError");
const NotFoundError = require("./errors/NotFoundError");

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        next(new BadRequestError("Invalid request error from create item"));
      } else {
        next(err);
      }
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      next(err);
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  return ClothingItem.findById({ _id: itemId })
    .orFail()
    .then((item) => {
      if (!item.owner.equals(req.user._id)) {
        return next(
          new ForbiddenError(
            "You are not authorized to delete this clothing item",
          ),
        );
      }
      return ClothingItem.deleteOne({ _id: itemId }).then(() => {
        res.send({ data: item, message: "Item was deleted" });
      });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new ForbiddenError("Error from delete item"));
      } else if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Error from delete item"));
      } else {
        next(err);
      }
    });
};

const likeItem = (req, res, next) => {
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
        next(new NotFoundError("Error from like item"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Error from like item"));
      } else {
        next(err);
      }
    });
};

const dislikeItem = (req, res, next) => {
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
        next(new NotFoundError("Error from dislike item"));
      } else if (err.name === "CastError") {
        next(new ForbiddenError("Error from dislike item"));
      } else {
        next(err);
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
