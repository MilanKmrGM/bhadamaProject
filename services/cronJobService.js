const cron = require('node-cron')
const nodemailer = require('nodemailer')

const Location = require('../models/Location')
const User = require('../models/User')

// Set up the email transporter (for notifications)

const  transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'gmm94300@gmail.com', // your email
        pass: 'milanwithsara', // your email password or app password
    },
})

// Cron job to check for expired locations and notify users
cron.schedule('0 0 * * *', async () => {
    const now = new Date()
    const oneDayBeforeExpiration = new Date(now.getTime() + 24*60*60*1000) // 1 day from now

    try {
       // Check for locations expiring in 1 day
       const locationsToNotify = await Location.find({
        expiresAt: { $gte: now, $It: oneDayBeforeExpiration},
        active: true,
       })
       
       // Send notification to the owner of each expiring location
       for(const location of locationsToNotify) {
        const owner = await User.findById(location.ownerId)
        if(owner) {
            const mailOptions = {
                from: ' "Your App Name" <your-email@gmail.com>',
                to: owner.email,
                subject: `Location Expiration Warning: "${location.name}" will expire in 1 day on ${location.expiresAt.toDateString()}. \nPlease renew it to keep it active. \n\nBest regards, \nYour App Team`,
            }
            await transporter.sendMail(mailOptions)
        }
       }

       // Check for locations that have already expired
       const expiredLocations = await Location.find({
        expiresAt: {$It: now},
        active: true
       })

       // Mark expired locations as inactive ( or delete them)
       for (const locations of expiredLocations) {
        location.active = false
        await location.save()
       }
    } catch (error) {
        console.error('Error in cron job:', error)
    }
})