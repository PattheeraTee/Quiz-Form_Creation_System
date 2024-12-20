const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
//สร้าง schema
const Schema = mongoose.Schema;
const coverpageSchema = new Schema({
    cover_page_id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    text_button: {
        type: String,
        required: true,
        default: 'เริ่มทำ', 
    },
    cover_page_image: {
        type: String,
    },
    form_id: { // ใช้ user_id เพื่ออ้างอิง
        type: String,
        required: true,
        ref: 'Form', // ชี้ไปที่โมเดล User
    },
}, { versionKey: false });

//สร้าง model โดยใช้ schema ที่สร้างไว้
const Coverpage = mongoose.model('Coverpage', coverpageSchema);

//ทำการ export model เพ่ือให้สามารถเรียนกใช้ในไฟล์อื่นได้
module.exports = Coverpage;
