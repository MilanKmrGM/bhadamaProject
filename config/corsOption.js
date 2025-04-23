const cors = require('cors');
const CustomError = require('../utils/customError');

// Define allowed origins
const allowedOrigins = ['myapp://', ''];

// CORS options with custom origin check
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      // Create and throw a CustomError for unauthorized origins
      const error = new CustomError('Not allowed by CORS', 403);
      callback(error); // Pass error to callback
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware function with error handling
const corsMiddleware = (req, res, next) => {
  try {
    // Apply the CORS middleware with the configured options
    cors(corsOptions)(req, res, next);
  } catch (error) {
    // Pass the error to the next middleware (centralized error handler)
    next(error);
  }
};

// Export only the corsMiddleware function
module.exports = corsMiddleware
