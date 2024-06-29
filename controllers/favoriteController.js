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
    // Add the product to the user's favorites
    user.favorites.push(productId);
    await user.save();

    // Add the user to the product's favorites
    product.favorites.push(userId);
    await product.save();

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
