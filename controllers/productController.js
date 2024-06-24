const Product = require("../models/productModel");
const catchAsync = require("./../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const User = require("../models/userModel");
const Details = require("../models/productDetails");

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

exports.setQuantity = catchAsync(async (req, res, next) => {
  let array = req.body.sizes;
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum = sum + Number(array[i].quantity);
  }
  await Product.findByIdAndUpdate(req.body.Product, { allQuantity: sum });
  next();
});

exports.setid = catchAsync(async (req, res, next) => {
  
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

exports.getAllProducts = factory.getAll(Product);

exports.getProduct = factory.getOne(Product);

exports.createProduct = factory.createOne(Product);

exports.addDetail = factory.createOne(Details);

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);
