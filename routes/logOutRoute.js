const express = require('express')
const router = express.Router()

const logOutController = require('../controllers/logOutController')
const verifyToken = require('../middlewares/verifyToken')

router.route('/')
  .get(verifyToken, logOutController)


module.exports = router