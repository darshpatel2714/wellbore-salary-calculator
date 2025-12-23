import { useState } from 'react';
import { Icons } from './Icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Settings({ user, onUpdate, onBack }) {
    const [salary, setSalary] = useState(user.dailySalaryRate?.toString() || '');
    const [pfNumber, setPfNumber] = useState(user.pfNumber || '');
    const [empCode, setEmpCode] = useState(user.empCode || '');
    const [department, setDepartment] = useState(user.department || '');
    const [designation, setDesignation] = useState(user.designation || '');

    const [editingField, setEditingField] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSaveField = async (field, value) => {
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const updateData = { userId: user.id, dailySalaryRate: user.dailySalaryRate };
            updateData[field] = value;

            const response = await fetch(`${API_URL}/api/auth/salary`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: `${field} updated successfully!`, type: 'success' });
                onUpdate(data.user);
                setEditingField(null);
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Server से कनेक्ट नहीं हो पाया', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

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
                setMessage({ text: 'Salary updated successfully!', type: 'success' });
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

    const getDesignationLabel = (value) => {
        const labels = {
            'supervisor': 'Supervisor / सुपरवाइजर',
            'operator': 'Operator / ऑपरेटर',
            'helper': 'Helper / हेल्पर'
        };
        return labels[value] || value || 'Not Set';
    };

    return (
        <div className="settings">
            <h2><Icons.Settings /> सेटिंग्स / Settings</h2>

            {/* Employee Details Card */}
            <div className="settings-card employee-card">
                <h3><Icons.User /> Employee Details / कर्मचारी जानकारी</h3>

                {/* PF Number */}
                <div className="info-row">
                    <span className="info-label">PF Number:</span>
                    {editingField === 'pfNumber' ? (
                        <div className="edit-inline">
                            <input
                                type="text"
                                value={pfNumber}
                                onChange={(e) => setPfNumber(e.target.value)}
                                className="edit-input"
                                autoFocus
                            />
                            <button className="save-icon-btn" onClick={() => handleSaveField('pfNumber', pfNumber)} disabled={loading}>
                                <Icons.CheckCircle />
                            </button>
                            <button className="cancel-icon-btn" onClick={() => { setEditingField(null); setPfNumber(user.pfNumber || ''); }}>
                                <Icons.XCircle />
                            </button>
                        </div>
                    ) : (
                        <div className="info-value-row">
                            <span className="info-value">{user.pfNumber || 'Not Set'}</span>
                            <button className="edit-icon-btn" onClick={() => setEditingField('pfNumber')}>
                                <Icons.Edit />
                            </button>
                        </div>
                    )}
                </div>

                {/* Emp Code */}
                <div className="info-row">
                    <span className="info-label">Emp Code:</span>
                    {editingField === 'empCode' ? (
                        <div className="edit-inline">
                            <input
                                type="text"
                                value={empCode}
                                onChange={(e) => setEmpCode(e.target.value)}
                                className="edit-input"
                                autoFocus
                            />
                            <button className="save-icon-btn" onClick={() => handleSaveField('empCode', empCode)} disabled={loading}>
                                <Icons.CheckCircle />
                            </button>
                            <button className="cancel-icon-btn" onClick={() => { setEditingField(null); setEmpCode(user.empCode || ''); }}>
                                <Icons.XCircle />
                            </button>
                        </div>
                    ) : (
                        <div className="info-value-row">
                            <span className="info-value">{user.empCode || 'Not Set'}</span>
                            <button className="edit-icon-btn" onClick={() => setEditingField('empCode')}>
                                <Icons.Edit />
                            </button>
                        </div>
                    )}
                </div>

                {/* Department */}
                <div className="info-row">
                    <span className="info-label">Department:</span>
                    {editingField === 'department' ? (
                        <div className="edit-inline">
                            <input
                                type="text"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="edit-input"
                                autoFocus
                            />
                            <button className="save-icon-btn" onClick={() => handleSaveField('department', department)} disabled={loading}>
                                <Icons.CheckCircle />
                            </button>
                            <button className="cancel-icon-btn" onClick={() => { setEditingField(null); setDepartment(user.department || ''); }}>
                                <Icons.XCircle />
                            </button>
                        </div>
                    ) : (
                        <div className="info-value-row">
                            <span className="info-value">{user.department || 'Not Set'}</span>
                            <button className="edit-icon-btn" onClick={() => setEditingField('department')}>
                                <Icons.Edit />
                            </button>
                        </div>
                    )}
                </div>

                {/* Designation */}
                <div className="info-row">
                    <span className="info-label">Designation:</span>
                    {editingField === 'designation' ? (
                        <div className="edit-inline">
                            <select
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                className="edit-select"
                                autoFocus
                            >
                                <option value="">-- Select --</option>
                                <option value="supervisor">Supervisor / सुपरवाइजर</option>
                                <option value="operator">Operator / ऑपरेटर</option>
                                <option value="helper">Helper / हेल्पर</option>
                            </select>
                            <button className="save-icon-btn" onClick={() => handleSaveField('designation', designation)} disabled={loading}>
                                <Icons.CheckCircle />
                            </button>
                            <button className="cancel-icon-btn" onClick={() => { setEditingField(null); setDesignation(user.designation || ''); }}>
                                <Icons.XCircle />
                            </button>
                        </div>
                    ) : (
                        <div className="info-value-row">
                            <span className="info-value">{getDesignationLabel(user.designation)}</span>
                            <button className="edit-icon-btn" onClick={() => setEditingField('designation')}>
                                <Icons.Edit />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Salary Settings Card */}
            <div className="settings-card">
                <h3><Icons.IndianRupee /> सैलरी सेटिंग / Salary Settings</h3>

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

                    <div className="settings-note">
                        <p><Icons.AlertTriangle /> सैलरी बदलने पर पुरानी एंट्री नहीं बदलेंगी</p>
                        <p>Old entries will not change when salary is updated</p>
                    </div>

                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? <><Icons.Loader /> अपडेट हो रहा है...</> : <><Icons.Save /> सैलरी अपडेट करें</>}
                    </button>
                </form>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.type === 'success' ? <Icons.CheckCircle /> : <Icons.XCircle />}
                    {message.text}
                </div>
            )}

            <button className="back-btn" onClick={onBack}>
                <Icons.ArrowLeft /> वापस जाएं / Go Back
            </button>
        </div>
    );
}

export default Settings;
