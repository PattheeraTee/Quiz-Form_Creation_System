require('dotenv').config();
const userRepository = require('../repository/userRepository');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const emailService = require("../utils/emailService");

const service = {
  registerUser: async (email, password, profile_image) => {
    // ตรวจสอบว่า email ซ้ำหรือไม่
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error(`อีเมล ${email} ถูกใช้ลงทะเบียนแล้ว`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      user_id: uuidv4(),
      email,
      password: hashedPassword,
      profile_image,
    };
    return await userRepository.createUser(userData);
  },

  loginUser: async (email, password) => {
    const user = await userRepository.findUserByEmail(email);
    if (!user) throw new Error('ไม่พบบัญชีผู้ใช้นี้ในระบบ');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    const token = jwt.sign({ userId: user.user_id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return { token, user };
  },

  getAllUsers: async () => {
    return await userRepository.getAllUsers();
  },

  getUserById: async (userId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('ไม่พบบัญชีผู้ใช้นี้ในระบบ');
    return user;
  },

  forgotPassword: async (email) => {
    // ตรวจสอบว่าอีเมลมีอยู่ในระบบหรือไม่
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("ไม่พบอีเมลนี้ในระบบ");
    }

    // สร้าง token สำหรับ reset password
    const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "1h" });

    // สร้างลิงก์สำหรับเปลี่ยนรหัสผ่าน
    const resetLink = `http://localhost:3000/change-password/${token}`;

    // ส่งอีเมลให้ผู้ใช้
    const subject = "รีเซ็ตรหัสผ่านของคุณ";
    const text = `คลิกที่ลิงก์นี้เพื่อเปลี่ยนรหัสผ่านของคุณ: ${resetLink}`;
    const html = `<p>คลิกที่ลิงก์นี้เพื่อเปลี่ยนรหัสผ่านของคุณ:</p><a href="${resetLink}">${resetLink}</a>`;

    await emailService.sendEmail(email, subject, text, html);

    return { message: "ส่งอีเมลรีเซ็ตรหัสผ่านสำเร็จ" };
  },

  changePassword: async (token, newPassword) => {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const email = decoded.email;

      // เข้ารหัสรหัสผ่านใหม่
      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      // อัปเดตรหัสผ่านในฐานข้อมูล
      await userRepository.updatePasswordByEmail(email, hashedPassword);

      return { message: "เปลี่ยนรหัสผ่านสำเร็จ" };
    } catch (err) {
      console.error("โทเค็นไม่ถูกต้องหรือหมดอายุ:", err);
      throw new Error("โทเค็นไม่ถูกต้องหรือหมดอายุ");
    }
  },
};

module.exports = service;
