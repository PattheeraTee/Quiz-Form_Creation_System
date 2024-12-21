const userService = require("../service/userService");

const controller = {
  register: async (req, res) => {
    try {
      const { email, password, confirm_password, profile_image } = req.body;

      // ตรวจสอบว่า password และ confirm_password ตรงกัน
      if (password !== confirm_password) {
        return res.status(400).send({
          message: "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณากรอกใหม่",
        });
      }

      const user = await userService.registerUser(
        email,
        password,
        profile_image
      );
      res.status(201).send(user);
    } catch (err) {
      if (err.message.includes("ถูกใช้ลงทะเบียนแล้ว")) {
        res.status(400).send({ message: "อีเมลนี้ถูกใช้ลงทะเบียนแล้ว" });
      } else {
        res.status(500).send({ message: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่" });
      }
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const { token, user } = await userService.loginUser(email, password);
      // ตั้งค่า cookie โดยใช้ HttpOnly
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 3600000, // 1 ชั่วโมง
      });
      res.send({ message: "เข้าสู่ระบบสำเร็จ", user });
    } catch (err) {
      if (err.message.includes("ไม่พบ")) {
        res.status(404).send({ message: "ไม่พบบัญชีผู้ใช้ในระบบ" });
      } else if (err.message.includes("ไม่ถูกต้อง")) {
        res.status(401).send({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      } else {
        res.status(500).send({ message: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่" });
      }
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await userService.getAllUsers();
      res.status(200).send(users);
    } catch (err) {
      res
        .status(500)
        .send({ message: "ไม่สามารถดึงข้อมูลผู้ใช้ได้ กรุณาลองใหม่" });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).send(user);
    } catch (err) {
      if (err.message.includes("ไม่พบ")) {
        res.status(404).send({ message: "ไม่พบข้อมูลผู้ใช้" });
      } else {
        res.status(500).send({ message: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่" });
      }
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "กรุณากรอกอีเมล" });
      }

      const response = await userService.forgotPassword(email);
      res.status(200).json(response);
    } catch (err) {
      if (err.message.includes("ไม่พบ")) {
        res.status(404).json({ message: "ไม่พบอีเมลในระบบ" });
      } else {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่" });
      }
    }
  },

  changePassword: async (req, res) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword || !confirmPassword) {
        return res
          .status(400)
          .json({
            message: "กรุณากรอกข้อมูล Token, รหัสผ่านใหม่ และยืนยันรหัสผ่าน",
          });
      }

      if (newPassword !== confirmPassword) {
        return res
          .status(400)
          .json({ message: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน" });
      }

      const response = await userService.changePassword(token, newPassword);
      res.status(200).json(response);
    } catch (err) {
      if (err.message.includes("หมดอายุ")) {
        res.status(400).json({ message: "โทเค็นไม่ถูกต้องหรือหมดอายุ" });
      } else {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่" });
      }
    }
  },
};

module.exports = controller;
