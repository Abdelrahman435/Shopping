const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
      trim: true,
      maxlength: [40, "A  name must have less or equal then 40 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required!"],
      maxlength: [
        300,
        "A  Description must have less or equal then 300 characters",
      ],
      minlength: [
        20,
        "A  Description must have more or equal then 20 characters",
      ],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "A Product must related to a Category"],
    },
    details: [
      {
        type: mongoose.Schema.ObjectId, // identifiy to be a MongoDB ID
        ref: "Details",
      },
    ],
    typeOfCloth: {
      type: String,
      required: [true, "A Product must related to a Type"],
    },
    price: {
      type: Number,
      required: [true, "A Product must have a price"],
    },
    discount: {
      type: Number,
    },
    allQuantity: {
      type: Number,
      default: 0,
    },
    brand: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

productSchema.virtual("priceAfterDiscount").get(function () {
  return this.price - (this.discount / 100) * 100; // Use Math.floor to round down to the nearest integer
});

// this is virtual populate
productSchema.virtual("detailsOfProduct", {
  ref: "Details",
  foreignField: "Product",
  localField: "_id",
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
