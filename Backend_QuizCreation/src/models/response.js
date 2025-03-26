const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

//สร้าง schema
const Schema = mongoose.Schema;
const responseSchema = new Schema({
    response_id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,
    },
    email: {
        type: String,
    },
    answers: [{
        question_id: [{
            type: String,
            required: true,
        }],
        type: {
            type: String,
            required: true,
        },
        answer_text: {
            type: String 
        },
        answer_date: {
            type: Date,
        },
        answer_rating: {
            type: Number,
        },
        option_id: [{
            type: String,
        }],
        question_score: {
            type: Number,
        },
    }],
    submitted_at: {
        type: Date,
    },
    score: {
        type: Number,
    },
    form_id: { 
        type: String,
        required: true,
        ref: 'Form', 
    },
    result_id: { 
        type: String,
        ref: 'Result', 
    },
}, { versionKey: false });

//สร้าง model โดยใช้ schema ที่สร้างไว้
const Response = mongoose.model('Response', responseSchema);

//ทำการ export model เพ่ือให้สามารถเรียนกใช้ในไฟล์อื่นได้
module.exports = Response;
