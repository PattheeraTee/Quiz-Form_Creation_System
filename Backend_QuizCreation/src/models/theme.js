const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

//สร้าง schema
const Schema = mongoose.Schema;
const themeSchema = new Schema({
    theme_id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,

    },
    primary_color: {
        type: String,
        required: true,
        default: '#FFFFFF',
    },
    form_id: { // ใช้ user_id เพื่ออ้างอิง
        type: String,
        required: true,
        ref: 'Form', // ชี้ไปที่โมเดล User
    },
}, { versionKey: false });

//สร้าง model โดยใช้ schema ที่สร้างไว้
const Theme = mongoose.model('Theme', themeSchema);

//ทำการ export model เพ่ือให้สามารถเรียนกใช้ในไฟล์อื่นได้
module.exports = Theme;
