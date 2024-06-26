const Product = require("../models/productModel");
const catchAsync = require("./../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const User = require("../models/userModel");
const APIFeatures = require("./../utils/apiFeatures");

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
