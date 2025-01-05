const myUser = require('../models/user');

const repository = {
  createUser: async (userData) => {
    const user = new myUser(userData);
    return await user.save();
  },

  findUserByEmail: async (email) => {
    return await myUser.findOne({ email });
  },

  findUserById: async (userId) => {
    return await myUser.findOne({ user_id: userId });
  },

  getAllUsers: async () => {
    return await myUser.find();
  },

  updatePasswordByEmail: async (email, newPassword) => {
    return await myUser.updateOne({ email }, { password: newPassword });
  },

  // ตรวจสอบว่ามี user_id อยู่ในฐานข้อมูลหรือไม่
  validateUserExistence: async (userId) => {
    const user = await myUser.findOne({ user_id: userId }).lean();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  // เพิ่ม form_id ใน User
  addFormToUser: async (userId, formId) => {
    const updatedUser = await myUser.findOneAndUpdate(
      { user_id: userId },
      { $push: { forms: formId } }, // เพิ่ม form_id ในฟิลด์ forms
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found or failed to update');
    }

    return updatedUser;
  },

  // ลบ form_id จาก User
  removeFormFromUser: async (userId, formId) => {
    const updatedUser = await myUser.findOneAndUpdate(
        { user_id: userId },
        { $pull: { forms: formId } }, // ลบ form_id จากฟิลด์ forms
        { new: true }
    );

    if (!updatedUser) {
        throw new Error('User not found or failed to update');
    }

    return updatedUser;
},
};

module.exports = repository;
