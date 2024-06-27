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
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  // 2) Create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/bookings/checkout/success`,
    cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
    customer_email: req.user.email,
    client_reference_id: req.params.productId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${product.name} Product`,
            description: product.description,
            images: [req.body.image],
          },
          unit_amount: product.priceAfterDiscount * 100,
        },
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

const createBookingCheckout = async (session) => {
  try {
    const product = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.amount_total / 100;
    await Bookings.create({ user, product, price });
    await User.findByIdAndUpdate(
      user,
      { $push: { bookedProducts: product } }, //$push to add to the array
      {
        new: true,
        runValidators: true,
      }
    );
    await User.findByIdAndUpdate(
      user,
      { $pull: { cartProducts: req.params.productId } }, //$push to add to the array
      {
        new: true,
        runValidators: true,
      }
    );
    await Cart.findOneAndDelete({ user: user, product: product });
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
