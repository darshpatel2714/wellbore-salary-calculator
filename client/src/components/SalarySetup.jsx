import { useState } from 'react';
import { Icons } from './Icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function SalarySetup({ userId, onComplete }) {
    const [salary, setSalary] = useState('');
    const [pfNumber, setPfNumber] = useState('');
    const [empCode, setEmpCode] = useState('');
    const [department, setDepartment] = useState('');
    const [designation, setDesignation] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const salaryValue = parseFloat(salary);
        if (!salaryValue || salaryValue <= 0) {
            setMessage({ text: 'कृपया सही सैलरी भरें / Enter valid salary', type: 'error' });
            return;
        }

        if (!pfNumber.trim()) {
            setMessage({ text: 'कृपया PF Number भरें / Enter PF Number', type: 'error' });
            return;
        }

        if (!empCode.trim()) {
            setMessage({ text: 'कृपया Emp Code भरें / Enter Emp Code', type: 'error' });
            return;
        }

        if (!department.trim()) {
            setMessage({ text: 'कृपया Department भरें / Enter Department', type: 'error' });
            return;
        }

        if (!designation) {
            setMessage({ text: 'कृपया Designation चुनें / Select Designation', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch(`${API_URL}/api/auth/salary`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    dailySalaryRate: salaryValue,
                    pfNumber: pfNumber.trim(),
                    empCode: empCode.trim(),
                    department: department.trim(),
                    designation: designation
                })
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
                    <h1><Icons.IndianRupee /> Employee Setup</h1>
                    <p>कर्मचारी जानकारी भरें</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Salary Field */}
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

                    {/* Employee Details Section */}
                    <div className="employee-details-section">
                        <h3><Icons.User /> Employee Details</h3>

                        {/* PF Number */}
                        <div className="form-group">
                            <label>PF Number</label>
                            <input
                                type="text"
                                value={pfNumber}
                                onChange={(e) => setPfNumber(e.target.value)}
                                placeholder="जैसे: GJAHD0019137000/105"
                                className="text-input"
                            />
                        </div>

                        {/* Emp Code */}
                        <div className="form-group">
                            <label>Emp Code / कर्मचारी कोड</label>
                            <input
                                type="text"
                                value={empCode}
                                onChange={(e) => setEmpCode(e.target.value)}
                                placeholder="जैसे: 65"
                                className="text-input"
                            />
                        </div>

                        {/* Department */}
                        <div className="form-group">
                            <label>Department / विभाग</label>
                            <input
                                type="text"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="जैसे: 2507/a"
                                className="text-input"
                            />
                        </div>

                        {/* Designation Dropdown */}
                        <div className="form-group">
                            <label>Designation / पद</label>
                            <select
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                className="select-input"
                            >
                                <option value="">-- Select Designation --</option>
                                <option value="supervisor">Supervisor / सुपरवाइजर</option>
                                <option value="operator">Operator / ऑपरेटर</option>
                                <option value="helper">Helper / हेल्पर</option>
                            </select>
                        </div>
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
                    <p><Icons.Edit /> आप बाद में Settings में जानकारी बदल सकते हैं</p>
                    <p>You can change details later in Settings</p>
                </div>
            </div>
        </div>
    );
}

export default SalarySetup;
