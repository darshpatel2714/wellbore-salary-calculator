const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const User = require('../models/User');
const Settings = require('../models/Settings');

const FULL_DAY_HOURS = 8;
const DEFAULT_PF_RATE = 0.12;

// Get current PF rate from database
async function getPfRate() {
    try {
        const setting = await Settings.findOne({ key: 'pfPercentage' });
        return setting ? setting.value / 100 : DEFAULT_PF_RATE;
    } catch (error) {
        return DEFAULT_PF_RATE;
    }
}

// Public route to get current PF percentage
router.get('/settings/pf', async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'pfPercentage' });
        res.json({
            pfPercentage: setting ? setting.value : 12
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Round time according to company rules:
// >45 minutes → round up to next hour
// ≤15 minutes → round down to current hour
// 16-45 minutes → round to :30 (half hour)
function roundTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);

    let roundedHours = hours;
    let roundedMinutes = 0;

    if (minutes > 45) {
        // Round up to next hour
        roundedHours = hours + 1;
        roundedMinutes = 0;
    } else if (minutes <= 15) {
        // Round down to current hour
        roundedHours = hours;
        roundedMinutes = 0;
    } else {
        // 16-45: round to half hour
        roundedHours = hours;
        roundedMinutes = 30;
    }

    // Handle hour overflow (e.g., 24:00 → 00:00)
    if (roundedHours >= 24) {
        roundedHours = roundedHours - 24;
    }

    return `${String(roundedHours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
}

// Calculate working hours from rounded in/out time
function calculateHours(inTime, outTime) {
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);

    const inMinutes = inH * 60 + inM;
    const outMinutes = outH * 60 + outM;

    return (outMinutes - inMinutes) / 60;
}

// Calculate salary details using user's daily rate and dynamic PF
function calculateSalary(totalHours, dailyRate, pfRate) {
    const hourlyRate = dailyRate / FULL_DAY_HOURS;
    const presentHours = Math.min(FULL_DAY_HOURS, totalHours);
    const otHours = Math.max(0, totalHours - FULL_DAY_HOURS);

    // Present amount is prorated if less than 8 hours
    const presentAmount = presentHours >= FULL_DAY_HOURS
        ? dailyRate
        : presentHours * hourlyRate;

    const otAmount = otHours * hourlyRate;

    // PF is ONLY on present amount, NOT on OT
    const pf = presentAmount * pfRate;

    const dailySalary = (presentAmount + otAmount) - pf;

    return {
        presentHours: Math.round(presentHours * 100) / 100,
        otHours: Math.round(otHours * 100) / 100,
        presentAmount: Math.round(presentAmount * 100) / 100,
        otAmount: Math.round(otAmount * 100) / 100,
        pf: Math.round(pf * 100) / 100,
        dailySalary: Math.round(dailySalary * 100) / 100
    };
}

// POST - Create new entry
router.post('/', async (req, res) => {
    try {
        const { userId, date, inTime, outTime } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: 'User ID required / यूजर ID जरूरी है'
            });
        }

        // Get user's salary rate
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found / यूजर नहीं मिला'
            });
        }

        // Check if user has set their salary rate
        if (!user.dailySalaryRate) {
            return res.status(400).json({
                message: 'Please set your 8-hour salary first / पहले अपनी 8 घंटे की सैलरी सेट करें'
            });
        }

        // Check if entry already exists for this date AND user
        const existingEntry = await Entry.findOne({
            userId,
            date: new Date(date)
        });

        if (existingEntry) {
            return res.status(400).json({
                message: 'Entry already exists for this date / इस तारीख के लिए पहले से एंट्री है'
            });
        }

        // Apply company time rounding rules
        const roundedInTime = roundTime(inTime);
        const roundedOutTime = roundTime(outTime);

        // Calculate hours using ROUNDED times
        const totalHours = calculateHours(roundedInTime, roundedOutTime);

        if (totalHours <= 0) {
            return res.status(400).json({
                message: 'Invalid time - Out Time must be after In Time / आउट टाइम इन टाइम के बाद होना चाहिए'
            });
        }

        // Get current PF rate
        const pfRate = await getPfRate();
        const salaryDetails = calculateSalary(totalHours, user.dailySalaryRate, pfRate);

        const entry = new Entry({
            userId,
            date: new Date(date),
            inTime: roundedInTime,       // Store rounded time
            outTime: roundedOutTime,     // Store rounded time
            originalInTime: inTime,      // Store original for reference
            originalOutTime: outTime,    // Store original for reference
            usedDailySalaryRate: user.dailySalaryRate,
            ...salaryDetails
        });

        await entry.save();
        res.status(201).json(entry);
    } catch (error) {
        console.error('Error saving entry:', error);
        res.status(500).json({ message: 'Server error / सर्वर में समस्या' });
    }
});

// GET - Get all entries for a month/year for a specific user
router.get('/:userId/:year/:month', async (req, res) => {
    try {
        const { userId, year, month } = req.params;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const entries = await Entry.find({
            userId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        // Calculate monthly total
        const monthlyTotal = entries.reduce((sum, entry) => sum + entry.dailySalary, 0);

        res.json({
            entries,
            monthlyTotal: Math.round(monthlyTotal * 100) / 100
        });
    } catch (error) {
        console.error('Error fetching entries:', error);
        res.status(500).json({ message: 'Server error / सर्वर में समस्या' });
    }
});

// GET - Check if entry exists for a date for a specific user
router.get('/date/:userId/:date', async (req, res) => {
    try {
        const { userId, date } = req.params;
        const entry = await Entry.findOne({ userId, date: new Date(date) });
        res.json({ exists: !!entry, entry });
    } catch (error) {
        console.error('Error checking entry:', error);
        res.status(500).json({ message: 'Server error / सर्वर में समस्या' });
    }
});

// DELETE - Delete an entry (only own entries)
router.delete('/:entryId/:userId', async (req, res) => {
    try {
        const { entryId, userId } = req.params;

        // Find the entry and verify it belongs to this user
        const entry = await Entry.findOne({ _id: entryId, userId });

        if (!entry) {
            return res.status(404).json({
                message: 'Entry not found or not authorized / एंट्री नहीं मिली'
            });
        }

        // Delete the entry
        await Entry.deleteOne({ _id: entryId, userId });

        res.json({
            message: 'Entry deleted successfully / एंट्री डिलीट हो गई',
            deletedEntry: entry
        });
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.status(500).json({ message: 'Server error / सर्वर में समस्या' });
    }
});

module.exports = router;
