const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// POST - Signup
router.post('/signup', async (req, res) => {
    try {
        const { username, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                message: 'Username already exists / यह यूजरनेम पहले से है'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            username: username.toLowerCase(),
            password: hashedPassword,
            name
        });

        await user.save();

        res.status(201).json({
            message: 'Account created successfully / अकाउंट बन गया',
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                dailySalaryRate: user.dailySalaryRate
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error / सर्वर में समस्या' });
    }
});

// POST - Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(400).json({
                message: 'Invalid username or password / गलत यूजरनेम या पासवर्ड'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid username or password / गलत यूजरनेम या पासवर्ड'
            });
        }

        res.json({
            message: 'Login successful / लॉगिन सफल',
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                dailySalaryRate: user.dailySalaryRate
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error / सर्वर में समस्या' });
    }
});

// PUT - Update Salary Rate
router.put('/salary', async (req, res) => {
    try {
        const { userId, dailySalaryRate } = req.body;

        if (!userId || !dailySalaryRate) {
            return res.status(400).json({
                message: 'User ID and salary rate required / यूजर ID और सैलरी जरूरी है'
            });
        }

        if (dailySalaryRate <= 0) {
            return res.status(400).json({
                message: 'Salary must be greater than 0 / सैलरी 0 से ज़्यादा होनी चाहिए'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { dailySalaryRate },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                message: 'User not found / यूजर नहीं मिला'
            });
        }

        res.json({
            message: 'Salary updated successfully / सैलरी अपडेट हो गई',
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                dailySalaryRate: user.dailySalaryRate
            }
        });
    } catch (error) {
        console.error('Update salary error:', error);
        res.status(500).json({ message: 'Server error / सर्वर में समस्या' });
    }
});

module.exports = router;
