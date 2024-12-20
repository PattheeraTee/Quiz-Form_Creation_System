const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profile_image: {
        type: String,
    },
    forms: [{ // เก็บ array ของ form_id
        type: String,
        ref: 'Form', // อ้างอิงไปที่ Form
    }],
}, { versionKey: false });

const User = mongoose.model('User', userSchema);
module.exports = User;
