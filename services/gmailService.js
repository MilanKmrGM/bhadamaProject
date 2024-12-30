const nodemailer = require('nodemailer')
require('dotenv').config()

// Create a transporter object
const transporter = nodemailer.createTransport({
    service: "gmail",
   /*  host: "smtp.ethereal.email", */
   /*  port: 587,
    secure: false, */
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

// Email options
const mailOptions = {
        from: '"BhadamaProject" gmm94300@gmail.com',
        to: "gmmilan2019@gmail.com",
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
    }

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
        console.log('Error occurred:', error)
    } else {
        console.log('Email sent successfully:', info.response)
    }
})

