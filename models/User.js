const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    paid: {
        type: Boolean,
        //this property is required only if the role is 'owner'
        required: function() {
            return this.role === 'owner'
        },
        default: false
    },
    active: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model('user', userSchema)

module.exports = User