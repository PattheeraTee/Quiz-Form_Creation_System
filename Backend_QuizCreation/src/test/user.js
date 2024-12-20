const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken'); // Import jwt
const cookieParser = require('cookie-parser'); // Import cookie-parser
const router = express.Router();
const myUser = require('../../models/user'); // Ensure this path is correct

const SECRET_KEY = 'mysecret'; // Secret key for token

// Middleware to parse cookies
router.use(cookieParser());

// POST route - Register a new user
router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new myUser({
    //   user_id: uuidv4(),
      email: req.body.email,
      password: hashedPassword,
      profile_image: req.body.profile_image,
    });

    const result = await user.save();
    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

// POST route - Login a user
router.post('/login', async (req, res) => {
    try {
      // Find user by email
      const user = await myUser.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send({ message: 'Invalid email or password' });
      }
  
      // Generate token
      const token = jwt.sign({ userId: user.user_id }, SECRET_KEY, { expiresIn: '1h' });
  
      // Set cookie with the token
      res.cookie('token', token, { httpOnly: true, secure: false }); // Use only 'token'
      res.send({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).send(err);
    }
  });
  
  

// GET route - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await myUser.find();
    res.send(users);
  } catch (err) {
    res.status(500).send(err);
  }
});

// GET route - Get a user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await myUser.findOne({ user_id: req.params.id });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
