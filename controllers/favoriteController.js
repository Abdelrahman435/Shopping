const Product = require("../models/productModel");
const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

exports.addToFavorites = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const productId = req.params.id;

  // Find the user and product
  const user = await User.findById(userId);
  const product = await Product.findById(productId);

  if (!user || !product) {
    return next(new AppError("User or Product not found", 404));
  }

  // Check if the product is already in the user's favorites
  const isFavorite = user.favorites.includes(productId);
  const isFavoritedByUser = product.favorites.includes(userId);

  if (!isFavorite && !isFavoritedByUser) {
    await Product.findByIdAndUpdate(req.params.id, {
      $push: { favorites: req.user.id },
    });
    await User.findByIdAndUpdate(req.user.id, {
      $push: { favorites: req.params.id },
    });
    return res.status(200).json({
      status: "success",
      message: "Added to favorites",
    });
  } else {
    return res.status(400).json({
      status: "fail",
      message: "You already added this product to the favorites",
    });
  }
});

exports.addQuery = (req, res, next) => {
  req.query = { favorites: req.user.id };
  next();
};

exports.getProducts = factory.getAll(Product);

exports.deleteProductFromFavorites = catchAsync(async (req, res, next) => {
  await Product.findByIdAndUpdate(
    req.params.id,
    {
      $pull: { favorites: req.user.id },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { favorites: req.params.id } },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(204).json({ status: "success", data: null });
});

exports.deleteAllProductFromFavorites = catchAsync(async (req, res, next) => {
  const products = await Product.find({ favorites: req.user.id });
  const updatePromises = products.map(async (product) => {
    await Product.findByIdAndUpdate(
      product.id,
      {
        $pull: { favorites: req.user.id },
      },
      {
        new: true,
        runValidators: true,
      }
    );
  });
  await Promise.all(updatePromises);

  await User.findByIdAndUpdate(
    req.user.id,
    { $set: { favorites: [] } },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(204).json({ status: "success", data: null });
});
