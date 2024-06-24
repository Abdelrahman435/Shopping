const express = require("express");
const productController = require("../controllers/productController");
const authController = require("./../controllers/authController");
const uploadToCloudinary = require("../middlewares/uploadToCloudinary");

const router = express.Router({ mergeParams: true }); //to get access to params in courses router

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
  ).get9;

module.exports = router;
