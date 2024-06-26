const Cart = require("../models/cartModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Details = require("../models/productDetails");

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

  const updatedInventory = await Details.findOneAndUpdate(
    { id: req.body.idOfDetail, "sizes.size": req.body.size },
    { $inc: { "sizes.$.quantity": -1 } }, // Decrease quantity by 1
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedInventory) {
    return next(new Error("Failed to update inventory quantity."));
  }

  res.status(201).json({
    status: "success",
    data: {
      data: newDocument,
    },
  });
});

exports.pullProductId = catchAsync(async (req, res, next) => {
  const item = await Cart.findById(req.params.id);

  await Details.findOneAndUpdate(
    { _id: item.detailsId, "sizes.size": item.size },
    { $inc: { "sizes.$.quantity": 1 } }, // Increase quantity by 1
    {
      new: true,
      runValidators: true,
    }
  );

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
  const cartItems = await Cart.find({ user: req.user.id });

  const updatePromises = cartItems.map(async (item) => {
    await Details.findOneAndUpdate(
      { _id: item.detailsId, "sizes.size": item.size },
      { $inc: { "sizes.$.quantity": 1 } }, // Increase quantity by 1
      {
        new: true,
        runValidators: true,
      }
    );
  });

  await User.findByIdAndUpdate(
    req.user.id,
    { $set: { cartProducts: [] } }, //$push to add to the array
    {
      new: true,
      runValidators: true,
    }
  );

  await Promise.all(updatePromises);
  await Cart.deleteMany({ user: req.user.id });

  res.status(200).json({
    status: "success",
    message: "All products were deleted successfully",
  });
});
