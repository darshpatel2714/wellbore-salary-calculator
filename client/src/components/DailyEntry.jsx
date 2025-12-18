import { useState } from 'react';
import { getTodayDate, calculateHours } from '../utils/salaryCalculations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const FULL_DAY_HOURS = 8;
const PF_RATE = 0.12;

// Round time according to company rules:
// >45 minutes → round up to next hour
// ≤15 minutes → round down to current hour
// 16-45 minutes → round to :30 (half hour)
function roundTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);

    let roundedHours = hours;
    let roundedMinutes = 0;

    if (minutes > 45) {
        roundedHours = hours + 1;
        roundedMinutes = 0;
    } else if (minutes <= 15) {
        roundedHours = hours;
        roundedMinutes = 0;
    } else {
        roundedHours = hours;
        roundedMinutes = 30;
    }

    if (roundedHours >= 24) {
        roundedHours = roundedHours - 24;
    }

    return `${String(roundedHours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
}

// Calculate salary using user's daily rate
function calculateSalaryWithRate(totalHours, dailyRate) {
    const hourlyRate = dailyRate / FULL_DAY_HOURS;
    const presentHours = Math.min(FULL_DAY_HOURS, totalHours);
    const otHours = Math.max(0, totalHours - FULL_DAY_HOURS);

    const presentAmount = presentHours >= FULL_DAY_HOURS
        ? dailyRate
        : presentHours * hourlyRate;

    const otAmount = otHours * hourlyRate;
    const pf = presentAmount * PF_RATE;
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

function DailyEntry({ userId, dailySalaryRate }) {
    const [date] = useState(getTodayDate());
    const [inTime, setInTime] = useState('');
    const [outTime, setOutTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [preview, setPreview] = useState(null);
    const [roundedTimes, setRoundedTimes] = useState({ inTime: '', outTime: '' });

    // Calculate preview when times change
    const handleTimeChange = (newInTime, newOutTime) => {
        if (newInTime && newOutTime) {
            // Apply rounding
            const roundedIn = roundTime(newInTime);
            const roundedOut = roundTime(newOutTime);
            setRoundedTimes({ inTime: roundedIn, outTime: roundedOut });

            // Calculate hours using ROUNDED times
            const hours = calculateHours(roundedIn, roundedOut);
            if (hours > 0) {
                setPreview(calculateSalaryWithRate(hours, dailySalaryRate));
            } else {
                setPreview(null);
            }
        } else {
            setPreview(null);
            setRoundedTimes({ inTime: '', outTime: '' });
        }
    };

    const handleInTimeChange = (e) => {
        const value = e.target.value;
        setInTime(value);
        handleTimeChange(value, outTime);
    };

    const handleOutTimeChange = (e) => {
        const value = e.target.value;
        setOutTime(value);
        handleTimeChange(inTime, value);
    };

    const handleSubmit = async () => {
        if (!inTime || !outTime) {
            setMessage({ text: 'कृपया In Time और Out Time भरें', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch(`${API_URL}/api/entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, date, inTime, outTime })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: '✅ सेव हो गया! Entry Saved!', type: 'success' });
                setInTime('');
                setOutTime('');
                setPreview(null);
                setRoundedTimes({ inTime: '', outTime: '' });
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Server से कनेक्ट नहीं हो पाया', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="daily-entry">
            <h2>📅 आज की एंट्री / Daily Entry</h2>

            <div className="salary-badge">
                💰 आपकी सैलरी: ₹{dailySalaryRate?.toLocaleString('en-IN')}/day
            </div>

            <div className="form-group">
                <label>तारीख / Date</label>
                <input
                    type="date"
                    value={date}
                    readOnly
                    className="date-input"
                />
            </div>

            <div className="form-group">
                <label>आने का समय / In Time</label>
                <input
                    type="time"
                    value={inTime}
                    onChange={handleInTimeChange}
                    className="time-input"
                />
                {roundedTimes.inTime && inTime !== roundedTimes.inTime && (
                    <div className="rounded-time">
                        ⏰ कंपनी टाइम: <strong>{roundedTimes.inTime}</strong>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label>जाने का समय / Out Time</label>
                <input
                    type="time"
                    value={outTime}
                    onChange={handleOutTimeChange}
                    className="time-input"
                />
                {roundedTimes.outTime && outTime !== roundedTimes.outTime && (
                    <div className="rounded-time">
                        ⏰ कंपनी टाइम: <strong>{roundedTimes.outTime}</strong>
                    </div>
                )}
            </div>

            {preview && (
                <div className="preview-box">
                    <h3>📊 आज का हिसाब / Today's Calculation</h3>
                    <div className="time-summary">
                        🕐 {roundedTimes.inTime} → {roundedTimes.outTime} = {preview.presentHours + preview.otHours} hrs
                    </div>
                    <div className="preview-grid">
                        <div className="preview-item">
                            <span className="label">Present Hours</span>
                            <span className="value">{preview.presentHours} hrs</span>
                        </div>
                        <div className="preview-item">
                            <span className="label">OT Hours</span>
                            <span className="value">{preview.otHours} hrs</span>
                        </div>
                        <div className="preview-item">
                            <span className="label">Present Amount</span>
                            <span className="value">₹{preview.presentAmount}</span>
                        </div>
                        <div className="preview-item">
                            <span className="label">OT Amount</span>
                            <span className="value">₹{preview.otAmount}</span>
                        </div>
                        <div className="preview-item">
                            <span className="label">PF (12%)</span>
                            <span className="value">-₹{preview.pf}</span>
                        </div>
                        <div className="preview-item highlight">
                            <span className="label">आज की सैलरी</span>
                            <span className="value">₹{preview.dailySalary}</span>
                        </div>
                    </div>
                </div>
            )}

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <button
                className="save-btn"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? '⏳ सेव हो रहा है...' : '💾 सेव करें / SAVE'}
            </button>
        </div>
    );
}

export default DailyEntry;
