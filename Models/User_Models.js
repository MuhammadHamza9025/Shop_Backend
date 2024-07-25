const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const User_Schema = new mongoose.Schema({
    UserName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, 'PROVIDE VALID EMAIL ADDDRESS'],
        unique: true,
    },
    password: {
        type: String,
        required: true,

    },
    Profile: {
        type: String,
        default: 'data:image/png;base64,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'
    },
    role: {
        type: String,
        default: 'User'
    },
    cart: []

});

User_Schema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

const User = mongoose.model('Users', User_Schema);

module.exports = User;