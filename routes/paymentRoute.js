const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController')



// Route to handle payment verification after the transaction is completed
/* router.post('/verify', paymentController.verifyPayment) */

// Route to fetch payment details by transaction ID
/* router.get('/:transaction_uuid', paymentController.getPaymentByTransactionUuid) */

router.route('/create')
  .post(paymentController.createPayment)  // route to receive payment detail initially

router.route('/success')  //route to handle success response
  .get(paymentController.handleSuccess)

router.route('/failure')  //route to handle failure response
  .get(paymentController.handleFailure)

router.route('/check/status')  //route to handle failure response
  .post(paymentController.checkStatus)

module.exports = router
