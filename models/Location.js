const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const User = require('./User')

const locationSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    latlng: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    street: { type: String, required: true },
    locality: { type: String, required: true },
    district: { type: String, required: true },
    roomCount: [{ type: Number, required: true}],
    roomPrice: [
        {
            roomCount: { type: Number, required: true},
            price: { type: Number, required: true}
        }
    ],
    roomPerson: [
        {
            roomCount: { type: Number, required: true},
            maxPerson: { type: Number, required: true}
        }
    ],
    phoneNumber: { type: Number, requied: true},
    duration: { type: Date, required: true, expires: 0}
  
})

// Add the auto-increment plugin to the schema
locationSchema.plugin(AutoIncrement, {
    inc_field: "count",
    id: 'location_seq',
    start_seq: 1
})

const Location = mongoose.model('location', locationSchema)

module.exports = Location
