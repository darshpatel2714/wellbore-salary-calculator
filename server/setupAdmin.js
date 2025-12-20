require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function setupAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const hashedPassword = await bcrypt.hash('darsh@2714', 10);

        // Check if admin exists
        let admin = await User.findOne({ isAdmin: true });

        if (admin) {
            admin.username = 'darsh patel';
            admin.email = 'admin@salary.com';
            admin.password = hashedPassword;
            await admin.save();
            console.log('Admin updated successfully!');
        } else {
            admin = new User({
                username: 'darsh patel',
                email: 'admin@salary.com',
                password: hashedPassword,
                isAdmin: true,
                dailySalaryRate: 0
            });
            await admin.save();
            console.log('Admin created successfully!');
        }

        console.log('Admin credentials:');
        console.log('Username: darsh patel');
        console.log('Password: darsh@2714');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

setupAdmin();
