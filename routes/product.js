const express = require("express");
const productController = require("../controllers/productController");
const authController = require("./../controllers/authController");
const uploadToCloudinary = require("../middlewares/uploadToCloudinary");
const detailsRouter = require("../routes/addDetails");
const multer = require("multer");
const router = express.Router();

router.get("/", productController.getAllProducts);

router.use(authController.protect);

const upload = multer({ dest: "uploads/" });

router.post(
  "/tryClothes",
  upload.single("image"),
  productController.TryOnClothes
);

router.use("/:productId/details", detailsRouter);

router
  .route("/")
  .post(
    authController.restrictTo("Products Owner", "super admin"),
    productController.setid,
    productController.createProduct
  );

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    authController.restrictTo("Products Owner", "super admin"),
    productController.uploadProductPhotos,
    productController.resizeProductPhotos,
    uploadToCloudinary,
    productController.updateProduct
  )
  .delete(
    authController.restrictTo("Products Owner", "super admin"),
    // productController.deleteRelatedData,
    productController.deleteProduct
  );

module.exports = router;
