const express = require("express");
const cartController = require("../controllers/cartController");
const authController = require("./../controllers/authController");
const uploadToCloudinary = require("../middlewares/uploadToCloudinary");

const router = express.Router(); //to get access to params in courses router

router.use(authController.protect);

router.route("/:productId").post(cartController.createCart);

router
  .route("/")
  .get(cartController.getProductsForUser)
  .delete(cartController.deleteAllProductFromCart);

router
  .route("/:id/:productId")
  .delete(cartController.pullProductId, cartController.deleteProductFromCart);

module.exports = router;
