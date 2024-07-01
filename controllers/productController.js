const Product = require("../models/productModel");
const catchAsync = require("./../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const User = require("../models/userModel");
const APIFeatures = require("./../utils/apiFeatures");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductPhotos = upload.single("photo");

exports.resizeProductPhotos = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `Course-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 });
  next();
});

exports.setid = catchAsync(async (req, res, next) => {
  req.body.productOwner = req.user.id;
  next();
});

// Uncomment and adjust the following if you need to delete related data
// exports.deleteRelatedData = catchAsync(async (req, res, next) => {
//   await Modules.deleteMany({ course: req.params.id });
//   await Register.deleteMany({ course: req.params.id });
//   await Exam.deleteMany({ course: req.params.id });
//   await User.updateMany(
//     { courses: req.params.id },
//     { $pull: { courses: req.params.id } }
//   );
//   next();
// });

exports.getAllProducts = catchAsync(async (req, res, next) => {
  // Fetch all products
  const products = await Product.find();

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  // Calculate total documents and total pages for each category
  const categoryStats = Object.keys(productsByCategory).map((category) => {
    const categoryProducts = productsByCategory[category];
    const totalDocs = categoryProducts.length;
    let totalPages;
    if (req.query.limit) {
      totalPages = Math.ceil(totalDocs / req.query.limit);
    } else {
      totalPages = 0;
    }
    return {
      category,
      totalDocs,
      totalPages,
      products: categoryProducts,
    };
  });

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    data: categoryStats,
  });
});

exports.getProduct = factory.getOne(Product);

exports.createProduct = factory.createOne(Product);

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);

exports.TryOnClothes = async (req, res) => {
  const imageFilePath = req.file.path; // Assuming 'image' is the key for the image file
  const clothUrl = req.body.cloth_url; // Assuming 'cloth_url' is the key for the cloth URL

  // Convert the image to FormData
  const formData = new FormData();
  formData.append("image", fs.createReadStream(imageFilePath));
  formData.append("cloth_url", clothUrl);

  try {
    // Send the files and cloth URL to the Flask app
    const response = await axios.post(
      "https://354d-34-141-221-179.ngrok-free.app/upload",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    // Handle the response from the Flask app
    if (response.data.url) {
      // Send the URL of the processed image to the client
      res.status(200).json({ url: response.data.url });
    } else {
      res.status(500).json({ error: "Image processing failed" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Delete uploaded image file
    fs.unlink(imageFilePath, (err) => {
      if (err) {
        console.error("Error deleting image file:", err);
      }
    });
  }
};
