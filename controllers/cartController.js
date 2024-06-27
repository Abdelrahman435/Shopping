const Cart = require("../models/cartModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");
const User = require("../models/userModel");
const Product = require("../models/productModel");

exports.getProductsForUser = catchAsync(async (req, res, next) => {
  const cartItems = await Cart.find({ user: req.user.id });

  //   const products = await Product.find({
  //     _id: { $in: cartProducts }
  //   });
  const products = cartItems.map((item) => {
    const product = item.product.toObject();
    delete product.details; // Remove the details field explicitly

    return {
      _id: item._id,
      product: {
        ...product,
        id: product._id,
      },
      user: item.user,
      priceAfterDiscount: item.priceAfterDiscount,
      color: item.color,
      size: item.size,
      imageOfProduct: item.imageOfProduct,
      __v: item.__v,
      id: item._id,
    };
  });

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products: products,
    },
  });
});

exports.getCart = factory.getOne(Cart);

exports.createCart = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.product = req.params.productId;

  const newDocument = await Cart.create(req.body);

  await User.findByIdAndUpdate(
    req.user.id,
    { $push: { cartProducts: req.params.productId } }, //$push to add to the array
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(201).json({
    status: "success",
    data: {
      data: newDocument,
    },
  });
});

exports.pullProductId = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { cartProducts: req.params.productId } }, //$push to add to the array
    {
      new: true,
      runValidators: true,
    }
  );

  next();
});

exports.deleteProductFromCart = factory.deleteOne(Cart);

exports.deleteAllProductFromCart = catchAsync(async (req, res, next) => {
  await Cart.deleteMany({ user: req.user.id });

  res.status(200).json({
    status: "success",
    message: "All products were deleted successfully",
  });
});
