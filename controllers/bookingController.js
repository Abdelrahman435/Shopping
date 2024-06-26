const Product = require("../models/productModel");
const Bookings = require("../models/bookingModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const { CurrencyCodes } = require("validator/lib/isISO4217");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the booked product
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  // 2) Create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment", // Specify the mode
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/checkout/success?product=${product.id}`,
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
            // size: req.body.size,
            // color: req.body.color,
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

const createBookingCheckout = session => {

}

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook error:${err.message}`);
  }

  if(event.type === 'checkout.session.completed'){}
});
