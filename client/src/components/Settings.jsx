import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Settings({ user, onUpdate, onBack }) {
    const [salary, setSalary] = useState(user.dailySalaryRate?.toString() || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const salaryValue = parseFloat(salary);
        if (!salaryValue || salaryValue <= 0) {
            setMessage({ text: 'कृपया सही सैलरी भरें / Enter valid salary', type: 'error' });
            return;
        }

        if (salaryValue === user.dailySalaryRate) {
            setMessage({ text: 'सैलरी पहले जैसी ही है / Salary is unchanged', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch(`${API_URL}/api/auth/salary`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, dailySalaryRate: salaryValue })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: '✅ सैलरी अपडेट हो गई! नई एंट्री में नई सैलरी लागू होगी।', type: 'success' });
                onUpdate(data.user);
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
        <div className="settings">
            <h2>⚙️ सेटिंग्स / Settings</h2>

            <div className="settings-card">
                <h3>👤 प्रोफाइल / Profile</h3>
                <div className="profile-info">
                    <p><strong>नाम / Name:</strong> {user.name}</p>
                    <p><strong>यूजरनेम / Username:</strong> {user.username}</p>
                </div>
            </div>

            <div className="settings-card">
                <h3>💰 सैलरी सेटिंग / Salary Settings</h3>

                <div className="current-salary">
                    <p>वर्तमान 8-घंटे सैलरी / Current 8-Hour Salary:</p>
                    <span className="salary-amount">₹{user.dailySalaryRate?.toLocaleString('en-IN') || 'Not Set'}</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>नई सैलरी / New Salary (₹)</label>
                        <input
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            placeholder="नई सैलरी भरें"
                            className="salary-input"
                            min="1"
                            step="1"
                        />
                    </div>

                    {salary && parseFloat(salary) > 0 && (
                        <div className="salary-preview">
                            <p>प्रति घंटा / Hourly: <strong>₹{(parseFloat(salary) / 8).toFixed(2)}</strong></p>
                            <p>PF (12%): <strong>₹{(parseFloat(salary) * 0.12).toFixed(2)}</strong></p>
                        </div>
                    )}

                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="settings-note">
                        <p>⚠️ सैलरी बदलने पर पुरानी एंट्री नहीं बदलेंगी</p>
                        <p>Old entries will not change when salary is updated</p>
                    </div>

                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? '⏳ अपडेट हो रहा है...' : '💾 सैलरी अपडेट करें'}
                    </button>
                </form>
            </div>

            <button className="back-btn" onClick={onBack}>
                ← वापस जाएं / Go Back
            </button>
        </div>
    );
}

export default Settings;
