const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    dailySalaryRate: {
        type: Number,
        default: null
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    pfNumber: {
        type: String,
        default: null,
        trim: true
    },
    empCode: {
        type: String,
        default: null,
        trim: true
    },
    department: {
        type: String,
        default: null,
        trim: true
    },
    designation: {
        type: String,
        enum: ['supervisor', 'operator', 'helper', null],
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
