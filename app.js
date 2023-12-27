const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require('cookie-parser')
const path = require("path");
const AppError = require("./utils/appError");
const app = express();
const tourRouters = require("./routes/tourRouter");
const userRouters = require("./routes/userRouter");
const reviewRouters = require("./routes/reviewRouter");
const viewRouters = require('./routes/viewRouter')
const bookingRouters = require('./routes/bookingRouter')
const globalErrorHandler = require("./controllers/errorControler");
const crypto = require('crypto');
app.use((req, res, next) => {
  // Generate a nonce dynamically for each request
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  next();
});

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-src 'self' https://checkout.razorpay.com/;"); // Modify as needed
  next();
});

// app.use((req, res, next) => {
//   res.locals.nonce = nonce;
//   next();
// });

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

const { Error } = require("mongoose");

// 1)GLOBAL MIDDLEWARES
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, "public")));
//set security http header
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      // ... other directives
      scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
    },
  })
);

//development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

//body parser . readung data from req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

//test middlewear
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies)
  next();
});

// 3)ROUTS
app.use("/", viewRouters);
app.use("/api/v1/tours", tourRouters);
app.use("/api/v1/users", userRouters);
app.use("/api/v1/reviews", reviewRouters);
app.use("/api/v1/bookings", bookingRouters);

//error message provides for wrong api requests
app.all("*", (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} in this server`));
});

//error handlermiddlware
app.use(globalErrorHandler);

module.exports = app;
