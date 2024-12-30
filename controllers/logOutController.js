const User = require('../models/User')
const Location = require('../models/Location')

const logOutUser = async (req, res) => {
    try {
        const {userId} = req
    if(!userId) {
        return res.status(400).json({msg: "Logout failed"})
    }

    const user = await User.findById(userId)

    if(!user) {
        return res.status(400).json({msg: "Logout failed, user doesn't exist"})
    }

    const deletedUser = await User.deleteOne({_id: userId})

    // Location removal

   /*  const location = await Location.findOne({ownerId: userId}) */

   /*  if(!location) {
        console.log("No location found")
    } else {
        var deletedLocation = await Location.deleteOne({ownerId: userId})
    } */
     
    if(deletedUser?.deletedCount/*  && deletedLocation?.deletedCount === 1 */) {
        res.status(200).json({msg: "Logout completed"})
    }
    } catch (error) {
        console.error(error)
        res.status(500).json({msg: "Error while logging out User"})
    }
}

module.exports = logOutUser