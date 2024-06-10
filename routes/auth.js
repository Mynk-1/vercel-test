const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/Users');


const router = express.Router();

// Registration route
router.get("/",(req,res)=>{
  return res.json({"success":"app deployed successfully"})
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
      
      if (referralCode !== 'welcome') {
        return res.status(201).json({ msg: 'Invalid referral code' });
      }

      
      let user = await User.findOne({ phone });
      if (user) {
        return res.status(201).json({ msg: 'User already exists' });
      }

      
      user = new User({
        phone,
        password,
        role: 'USER',
      });

      
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      
      await user.save();

      const payload = { user: { id: user.id } };
      jwt.sign(payload, 'yourSecretToken', { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
  
        res.cookie('token', token, { httpOnly: true }).json({ user: { id: user.id, phone: user.phone, role: user.role } });
        
      });
      } catch (err) {
      console.error(err.message);
      
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
      jwt.sign(payload, 'yourSecretToken',{expiresIn:360000},(err,token)=>{
        if (err) throw err;
        res.cookie('token',token,{ httpOnly: true }).json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.get('/logout', (req, res) => {
  try {
    res.clearCookie('token'); 
    res.status(200).json({ msg: 'Logged out successfully' }); 
  } catch (error) {
    res.status(500).json({ msg: 'Failed to log out', error: error.message });
  }
});

module.exports = router;
