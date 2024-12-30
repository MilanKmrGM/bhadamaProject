const mongoose = require('mongoose')
const Location = require('../models/Location')

const savedLocationGroupSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    savedLocationIds: [
           {
            type: mongoose.Schema.Types.ObjectId,
            ref: Location,   // Reference to a Location document
            required: true
            } 
    ]
})

const SavedLocationGroup = mongoose.model('savedLocationGroup', savedLocationGroupSchema)

module.exports = SavedLocationGroup