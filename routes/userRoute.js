const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const verifyToken = require('../middlewares/verifyToken')
const { generateOTP, verifyOTP } = require('../utils/otpService')


router.route('/otp')
  .post(generateOTP)

router.route('/')
  .get(verifyToken, userController.getAllUsers)
  .post(verifyOTP, userController.createNewUser)

router.route('/:id')
  .put(verifyToken, userController.updateUser)
  .delete(verifyToken, userController.deleteUser)


module.exports = router