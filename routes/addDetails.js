const express = require("express");
const productController = require("../controllers/productController");
const authController = require("./../controllers/authController");
const uploadToCloudinary = require("../middlewares/uploadToCloudinary");

const router = express.Router();
router.use(authController.protect);

router
  .route("/")
  .post(
    authController.restrictTo("admin", "super admin"),
    productController.uploadProductPhotos,
    productController.resizeProductPhotos,
    uploadToCloudinary,
    productController.setQuantity,
    productController.addDetail
  );

module.exports = router;
