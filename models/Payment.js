const mongoose = require('mongoose')

const User = require('../models/User')

const paymentSchema = new mongoose.Schema({
    /* ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    }, */
    amount: { type: Number, required: true, min: 0 },
    tax_amount: { type: Number, required: true, min: 0, default: 0 },
    product_service_charge: { type: Number, required: true, min: 0, default: 0 },
    product_derivary_charge: { type: Number, required: true, min: 0, default: 0 },
    total_amount: { type: Number, required: true, min: 0 },
    transaction_uuid: { type: String, required: true, unique: true, match: /^[a-zA-Z0-9-]+$/ }, // Only alphanumeric and hyphen allowed 
    product_code: { type: String, required: true },
    success_url: { type: String, required: true },
    failure_url: { type: String, required: true },
    signed_field_names: { type: String, required: true },
    signature: { type: String, required: true },
    payment_status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

const Payment = mongoose.model('payments', paymentSchema)

module.exports = Payment