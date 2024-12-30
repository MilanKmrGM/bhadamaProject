const mongoose = require('mongoose')

const connectDB = async () => {
    try {
       await mongoose.connect(process.env.DATABASE_URI)
       console.log("connected to mongoDB")
    } catch (error) {
        console.error(error.message)
    }
}

module.exports = { connectDB }

/* 'mongodb://127.0.0.1:27017/bhadamaProject' */

