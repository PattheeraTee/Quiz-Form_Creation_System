const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

//สร้าง schema
const Schema = mongoose.Schema;
const sectionSchema = new Schema({
    section_id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,
    },
    number: {
        type: Number,
        required: true,
        default: 1,
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    form_id: { // ใช้ user_id เพื่ออ้างอิง
        type: String,
        required: true,
        ref: 'Form', // ชี้ไปที่โมเดล User
    },
    questions: [{
        type: String,
        ref: 'Question',
    }],
}, { versionKey: false });

//สร้าง model โดยใช้ schema ที่สร้างไว้
const Section = mongoose.model('Section', sectionSchema);

//ทำการ export model เพ่ือให้สามารถเรียนกใช้ในไฟล์อื่นได้
module.exports = Section;
