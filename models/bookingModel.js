const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Booking must belong to a Product"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Booking must belong to a User"],
    },
    price: {
      type: Number,
      required: [true, "A Booking must have a price"],
    },
    color: { type: String, required: true },
    size: {
      type: String,
      required: true,
    },
    paid:{
        type: Boolean,
        default: true,
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

bookingSchema.pre(/^find/, function (next) {
    this.populate({
      path: "Product",
      select: "name _id",
    });
  
    next();
  });

const Bookings = mongoose.model("Bookings", bookingSchema);

module.exports = Bookings;
