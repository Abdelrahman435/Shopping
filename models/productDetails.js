const mongoose = require("mongoose");

const detailsSchema = new mongoose.Schema(
  {
    Product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Details must belong to a Product"],
    },
    color: { type: String, required: true },
    file: { type: String, required: true },
    sizes: [
      {
        size: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

const Details = mongoose.model("Details", detailsSchema);

module.exports = Details;
