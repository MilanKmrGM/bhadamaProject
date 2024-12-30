const errorHandler = (err, req, res, next) => {
    console.error(err.stack)

// Check if error is custom error, otherwise fallback to generic error
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'

    res.status(statusCode).json({
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack})  // Include stack in dev mode
    })
}

module.exports = errorHandler