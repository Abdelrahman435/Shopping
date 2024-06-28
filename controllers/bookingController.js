const Product = require("../models/productModel");
const Bookings = require("../models/bookingModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
// const factory = require("./handlerFactory");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/userModel");
const Cart = require("../models/cartModel");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the booked product
  const products = req.body.products; // Array of products from the request body
  const allProductIds = products.map((product) => product.id).join(",");

  const lineItems = products.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: `${product.name} Product`,
        images: [product.image], // Assuming images are an array in each product
        metadata: {
          productId: product.id, // Example of adding metadata
          allProductIds: allProductIds, // Adding all product IDs
        },
      },
      unit_amount: product.price * 100, // Assuming product price is in dollars
    },
    quantity: products.length, // Assuming quantity is provided in each product
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/bookings/checkout/success`,
    cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
    customer_email: req.user.email,
    client_reference_id: req.params.productId,
    line_items: lineItems,
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

const createBookingCheckout = async (session) => {
  try {
    const user = (await User.findOne({ email: session.customer_email })).id;
    const allProductIds =
      session.line_items[0].price_data.product_data.metadata.allProductIds;
    await User.findByIdAndUpdate(
      user,
      {
        $push: {
          bookedProducts: { $each: allProductIds },
        },
      }, //$push to add to the array
      {
        new: true,
        runValidators: true,
      }
    );
    await User.findByIdAndUpdate(
      user,
      {
        $pull: {
          cartProducts: { $each: allProductIds },
        },
      }, //$push to add to the array
      {
        new: true,
        runValidators: true,
      }
    );
    await Cart.findOneAndDelete({ user: user });
  } catch (err) {
    console.error("Error creating booking:", err);
  }
};

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    await createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
});
