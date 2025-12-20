import { useState } from 'react';
import { Icons } from './Icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AdminLogin({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!username || !password) {
            setMessage({ text: 'Please enter username and password', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Login successful!', type: 'success' });
                // Store admin session
                localStorage.setItem('adminSession', JSON.stringify(data.admin));
                setTimeout(() => onLogin(data.admin), 500);
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Server error', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-box">
                <div className="admin-login-header">
                    <div className="admin-icon">
                        <Icons.Shield />
                    </div>
                    <h1>Admin Portal</h1>
                    <p>Salary Calculator Management</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter admin username"
                            className="admin-input"
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                className="admin-input"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                            </button>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.type === 'success' ? <Icons.CheckCircle /> : <Icons.XCircle />}
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading ? (
                            <><Icons.Loader /> Authenticating...</>
                        ) : (
                            <><Icons.Lock /> Login to Dashboard</>
                        )}
                    </button>
                </form>

                <div className="admin-back-link">
                    <a href="/">← Back to User App</a>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
