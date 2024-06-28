const Product = require("../models/productModel");
const catchAsync = require("./../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const Details = require("../models/productDetails");
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

exports.setQuantity = catchAsync(async (req, res, next) => {
  let array = req.body.sizes;
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum = sum + Number(array[i].quantity);
  }
  await Product.findByIdAndUpdate(req.body.Product, {$inc: {allQuantity: sum} });
  next();
});

exports.addDetail = factory.createOne(Details);

exports.getDetailsForProduct = catchAsync(async (req, res, next) => {
  let filter = {};
  let docs;
  if (req.params.productId) filter = { Product: req.params.productId };

  const features = new APIFeatures(Details.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  let documents = await features.query;
  let totalPages;
  if (req.query.limit) {
    docs = await Details.find();
    totalPages = Math.ceil(docs.length / req.query.limit);
  } else {
    totalPages = 0;
    docs = 0;
  }

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    totalDocs: docs.length,
    totalPages,
    results: documents.length,
    data: {
      data: documents,
    },
  });
});

exports.updateDetail = factory.updateOne(Details);

exports.deleteDetil = factory.deleteOne(Details);

exports.getDetail = factory.getOne(Details);
