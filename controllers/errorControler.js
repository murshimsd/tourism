const AppError = require("./../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleJwtError = () =>
  new AppError("invalid token please login again ", 401);
const handleJwtExpiredError = () =>
  new AppError("your token has expired please login again ", 401);

const sendErrorDev = (err, req, res) => {
  //api
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //rendering template
    return res.status(err.statusCode).render("error", {
      title: "something went wrong!",
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  //API
  ///operational,trusted errors sends to client
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      ///programming or unknown error . shouldnt  leake
    } else {
      // 1 log error
      console.log("errorrrr", err);

      // 2 send generic message
      return res.status(500).json({
        status: "error",
        message: "something happend wrong",
      });
    }
  } 
    //RENDERING
    if (err.isOperational) {
      return res.status(err.statusCode).render("error", {
        title: "something went wrong!",
        msg: err.message,
      });
      ///programming or unknown error . shouldnt  leake
    } else {
      // 1 log error
      console.log("errorrrr", err);

      // 2 send generic message
      return res.status(err.statusCode).render("error", {
        title: "something went wrong!",
        msg: "Please Try Again Later",
      });
    }
  
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if ((error.name = "ValidationError"))
      error = handleValidationErrorDB(error);
    sendErrorProd(error, req, res);
  }
  if (err.name === "JsonWebTokenError") err = handleJwtError();
  if (err.name === "TokenExpiredError") err = handleJwtExpiredError();
};
