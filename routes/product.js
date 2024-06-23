const express = require("express");
const productController = require("../controllers/productController");
const authController = require("./../controllers/authController");
const uploadToCloudinary = require("../middlewares/uploadToCloudinary");

const router = express.Router();
router.use(authController.protect);

router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    authController.restrictTo("admin", "super admin"),
    productController.uploadProductPhotos,
    productController.resizeProductPhotos,
    uploadToCloudinary,
    productController.setColors,
    productController.createProduct
  );

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    authController.restrictTo("admin", "super admin"),
    productController.uploadProductPhotos,
    productController.resizeProductPhotos,
    uploadToCloudinary,
    productController.updateProduct
  )
  .delete(
    authController.restrictTo("admin", "super admin"),
    // productController.deleteRelatedData,
    productController.deleteProduct
  );

module.exports = router;
