const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Entry = require('../models/Entry');
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');

// Default PF percentage
const DEFAULT_PF_RATE = 12;

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }

        // Find admin user
        const admin = await User.findOne({
            username: username.toLowerCase(),
            isAdmin: true
        });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        res.json({
            message: 'Admin login successful',
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get PF percentage
router.get('/settings/pf', async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'pfPercentage' });
        res.json({
            pfPercentage: setting ? setting.value : DEFAULT_PF_RATE
        });
    } catch (error) {
        console.error('Get PF error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update PF percentage
router.put('/settings/pf', async (req, res) => {
    try {
        const { pfPercentage, adminId } = req.body;

        if (pfPercentage === undefined || pfPercentage < 0 || pfPercentage > 50) {
            return res.status(400).json({ message: 'PF percentage must be between 0 and 50' });
        }

        const setting = await Settings.findOneAndUpdate(
            { key: 'pfPercentage' },
            {
                key: 'pfPercentage',
                value: pfPercentage,
                updatedBy: adminId
            },
            { upsert: true, new: true }
        );

        res.json({
            message: 'PF percentage updated successfully',
            pfPercentage: setting.value
        });
    } catch (error) {
        console.error('Update PF error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users with stats
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ isAdmin: { $ne: true } })
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 });

        // Get entry counts for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const entryCount = await Entry.countDocuments({ userId: user._id });
            const totalSalary = await Entry.aggregate([
                { $match: { userId: user._id } },
                { $group: { _id: null, total: { $sum: '$dailySalary' } } }
            ]);

            return {
                id: user._id,
                email: user.email,
                username: user.username,
                dailySalaryRate: user.dailySalaryRate,
                createdAt: user.createdAt,
                entryCount,
                totalSalary: totalSalary[0]?.total || 0
            };
        }));

        // Get overall stats
        const totalUsers = users.length;
        const totalEntries = await Entry.countDocuments();
        const totalSalaryPaid = await Entry.aggregate([
            { $group: { _id: null, total: { $sum: '$dailySalary' } } }
        ]);

        // Get PF setting
        const pfSetting = await Settings.findOne({ key: 'pfPercentage' });

        res.json({
            users: usersWithStats,
            stats: {
                totalUsers,
                totalEntries,
                totalSalaryPaid: totalSalaryPaid[0]?.total || 0,
                pfPercentage: pfSetting ? pfSetting.value : DEFAULT_PF_RATE
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user
router.put('/users/:id', async (req, res) => {
    try {
        const { username, dailySalaryRate } = req.body;
        const userId = req.params.id;

        const updateData = {};
        if (username) updateData.username = username.toLowerCase();
        if (dailySalaryRate) updateData.dailySalaryRate = dailySalaryRate;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
            .select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                dailySalaryRate: user.dailySalaryRate
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user and all their entries
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Delete all entries for this user
        await Entry.deleteMany({ userId });

        // Delete user
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User and all entries deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get entries for a specific user
router.get('/entries/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { year, month } = req.query;

        let query = { userId };

        if (year && month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            query.date = {
                $gte: startDate.toISOString().split('T')[0],
                $lte: endDate.toISOString().split('T')[0]
            };
        }

        const entries = await Entry.find(query).sort({ date: -1 });

        const user = await User.findById(userId).select('username email');

        res.json({
            user: user ? { username: user.username, email: user.email } : null,
            entries
        });
    } catch (error) {
        console.error('Get entries error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update entry
router.put('/entries/:entryId', async (req, res) => {
    try {
        const { entryId } = req.params;
        const { inTime, outTime, presentHours, otHours, presentAmount, otAmount, pf, dailySalary } = req.body;

        const entry = await Entry.findByIdAndUpdate(
            entryId,
            { inTime, outTime, presentHours, otHours, presentAmount, otAmount, pf, dailySalary },
            { new: true }
        );

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.json({
            message: 'Entry updated successfully',
            entry
        });
    } catch (error) {
        console.error('Update entry error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete entry
router.delete('/entries/:entryId', async (req, res) => {
    try {
        const { entryId } = req.params;

        const entry = await Entry.findByIdAndDelete(entryId);

        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        console.error('Delete entry error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create admin user (one-time setup)
router.post('/setup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await User.findOne({ isAdmin: true });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingAdmin) {
            // Update existing admin
            existingAdmin.username = username.toLowerCase();
            existingAdmin.email = email.toLowerCase();
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();

            return res.json({ message: 'Admin updated successfully' });
        }

        // Create new admin
        const admin = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            isAdmin: true,
            dailySalaryRate: 0
        });

        await admin.save();

        res.json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error('Admin setup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
