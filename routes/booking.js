const express = require("express");
const authController = require("./../controllers/authController");
const bookingController = require("./../controllers/bookingController");

const router = express.Router();

router.get("/checkout/success", (req, res) => {
  res.send(
    `Payment successful for product ${req.query.productId}. Thank you for your purchase!`
  );
});

router.get("/checkout/cancel", (req, res) => {
  res.send("Payment was canceled. Please try again or contact support.");
});

router.get(
  "/checkout-session/:productId",
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = router;
