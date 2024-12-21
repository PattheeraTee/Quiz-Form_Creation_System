require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
  try {
    // ตรวจสอบว่ามี Cookie ชื่อ "token" หรือไม่
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // ตรวจสอบและถอดรหัส Token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userIdFromToken = decoded.userId;

    // ตรวจสอบว่า `userId` ใน Token ตรงกับ `id` ที่ส่งมาใน URL หรือไม่
    if (userIdFromToken !== req.params.id) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to view this resource.' });
    }

    // ผ่านการตรวจสอบ
    next();
  } catch (err) {
    console.error('Error verifying token:', err.message);
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyUser;
