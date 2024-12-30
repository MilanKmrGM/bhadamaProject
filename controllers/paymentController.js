const axios = require('axios')

const Payment = require('../models/Payment')
const CustomError = require('../utils/customError')

const {generateTransactionUuid, generateSignature, generateSignedFieldNames} = require('../utils/esewaUtils')

// 1. Create a new payment record
exports.createPayment = async (req, res) => {
  try {
    const {
      amount,
      tax_amount,
      product_service_charge,
      product_delivery_charge,
      total_amount
    } = req.body

    // generate transaction uuid
    const transaction_uuid = generateTransactionUuid()

    // generate signed_field_name
    // Create message for signature
    const signed_field_names_message = generateSignedFieldNames(
      {total_amount, transaction_uuid, product_code: process.env.ESEWA_PRODUCT_CODE },
      ['total_amount', 'transaction_uuid', 'product_code']
    )

    // Generate signature
    const signature = generateSignature(signed_field_names_message)

    const signedNames = 'total_amount,transaction_uuid,product_code'

    // Create new payment instance
    const payment = new Payment({
      amount,
      tax_amount,
      product_service_charge,
      product_delivery_charge,
      total_amount,
      transaction_uuid,
      product_code: process.env.ESEWA_PRODUCT_CODE,
      success_url: process.env.SUCCESS_URL,
      failure_url: process.env.FAILURE_URL,
      signed_field_names: signedNames,
      signature,
    })

    // Save the payment document to the database
    const savedPayment = await payment.save();

    // PAYMENT PAYLOAD TO ESEWA
    const esewaPayload = {
      amount,
      tax_amount,
      product_service_charge,
      product_delivery_charge,
      total_amount,
      transaction_uuid,
      product_code: process.env.ESEWA_PRODUCT_CODE,
      success_url: process.env.SUCCESS_URL,
      failure_url: process.env.FAILURE_URL,
      signed_field_names: signedNames,
      signature
    }
    
    if(savedPayment) {
      console.log("successful request")
      res.status(201).json({esewaPayload})
    }
  } catch (error) {
    next(error)
  }
}

// 2. Verify payment status (update the payment status after transaction)
exports.verifyPayment = async (req, res) => {
 /*  try {
    const { transaction_uuid, payment_status } = req.body;

    // Find the payment by transaction_uuid
    const payment = await Payment.findOne({ transaction_uuid });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update the payment status
    payment.payment_status = payment_status; // Possible values: 'PENDING', 'SUCCESS', 'FAILED'

    // Update the timestamp for status change
    payment.updatedAt = Date.now();

    // Save the updated payment document
    await payment.save();

    // Respond with the updated payment status
    res.status(200).json({
      message: 'Payment status updated successfully',
      payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while verifying payment' });
  } */
}

// 3. Get payment details by transaction_uuid
exports.getPaymentByTransactionUuid = async (req, res) => {
 /*  try {
    const { transaction_uuid } = req.params;

    // Find the payment by transaction_uuid
    const payment = await Payment.findOne({ transaction_uuid });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Respond with payment details
    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching payment details' });
  } */
};


exports.handleSuccess = async (req, res) => {
  try {
    const encodedData = req.query.data

    if(!encodedData) {
      return res.redirect(`myapp://?data=Missingdataqueryparameter`)
    }

    // Decode the Base64 string using Buffer
    const decodedData = Buffer.from(encodedData, 'base64').toString('utf-8')
    
    // Parse the decoded string into JSON
    const jsonData = JSON.parse(decodedData)

    console.log(jsonData)

    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature
    }  = jsonData

   /*  // Verifying signature
    const signed_field_names_message = generateSignedFieldNames({ transaction_code, status, total_amount, transaction_uuid, product_code, signed_field_names}, ['transaction_code', 'status', 'total_amount', 'transaction_uuid', 'product_code', 'signed_field_names'])

    const recreatedSignature = generateSignature(signed_field_names_message)

    console.log(signature, recreatedSignature)
    console.log(signature === recreatedSignature) */

    /* // Status Check when after transaction no response is provided from esewa or received by Merchant

    const statusResponse = await axios.post(`https://uat.esewa.com.np/api/epay/transaction/status/?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`)

    if(statusResponse.status) {
      if(statusResponse.status === "COMPLETE") {
        console.log(statusResponse.status, "yeah status success")
      } else {
        console.log(statusResponse.status, "sorry status fail")
      }
    } */

    const queryParams = new URLSearchParams({
      status,
      total_amount
    }).toString()

   /*  if(recreatedSignature !== signature) {
      return res.redirect(`myapp://?status=varificationFalse`)
    } */

    return res.redirect(`myapp://?${queryParams}`)
  } catch (error) {
    console.error('Error decoding payment data:', error);
    return res.redirect(`myapp://?status=varificationFalse`)
  }
 
}

exports.handleFailure = async (req, res) => {
  try {
    const encodedData = req.query.data

    if(!encodedData) {
      return res.redirect(`myapp://?status=Missingdataqueryparameter`)
    }

    // Decode the Base64 string using Buffer
    const decodedData = Buffer.from(encodedData, 'base64').toString('utf-8')
    
    // Parse the decoded string into JSON
    const jsonData = JSON.parse(decodedData)

    console.log(jsonData)

    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature
    }  = jsonData

   /*  // Verifying signature
    const signed_field_names_message = generateSignedFieldNames({ transaction_code, status, total_amount, transaction_uuid, product_code, signed_field_names}, ['transaction_code', 'status', 'total_amount', 'transaction_uuid', 'product_code', 'signed_field_names'])

    const recreatedSignature = generateSignature(signed_field_names_message)

    console.log(signature, recreatedSignature)
    console.log(signature === recreatedSignature) */

    /* // Status Check when after transaction no response is provided from esewa or received by Merchant

    const statusResponse = await axios.post(`https://uat.esewa.com.np/api/epay/transaction/status/?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`)

    if(statusResponse.status) {
      if(statusResponse.status === "COMPLETE") {
        console.log(statusResponse.status, "yeah status success")
      } else {
        console.log(statusResponse.status, "sorry status fail")
      }
    } */

    const queryParams = new URLSearchParams({
      status/* ,
      total_amount */
    }).toString()

   /*  if(recreatedSignature !== signature) {
      return res.redirect(`myapp://?status=varificationFalse`)
    } */

    return res.redirect(`myapp://?${queryParams}`)
  } catch (error) {
    console.error('Error decoding payment data:', error);
    return res.redirect(`myapp://?status=varificationFalse`)
  }
 
}


// 1. check status 
exports.checkStatus = async (req, res) => {
  try {
    const {
      product_code,
      totalAmount,
      transaction_uuid 
    } = req.body

    // Check if all necessary parameters are provided
    if (!product_code || !totalAmount || !transaction_uuid) {
      throw new CustomError('Missing required Parameters', 400)
    }

    const statusCheckResponse = await axios.get(`https://uat.esewa.com.np/api/epay/transaction/status/?product_code=${product_code}&total_amount=${totalAmount}&transaction_uuid=${transaction_uuid}`)

    if(statusCheckResponse.data) {
      const {
        product_code,
        transaction_uuid,
        total_amount,
        status,
        ref_id
      } = statusCheckResponse.data

      console.log(status, total_amount, " New check point is status check")

      res.status(200).json({ status, total_amount})
    } else {
      // In case eSewa doesn't return any data
      return res.status(404).json({ message: 'No transaction data found' })
    }
    
  } catch (error) {
    next(error)
  }
}

