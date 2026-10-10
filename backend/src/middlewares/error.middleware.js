const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = 500;
    let message = error.message || 'Internal Server Error';

    if (error.code === 11000) {                       // trùng unique (email, phone...)
      statusCode = 400;
      const field = Object.keys(error.keyValue || {})[0];
      message = `${field} already exists`;
    } else if (error instanceof mongoose.Error) {
      statusCode = 400;
    }
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const { statusCode, message } = error;
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;