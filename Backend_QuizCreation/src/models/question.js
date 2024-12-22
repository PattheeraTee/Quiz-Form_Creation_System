const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

//สร้าง schema
const Schema = mongoose.Schema;
const questionSchema = new Schema({
    question_id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,
    },
    type: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true,
        default: "คำถาม",
    },
    question_image: {
        type: String,
    },
    points: {
        type: Number,
    },
    required: {
        type: Boolean,
        required: true,
        default: false,
    },
    limit:{
        type: Number,
    },
    correct_answer:[{
        type: String,
    }],
    options: [{
        option_id: {
            type: String,
            required: true,
            unique: true,
            default: uuidv4,
        },
        text: {
            type: String,
            required: true,
        },
        is_correct: {
            type: Boolean,
        },
        option_image: {
            type: String,
        },
        weight: {
            type: Number,
        },
        result_id: {
            type: String,
            ref: 'Result',
        },
    }],
    section_id: { // ใช้ user_id เพื่ออ้างอิง
        type: String,
        required: true,
        ref: 'Section', // ชี้ไปที่โมเดล User
    },

}, { versionKey: false });

//สร้าง model โดยใช้ schema ที่สร้างไว้
const Question = mongoose.model('Question', questionSchema);

//ทำการ export model เพ่ือให้สามารถเรียนกใช้ในไฟล์อื่นได้
module.exports = Question;
