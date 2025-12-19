const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email transporter (will be configured with user's email)
let transporter = null;

// Configure email transporter
const configureTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
};

// Validate email format (proper format with real domain patterns)
const isValidEmail = (email) => {
    if (!email) return false;

    // Check for valid email format with proper domain
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(email)) return false;

    // Check domain validity
    const domain = email.split('@')[1];
    if (!domain || domain.length < 4) return false; // min: a.co
    if (!domain.includes('.')) return false;

    // Domain extension must be at least 2 characters
    const extension = domain.split('.').pop();
    if (!extension || extension.length < 2) return false;

    return true;
};

// Validate password (min 8 chars)
const isValidPassword = (password) => {
    return password && password.length >= 8;
};

// POST - Signup
router.post('/signup', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Validate email
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                message: 'Please enter a valid email / सही ईमेल भरें'
            });
        }

        // Validate username
        if (!username || username.length < 3) {
            return res.status(400).json({
                message: 'Username must be at least 3 characters / यूजरनेम 3 अक्षर का होना चाहिए'
            });
        }

        // Validate password (minimum 8 characters)
        if (!isValidPassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters / पासवर्ड 8 अक्षर का होना चाहिए'
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({
                message: 'Email already exists / यह ईमेल पहले से है'
            });
        }

        // Check if username already exists
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
            email: email.toLowerCase(),
            username: username.toLowerCase(),
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: 'Account created successfully / अकाउंट बन गया',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                dailySalaryRate: user.dailySalaryRate
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error / सर्वर में समस्या' });
    }
});

// POST - Login (with email)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                message: 'Please enter a valid email / सही ईमेल भरें'
            });
        }

        // Validate password
        if (!password) {
            return res.status(400).json({
                message: 'Please enter password / पासवर्ड भरें'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({
                message: 'Email not found / ईमेल नहीं मिला'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Wrong password / गलत पासवर्ड'
            });
        }

        res.json({
            message: 'Login successful / लॉगिन सफल',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                dailySalaryRate: user.dailySalaryRate
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error / सर्वर में समस्या' });
    }
});

// POST - Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                message: 'Please enter a valid email / सही ईमेल भरें'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({
                message: 'Email not found / ईमेल नहीं मिला'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        // Save token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Configure and send email
        const mail = configureTransporter();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset - Salary Calculator',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a1a2e;">🔐 Password Reset Request</h2>
                    <p>Hello <strong>${user.username}</strong>,</p>
                    <p>You requested to reset your password. Click the button below to reset:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                        Reset Password
                    </a>
                    <p>Or copy this link: <br><code>${resetUrl}</code></p>
                    <p style="color: #666;">This link expires in 1 hour.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
                    <hr>
                    <p style="color: #999; font-size: 12px;">© Darsh Patel - WellBore Salary Calculator</p>
                </div>
            `
        };

        await mail.sendMail(mailOptions);

        res.json({
            message: 'Password reset email sent / ईमेल भेज दिया गया'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Could not send email / ईमेल नहीं भेज पाए' });
    }
});

// POST - Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        // Validate password
        if (!isValidPassword(password)) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters / पासवर्ड 6 अक्षर का होना चाहिए'
            });
        }

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired token / लिंक expired हो गया'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({
            message: 'Password reset successful / पासवर्ड बदल गया'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error / सर्वर में समस्या' });
    }
});

// PUT - Update salary rate
router.put('/salary', async (req, res) => {
    try {
        const { userId, dailySalaryRate } = req.body;

        if (!dailySalaryRate || dailySalaryRate <= 0) {
            return res.status(400).json({
                message: 'Please enter a valid salary / सही सैलरी भरें'
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
            message: 'Salary updated / सैलरी अपडेट हो गई',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                dailySalaryRate: user.dailySalaryRate
            }
        });
    } catch (error) {
        console.error('Update salary error:', error);
        res.status(500).json({ message: 'Server error / सर्वर में समस्या' });
    }
});

module.exports = router;
