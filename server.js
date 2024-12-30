require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const PORT = process.env.PORT || 3500
const app = express()

const { connectDB } = require('./config/database')
const logger = require('./utils/logger')
const cronJobService = require('./services/cronJobService')
const errorHandler = require('./middlewares/errorHandler')

// Logging all request
app.use(logger.logRequest)
 
// Database connection
connectDB() 

// Middlewares
// Configure CORS to allow specific origin
const corsOptions = {
    origin: '*', // Replace with your desired URL
    /* optionsSuccessStatus: 200 // For legacy browser support */
}
app.use(cors(corsOptions))

app.use(express.json())

// Routes
//home route
app.use('/', require('./routes/homeRoute'))

// Users route
app.use('/users', require('./routes/userRoute'))

// Location route
app.use('/locations', require('./routes/locationRoute'))

// payment route
app.use('/payment', require('./routes/paymentRoute'))

// logOut route
app.use('/logout', require('./routes/logOutRoute'))

/* // Start the cron job
cronJobService() // This will start the cron job immediately when the server runs */

// Centralized error handling middleware
app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
        console.log(`Server running on PORT http://localhost:${PORT}`)
    })
})

mongoose.connection.on('error', (error) => {
    console.log(error)
})