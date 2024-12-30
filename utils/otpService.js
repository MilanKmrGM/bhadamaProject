const nodemailer = require('nodemailer')

const CustomError = require('./customError')

let otps = {}  // temporary OTPs storage



    const generateOTP = async (req,res, next) => {

      try {

    const { email, phoneNumber } = req.body

    if( !email || !phoneNumber) {
      throw new CustomError('Email required', 400)
  }


    const otp = Math.floor(100000 + Math.random()*900000).toString()

    otps[phoneNumber] = { otp, expiresAt: Date.now() + 5*60*1000} // Expires in 5 min

    
        // Nodemailer transporter
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        })

        // Send otp via gmail
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}. It is valid for 5 minutes`
        })
        
        console.log("otp generated and sent")
        res.status(200).json({email, phoneNumber})
    } catch (error) {
        console.error('Error sending OTP:', error)
       next(error)
    }
}



const verifyOTP = async (req, res, next) => {
    try {
      const { email, otp, phoneNumber } = req.body
    if (!otp) {
      throw new CustomError('otp required', 400)
    }

    // Check if the otp exists in the temporary storage
    const record = otps[phoneNumber]
    if(!record) {
        throw new CustomError('No OTP found for this email', 400)
    }

    // Destructure the OTP and its expiry time
    const { otp: storedOtp, expiresAt } = record

    // Check if the OTP has expired
   if (Date.now() > expiresAt) {
     // OTP expired, delete the entry and return an error
     delete otps[phoneNumber]
     throw new CustomError('OTP has expired', 400)
   }

   // Check if the OTP matches
   if (otp !== storedOtp) {
     throw new CustomError('Invalid OTP', 400)
   }

   // OTP is verified, remove it from temporary storage
  delete otps[phoneNumber]

  // Proceed to the next middleware (user creation)
  console.log("otp verified")
  next()
    } catch (error) {
      next(error)
    }
}


module.exports = { generateOTP, verifyOTP }