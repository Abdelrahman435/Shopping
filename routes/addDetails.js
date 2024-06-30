const express = require("express");
const detailsController = require("../controllers/detailsController");
const authController = require("./../controllers/authController");
const uploadToCloudinary = require("../middlewares/uploadToCloudinary");

const router = express.Router({ mergeParams: true }); //to get access to params in courses router

router.use(authController.protect);

router
  .route("/")
  .post(
    authController.restrictTo("Products Owner", "super admin"),
    detailsController.uploadProductPhotos,
    detailsController.resizeProductPhotos,
    uploadToCloudinary,
    detailsController.setQuantity,
    detailsController.addDetail
  )
  .get(detailsController.getDetailsForProduct);

router
  .route("/:id")
  .get(detailsController.getDetail)
  .patch(
    authController.restrictTo("admin", "super admin"),
    detailsController.uploadProductPhotos,
    detailsController.resizeProductPhotos,
    uploadToCloudinary,
    detailsController.updateDetail
  )
  .delete(
    authController.restrictTo("admin", "super admin"),
    detailsController.deleteDetil
  );

module.exports = router;
