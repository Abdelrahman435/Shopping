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
          unique: true,
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

// async function updateProductQuantity(detail) {
//   const product = await mongoose.model('Product').findById(detail.Product);
//   const details = await mongoose.model('Details').find({ Product: detail.Product });
  
//   let totalQuantity = 0;
//   details.forEach(d => {
//     d.sizes.forEach(s => {
//       totalQuantity += s.quantity;
//     });
//   });
  
//   product.allQuantity = totalQuantity;
//   await product.save();
// }

// detailsSchema.pre('save', async function (next) {
//   try {
//     await updateProductQuantity(this);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// detailsSchema.pre('findOneAndUpdate', async function (next) {
//   try {
//     const detail = await this.model.findOne(this.getQuery());
//     await updateProductQuantity(detail);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

detailsSchema.post('save', async function (doc, next) {
  try {
    await mongoose.model('Product').findByIdAndUpdate(doc.Product, {
      $push: { details: doc._id }
    });
    next();
  } catch (error) {
    next(error);
  }
});

const Details = mongoose.model("Details", detailsSchema);

module.exports = Details;
