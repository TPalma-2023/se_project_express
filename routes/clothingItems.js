const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const {
  createItem,
  getItems,
  // updateItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

router.post("/", auth, createItem);

router.get("/", getItems);

router.put("/:itemId/likes", auth, likeItem);

// router.put("/:itemId/likes", updateItem);

router.delete("/:itemId", auth, deleteItem);

router.delete("/:itemId/likes", auth, dislikeItem);

module.exports = router;
