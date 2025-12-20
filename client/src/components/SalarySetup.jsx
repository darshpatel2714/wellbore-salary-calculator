import { useState } from 'react';
import { Icons } from './Icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function SalarySetup({ userId, onComplete }) {
    const [salary, setSalary] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const salaryValue = parseFloat(salary);
        if (!salaryValue || salaryValue <= 0) {
            setMessage({ text: 'कृपया सही सैलरी भरें / Enter valid salary', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch(`${API_URL}/api/auth/salary`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, dailySalaryRate: salaryValue })
            });

            const data = await response.json();

            if (response.ok) {
                onComplete(data.user);
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
        <div className="login-container">
            <div className="setup-box">
                <div className="setup-header">
                    <h1><Icons.IndianRupee /> सैलरी सेटअप</h1>
                    <p>Salary Setup</p>
                </div>

                <div className="setup-info">
                    <p><Icons.Calculator /> एक बार अपनी <strong>8 घंटे की सैलरी</strong> बताएं</p>
                    <p>Enter your <strong>full day (8 hours) salary</strong> once</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>8 घंटे की सैलरी / 8-Hour Salary (₹)</label>
                        <input
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            placeholder="जैसे: 1355"
                            className="salary-input"
                            min="1"
                            step="1"
                        />
                    </div>

                    <div className="salary-preview">
                        {salary && parseFloat(salary) > 0 && (
                            <>
                                <p>प्रति घंटा / Hourly Rate: <strong>₹{(parseFloat(salary) / 8).toFixed(2)}</strong></p>
                                <p>PF (12%): <strong>₹{(parseFloat(salary) * 0.12).toFixed(2)}</strong></p>
                            </>
                        )}
                    </div>

                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.type === 'success' ? <Icons.CheckCircle /> : <Icons.XCircle />}
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="setup-btn" disabled={loading}>
                        {loading ? <><Icons.Loader /> सेव हो रहा है...</> : <><Icons.CheckCircle /> सेव करें और आगे बढ़ें</>}
                    </button>
                </form>

                <div className="settings-note">
                    <p><Icons.Edit /> आप बाद में Settings में सैलरी बदल सकते हैं</p>
                    <p>You can change salary later in Settings</p>
                </div>
            </div>
        </div>
    );
}

export default SalarySetup;
