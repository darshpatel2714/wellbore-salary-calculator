# Daily Salary Calculator

A mobile-friendly salary calculator web application built for WellBore Engineering Co.

## Features

- 🔐 User Authentication (Signup/Login)
- 💰 User-specific 8-hour salary rate
- ⏰ Company Time Rounding Rules
- 📊 Monthly View with PDF Download
- 🗑️ Delete entries with confirmation
- 📱 Fully Responsive (Mobile, Tablet, Desktop)

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **PDF:** jsPDF + jsPDF-AutoTable

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/salary-calculator.git
cd salary-calculator
```

### 2. Install dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Setup Environment Variables

Create `server/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

### 4. Run the Application

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run dev
```

Open http://localhost:5173

## Salary Calculation

| Field | Formula |
|-------|---------|
| Hourly Rate | 8-hour salary ÷ 8 |
| Present Amount | 8-hour salary |
| OT Amount | Hourly Rate × OT Hours |
| PF | 12% of Present Amount |
| Daily Salary | (Present + OT) - PF |

## Time Rounding Rules

| Time | Rounded To |
|------|------------|
| :00 - :15 | :00 |
| :16 - :45 | :30 |
| :46 - :59 | :00 (next hour) |

## Author

© Darsh Patel
