const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const {
  validateClothingItemBody,
  validateId,
} = require("../middlewares/validation");

router.post("/", auth, validateClothingItemBody, createItem);

router.get("/", getItems);

router.put("/:itemId/likes", auth, validateId, likeItem);

router.delete("/:itemId", auth, validateId, deleteItem);

router.delete("/:itemId/likes", auth, validateId, dislikeItem);

module.exports = router;
