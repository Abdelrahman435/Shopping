const Product = require("../models/productModel");
const catchAsync = require("./../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

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

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);
