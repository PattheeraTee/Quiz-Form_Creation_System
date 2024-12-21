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
};

module.exports = repository;
