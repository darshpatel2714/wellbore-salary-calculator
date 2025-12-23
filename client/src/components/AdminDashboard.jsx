import { useState, useEffect } from 'react';
import { Icons } from './Icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AdminDashboard({ admin, onLogout }) {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalEntries: 0, totalSalaryPaid: 0, pfPercentage: 12 });
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userEntries, setUserEntries] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ username: '', dailySalaryRate: '', pfNumber: '', empCode: '', department: '', designation: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPf, setEditingPf] = useState(false);
    const [newPfValue, setNewPfValue] = useState('');

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/admin/users`);
            const data = await response.json();
            if (response.ok) {
                setUsers(data.users || []);
                setStats(data.stats || { totalUsers: 0, totalEntries: 0, totalSalaryPaid: 0, pfPercentage: 12 });
                setNewPfValue(data.stats?.pfPercentage || 12);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePf = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/settings/pf`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pfPercentage: parseFloat(newPfValue), adminId: admin?.id })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'PF percentage updated successfully!', type: 'success' });
                setStats({ ...stats, pfPercentage: data.pfPercentage });
                setEditingPf(false);
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Server error', type: 'error' });
        }

        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const fetchUserEntries = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/entries/${userId}`);
            const data = await response.json();
            if (response.ok) {
                setUserEntries(data.entries || []);
                setSelectedUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditForm({
            username: user.username,
            dailySalaryRate: user.dailySalaryRate || '',
            pfNumber: user.pfNumber || '',
            empCode: user.empCode || '',
            department: user.department || '',
            designation: user.designation || ''
        });
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;

        try {
            const response = await fetch(`${API_URL}/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'User updated successfully!', type: 'success' });
                setEditingUser(null);
                fetchUsers();
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Server error', type: 'error' });
        }

        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}" and all their entries?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setMessage({ text: 'User deleted successfully!', type: 'success' });
                fetchUsers();
            } else {
                setMessage({ text: 'Failed to delete user', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Server error', type: 'error' });
        }

        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleDeleteEntry = async (entryId) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/entries/${entryId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setMessage({ text: 'Entry deleted successfully!', type: 'success' });
                if (selectedUser) {
                    fetchUserEntries(userEntries[0]?.userId);
                }
            } else {
                setMessage({ text: 'Failed to delete entry', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Server error', type: 'error' });
        }

        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-header-left">
                        <h1><Icons.Settings /> Admin Dashboard</h1>
                        <p>Manage all users and entries</p>
                    </div>
                    <button className="admin-logout-btn" onClick={onLogout}>
                        <Icons.LogOut /> Logout
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="admin-stats">
                <div className="stat-card">
                    <div className="stat-icon users">
                        <Icons.User />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalUsers}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon entries">
                        <Icons.BarChart />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.totalEntries}</span>
                        <span className="stat-label">Total Entries</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon salary">
                        <Icons.IndianRupee />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">₹{stats.totalSalaryPaid?.toLocaleString('en-IN')}</span>
                        <span className="stat-label">Total Salary Paid</span>
                    </div>
                </div>
                {/* PF Settings Card */}
                <div className="stat-card pf-card">
                    <div className="stat-icon pf">
                        <Icons.Calculator />
                    </div>
                    <div className="stat-info">
                        {editingPf ? (
                            <div className="pf-edit-form">
                                <input
                                    type="number"
                                    value={newPfValue}
                                    onChange={(e) => setNewPfValue(e.target.value)}
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    className="pf-input"
                                />
                                <span>%</span>
                                <button className="pf-save-btn" onClick={handleUpdatePf}>
                                    <Icons.CheckCircle />
                                </button>
                                <button className="pf-cancel-btn" onClick={() => { setEditingPf(false); setNewPfValue(stats.pfPercentage); }}>
                                    <Icons.XCircle />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="stat-value">{stats.pfPercentage}%</span>
                                <span className="stat-label">
                                    PF Rate
                                    <button className="pf-edit-btn" onClick={() => setEditingPf(true)}>
                                        <Icons.Edit />
                                    </button>
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <nav className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('users'); setSelectedUser(null); }}
                >
                    <Icons.User /> Users
                </button>
                <button
                    className={`admin-tab ${activeTab === 'entries' ? 'active' : ''}`}
                    onClick={() => setActiveTab('entries')}
                >
                    <Icons.Calendar /> Entries
                </button>
            </nav>

            {/* Message */}
            {message.text && (
                <div className={`admin-message ${message.type}`}>
                    {message.type === 'success' ? <Icons.CheckCircle /> : <Icons.XCircle />}
                    {message.text}
                </div>
            )}

            {/* Content */}
            <div className="admin-content">
                {loading ? (
                    <div className="admin-loading">
                        <Icons.Loader /> Loading...
                    </div>
                ) : activeTab === 'users' ? (
                    <>
                        {/* Search */}
                        <div className="admin-search">
                            <Icons.Search />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Users Table */}
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Daily Salary</th>
                                        <th>Entries</th>
                                        <th>Total Earned</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td className="username-cell">{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>₹{user.dailySalaryRate || 'Not set'}</td>
                                            <td>{user.entryCount}</td>
                                            <td className="salary-cell">₹{user.totalSalary?.toLocaleString('en-IN')}</td>
                                            <td>{formatDate(user.createdAt)}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="action-btn view"
                                                    onClick={() => {
                                                        fetchUserEntries(user.id);
                                                        setActiveTab('entries');
                                                    }}
                                                    title="View Entries"
                                                >
                                                    <Icons.Eye />
                                                </button>
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => handleEditUser(user)}
                                                    title="Edit User"
                                                >
                                                    <Icons.Edit />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                    title="Delete User"
                                                >
                                                    <Icons.Trash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        {/* User Entries View */}
                        {selectedUser ? (
                            <>
                                <div className="entries-header">
                                    <button className="back-btn" onClick={() => { setSelectedUser(null); setActiveTab('users'); }}>
                                        <Icons.ArrowLeft /> Back to Users
                                    </button>
                                    <h3>Entries for: {selectedUser.username} ({selectedUser.email})</h3>
                                </div>

                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>In Time</th>
                                                <th>Out Time</th>
                                                <th>Present Hrs</th>
                                                <th>OT Hrs</th>
                                                <th>Present Amt</th>
                                                <th>OT Amt</th>
                                                <th>PF</th>
                                                <th>Daily Salary</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userEntries.map(entry => (
                                                <tr key={entry._id}>
                                                    <td>{entry.date}</td>
                                                    <td>{entry.inTime}</td>
                                                    <td>{entry.outTime}</td>
                                                    <td>{entry.presentHours}</td>
                                                    <td>{entry.otHours}</td>
                                                    <td>₹{entry.presentAmount}</td>
                                                    <td>₹{entry.otAmount}</td>
                                                    <td>₹{entry.pf}</td>
                                                    <td className="salary-cell">₹{entry.dailySalary}</td>
                                                    <td className="actions-cell">
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => handleDeleteEntry(entry._id)}
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
                            </>
                        ) : (
                            <div className="select-user-prompt">
                                <Icons.User />
                                <p>Select a user from the Users tab to view their entries</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3><Icons.Edit /> Edit User</h3>
                            <button className="close-btn" onClick={() => setEditingUser(null)}>
                                <Icons.XCircle />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Daily Salary Rate (₹)</label>
                                <input
                                    type="number"
                                    value={editForm.dailySalaryRate}
                                    onChange={(e) => setEditForm({ ...editForm, dailySalaryRate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>PF Number</label>
                                <input
                                    type="text"
                                    value={editForm.pfNumber}
                                    onChange={(e) => setEditForm({ ...editForm, pfNumber: e.target.value })}
                                    placeholder="e.g. GJAHD0019137000/105"
                                />
                            </div>
                            <div className="form-group">
                                <label>Emp Code</label>
                                <input
                                    type="text"
                                    value={editForm.empCode}
                                    onChange={(e) => setEditForm({ ...editForm, empCode: e.target.value })}
                                    placeholder="e.g. 65"
                                />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input
                                    type="text"
                                    value={editForm.department}
                                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                    placeholder="e.g. 2507/a"
                                />
                            </div>
                            <div className="form-group">
                                <label>Designation</label>
                                <select
                                    value={editForm.designation}
                                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                                >
                                    <option value="">-- Select --</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="operator">Operator</option>
                                    <option value="helper">Helper</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="cancel-btn" onClick={() => setEditingUser(null)}>
                                Cancel
                            </button>
                            <button className="save-btn" onClick={handleSaveUser}>
                                <Icons.Save /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
