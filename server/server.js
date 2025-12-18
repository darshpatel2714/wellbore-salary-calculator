require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const entriesRouter = require('./routes/entries');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected / डेटाबेस जुड़ गया'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/entries', entriesRouter);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Salary Calculator API is running / सैलरी कैलकुलेटर API चल रहा है' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
