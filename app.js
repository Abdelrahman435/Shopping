var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const compression = require("compression");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
var usersRouter = require("./routes/users");
var productsRouter = require("./routes/product");
var detailsRouter = require("./routes/addDetails");
var bookingRouter = require("./routes/booking");
var favoritesRouter = require("./routes/favorites");
var cartRouter = require("./routes/cart");
var bookingController = require("./controllers/bookingController");

var app = express();

app.enable("trust proxy");

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(helmet()); // Set security HTTP headers

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour.",
});
app.use("/login", limiter);

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "public")));

// Stripe webhook endpoint
app.post(
  "/webhook-checkout",
  express.raw({ type: "*/*" }),
  bookingController.webhookCheckout
);

// Log requests
app.use(logger("dev"));

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
// app.use(hpp({
//   whitelist: []
// }));

// Parse cookies
app.use(cookieParser());

// Compression
app.use(compression());
app.use(express.static("upload"));

app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/details", detailsRouter);
app.use("/bookings", bookingRouter);
app.use("/cart", cartRouter);
app.use("/favorites", favoritesRouter);

// Catch 404 and forward to error handler
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
