const { response } = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

//สร้าง schema
const Schema = mongoose.Schema;
const formSchema = new Schema({
    form_id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,

    },
    form_type: {
        type: String,
        required: true,
    },
    is_form_open: {
        type: Boolean,
        required: true,
        default: true,
    },
    start_date: {
        type: Date,
    },
    end_date: {
        type: Date,
    },
    cover_page_id: {
        type: String,
        ref: 'Coverpage',
        required: true,
    },
    section_id: [{
        type: String,
        ref: 'Section',
        required: true,
        unique: true,
    }],
    result_id: [{
        type: String,
        ref: 'Result'
    }],
    user_id: { // ใช้ user_id เพื่ออ้างอิง
        type: String,
        required: true,
        ref: 'User', // ชี้ไปที่โมเดล User
    },
    theme_id: {
        type: String,
        ref: 'Theme',
        required: true,
    },
    response: [{
        type: String,
        ref: 'Response',
    }],
    email_require: {
        type: Boolean,
    }
}, { versionKey: false });

//สร้าง model โดยใช้ schema ที่สร้างไว้
const Form = mongoose.model('Form', formSchema);

//ทำการ export model เพ่ือให้สามารถเรียนกใช้ในไฟล์อื่นได้
module.exports = Form;
