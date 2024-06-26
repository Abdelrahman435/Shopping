const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
      trim: true,
      maxlength: [40, "A name must have less or equal than 40 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required!"],
      maxlength: [
        300,
        "A description must have less or equal than 300 characters",
      ],
      minlength: [
        20,
        "A description must have more or equal than 20 characters",
      ],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "A Product must relate to a Category"],
    },
    details: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Details",
      },
    ],
    productOwner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    typeOfCloth: {
      type: String,
      required: [true, "A Product must relate to a Type"],
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

    favorites: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

productSchema.virtual("priceAfterDiscount").get(function () {
  if (this.discount > 0) return this.price - (this.discount / 100) * this.price;
  return this.price;
});

productSchema.virtual("detailsOfProduct", {
  ref: "Details",
  foreignField: "Product",
  localField: "_id",
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "details",
    select: "color file sizes",
  });

  next();
});

productSchema.virtual("productsOwner", {
  ref: "User",
  foreignField: "products",
  localField: "_id",
});

productSchema.virtual("favoritesProducts", {
  ref: "User",
  foreignField: "favorites",
  localField: "_id",
});

productSchema.virtual("cartProducts", {
  ref: "Cart",
  foreignField: "product",
  localField: "_id",
});
productSchema.post(/^find/, async function (docs, next) {
  if (!Array.isArray(docs)) {
    docs = [docs];
  }

  for (const doc of docs) {
    const details = await mongoose.model("Details").find({ Product: doc._id });
    let totalQuantity = 0;

    details.forEach((detail) => {
      detail.sizes.forEach((size) => {
        totalQuantity += size.quantity;
      });
    });

    doc.allQuantity = totalQuantity;
    await doc.save();
  }

  next();
});

productSchema.post("save", async function (doc, next) {
  if (doc.isNew) {
    try {
      await mongoose.model("User").findByIdAndUpdate(doc.productOwner, {
        $push: { products: doc._id },
      });
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
