const jwt = require('jsonwebtoken')

const User = require('../models/User')
const CustomError = require('../utils/customError')

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().lean()

        if(users.length === 0) {
            throw new CustomError('No users found', 400)
        }

        res.status(200).json(users)
       
    } catch (error) {
        next(error)
    }
}


const createNewUser = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body

        const duplicate = await User.findOne({email}).lean().exec()

        if(duplicate) {
            const payload = {
                userId: duplicate._id,
                phoneNumber: phoneNumber
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '30d'})
             console.log("duplicate user")
             return res.status(201).json({token, msg: "New user created! or logged successfully"})
        }

        const newUser = await User.create({email, phoneNumber})

        if(newUser) {
            const payload = {
                userId: newUser._id,
                phoneNumber
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '30d'})
            res.status(201).json({token, msg: "New user created!"})
        }
        
    } catch (error) {
        next(error)
    }
}


const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { email, phoneNumber } = req.body

        if(!id) {
            throw new CustomError('Id are required', 400)
        }

        const user = await User.findById(id)
        
        const duplicate = await User.findOne({email}).lean().exec()
        if(duplicate?._id.toString() !== id) {
            throw new CustomError('Duplicate Username or Email', 400)
        }

        user.email = email
        user.phoneNumber = phoneNumber

        const updatedUser = await user.save()

        if(updatedUser) {
            res.status(200).json({msg: "User updated"})
        }
        
    } catch (error) {
        next(error)
    }
}


const deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        if(!id) {
            throw new CustomError('Id required', 400)
        }

        const user = await User.findById(id).lean()

        if(user) {
           const deletedUser = await User.deleteOne({_id: id })
           if(deletedUser.deletedCount === 1) {
            res.status(200).json({msg: `User deleted`})
           }
        }
        
    } catch (error) {
        next(error)
    }
}



module.exports = { getAllUsers, createNewUser, updateUser, deleteUser }