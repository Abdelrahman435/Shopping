const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Cart must belong to a Product"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Cart must belong to a User"],
    },
    priceAfterDiscount: {
      type: Number,
      required: [true, "A Booking must have a price"],
    },
    color: { type: String, required: true },
    size: {
      type: String,
      required: true,
    },
    imageOfProduct: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: "product",
    select: "name brand ",
  });

  next();
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
