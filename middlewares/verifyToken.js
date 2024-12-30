const jwt = require("jsonwebtoken")

const CustomError = require('../utils/customError')

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '')

    if(!token) {
        throw new CustomError('No token provided', 401)
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if(err) {
                return res.status(401).json({msg: 'Expired token'})
            }

            req.userId = decoded.userId
            req.phoneNumber = decoded.phoneNumber
            console.log("from verification")
            next()
        })
        
    } catch (error) {
        next(error)
    }
}

module.exports = verifyToken