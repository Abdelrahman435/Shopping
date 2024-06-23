const Product = require("../models/productModel");
const catchAsync = require("./../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const User = require("../models/userModel");

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

exports.uploadProductPhotos = upload.array("photos", 5); // Adjust the second parameter for the max number of photos

exports.resizeProductPhotos = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.length) return next();

  req.body.files = [];

  await Promise.all(
    req.files.map(async (file, index) => {
      const filename = `Product-${Date.now()}-${index + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 });

      req.body.files.push(filename);
    })
  );

  next();
});

exports.setColors = (req, res, next) => {
  if (req.body.colors) {
    req.body.colors = req.body.colors.split(',').map(color => color.trim());

  }
  next();
};

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
