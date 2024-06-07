const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/Users');

const router = express.Router();

// Registration route
router.get("/",(req,res)=>{
  res.json({"success":"app deployed successfully"})
})
router.post(
  '/register',
  [
    check('phone', 'Phone number is required').not().isEmpty(),
    check('phone', 'Phone number must be exactly 10 digits').isLength({ min: 10, max: 10 }),
    check('phone', 'Phone number must be numeric').isNumeric(),
    check('password', 'Password is required').isLength({ min: 6 }),
    check('referralCode', 'Referral code is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    // Separate validation errors from other errors
    if (!errors.isEmpty()) {
      const validationErrors = errors.array().map(error => error.msg);
      return res.status(400).json({ validationErrors });
    }

    const { phone, password, referralCode } = req.body;

    try {
      // Check if the referral code is valid (example validation logic)
      if (referralCode !== 'welcome') {
        return res.status(201).json({ msg: 'Invalid referral code' });
      }

      // Check if the user already exists
      let user = await User.findOne({ phone });
      if (user) {
        return res.status(201).json({ msg: 'User already exists' });
      }

      // Create a new user
      user = new User({
        phone,
        password,
        role: 'USER', // Default role
      });

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save the new user
      await user.save();

      // Generate JWT token
      const payload = { user: { id: user.id } };
      jwt.sign(payload, 'yourSecretToken', { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        // Send JWT token as a cookie
        res.cookie('token', token, { httpOnly: true }).json({ user: { id: user.id, phone: user.phone, role: user.role } });
        // Send a success response with user data
      });
    } catch (err) {
      console.error(err.message);
      // Send a server error response
      res.status(500).send('Server error');
    }
  }
);
// Login route
router.post(
  '/login',
  [
    check('phone', 'Phone number is required').not().isEmpty(),
    check('phone', 'Phone number must be exactly 10 digits').isLength({ min: 10, max: 10 }),
    check('phone', 'Phone number must be numeric').isNumeric(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, password } = req.body;

    try {
      let user = await User.findOne({ phone });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = { user: { id: user.id } };
      jwt.sign(payload, 'yourSecretToken', { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
