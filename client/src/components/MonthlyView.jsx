import { useState, useEffect } from 'react';
import { formatDateDisplay } from '../utils/salaryCalculations';
import { Icons } from './Icons';
import PDFDownload from './PDFDownload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function MonthlyView({ userId }) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [entries, setEntries] = useState([]);
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState({ text: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 2; y <= currentYear + 1; y++) {
        years.push(y);
    }

    useEffect(() => {
        fetchEntries();
    }, [year, month, userId]);

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/entries/${userId}/${year}/${month}`);
            const data = await response.json();
            setEntries(data.entries || []);
            setMonthlyTotal(data.monthlyTotal || 0);
        } catch (error) {
            console.error('Error fetching entries:', error);
            setEntries([]);
            setMonthlyTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (entry) => {
        setConfirmDelete(entry);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${API_URL}/api/entries/${confirmDelete._id}/${userId}`,
                { method: 'DELETE' }
            );

            const data = await response.json();

            if (response.ok) {
                setDeleteMessage({ text: 'Entry deleted successfully!', type: 'success' });
                setConfirmDelete(null);
                fetchEntries();
                setTimeout(() => setDeleteMessage({ text: '', type: '' }), 3000);
            } else {
                setDeleteMessage({ text: data.message, type: 'error' });
                setTimeout(() => setDeleteMessage({ text: '', type: '' }), 3000);
            }
        } catch (error) {
            setDeleteMessage({ text: 'Server से कनेक्ट नहीं हो पाया', type: 'error' });
            setTimeout(() => setDeleteMessage({ text: '', type: '' }), 3000);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDelete(null);
    };

    return (
        <div className="monthly-view">
            <h2><Icons.BarChart /> महीने का हिसाब / Monthly View</h2>

            <div className="filters">
                <div className="filter-group">
                    <label>महीना / Month</label>
                    <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        {months.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>साल / Year</label>
                    <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {deleteMessage.text && (
                <div className={`delete-message ${deleteMessage.type}`}>
                    {deleteMessage.type === 'success' ? <Icons.CheckCircle /> : <Icons.XCircle />}
                    {deleteMessage.text}
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmDelete && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <h3><Icons.AlertTriangle /> क्या आप सच में डिलीट करना चाहते हैं?</h3>
                        <p>Are you sure you want to delete this entry?</p>
                        <div className="confirm-details">
                            <p><strong>तारीख:</strong> {formatDateDisplay(confirmDelete.date)}</p>
                            <p><strong>टाइम:</strong> {confirmDelete.inTime} - {confirmDelete.outTime}</p>
                            <p><strong>सैलरी:</strong> ₹{confirmDelete.dailySalary}</p>
                        </div>
                        <div className="confirm-buttons">
                            <button className="cancel-btn" onClick={handleCancelDelete}>
                                <Icons.XCircle /> रद्द करें / Cancel
                            </button>
                            <button className="delete-confirm-btn" onClick={handleConfirmDelete}>
                                <Icons.Trash2 /> हाँ, डिलीट करें / Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loading"><Icons.Loader /> लोड हो रहा है...</div>
            ) : entries.length === 0 ? (
                <div className="no-data">इस महीने कोई एंट्री नहीं है / No entries this month</div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="salary-table">
                            <thead>
                                <tr>
                                    <th>तारीख</th>
                                    <th>In</th>
                                    <th>Out</th>
                                    <th>Hrs</th>
                                    <th>OT</th>
                                    <th>Amt</th>
                                    <th>OT₹</th>
                                    <th>PF</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{formatDateDisplay(entry.date)}</td>
                                        <td>{entry.inTime}</td>
                                        <td>{entry.outTime}</td>
                                        <td>{entry.presentHours}</td>
                                        <td>{entry.otHours}</td>
                                        <td>₹{entry.presentAmount}</td>
                                        <td>₹{entry.otAmount}</td>
                                        <td>₹{entry.pf}</td>
                                        <td className="total-cell">₹{entry.dailySalary}</td>
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteClick(entry)}
                                                title="Delete Entry"
                                            >
                                                <Icons.Trash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="monthly-total">
                        <span><Icons.TrendingUp /> महीने की कुल सैलरी / Monthly Total:</span>
                        <span className="total-amount">₹{monthlyTotal.toLocaleString('en-IN')}</span>
                    </div>

                    <PDFDownload
                        entries={entries}
                        month={months[month - 1]}
                        year={year}
                        monthlyTotal={monthlyTotal}
                    />
                </>
            )}
        </div>
    );
}

export default MonthlyView;
