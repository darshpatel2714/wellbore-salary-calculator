import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Login({ onLogin }) {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Check for saved credentials on mount
    useEffect(() => {
        const savedCredentials = localStorage.getItem('salaryAppCredentials');
        if (savedCredentials) {
            const { username: savedUser, password: savedPass } = JSON.parse(savedCredentials);
            setUsername(savedUser);
            setPassword(savedPass);
            handleAutoLogin(savedUser, savedPass);
        }
    }, []);

    const handleAutoLogin = async (savedUser, savedPass) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: savedUser, password: savedPass })
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data.user);
            } else {
                localStorage.removeItem('salaryAppCredentials');
                setUsername('');
                setPassword('');
            }
        } catch (error) {
            console.error('Auto-login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setMessage({ text: 'Please fill all fields / सभी फील्ड भरें', type: 'error' });
            return;
        }

        if (isSignup) {
            if (!name) {
                setMessage({ text: 'Please enter your name / अपना नाम भरें', type: 'error' });
                return;
            }
            if (!email) {
                setMessage({ text: 'Please enter your email / अपना ईमेल भरें', type: 'error' });
                return;
            }
            if (!validateEmail(email)) {
                setMessage({ text: 'Please enter a valid email / सही ईमेल भरें', type: 'error' });
                return;
            }
            if (password !== confirmPassword) {
                setMessage({ text: 'Passwords do not match / पासवर्ड मेल नहीं खाता', type: 'error' });
                return;
            }
            if (password.length < 6) {
                setMessage({ text: 'Password must be at least 6 characters / पासवर्ड 6 अक्षर का होना चाहिए', type: 'error' });
                return;
            }
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
            const body = isSignup
                ? { email, username, password, name }
                : { username, password };

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                if (rememberMe) {
                    localStorage.setItem('salaryAppCredentials', JSON.stringify({ username, password }));
                }

                setMessage({ text: data.message, type: 'success' });

                if (isSignup) {
                    setTimeout(() => {
                        setIsSignup(false);
                        setMessage({ text: 'Now login with your credentials / अब लॉगिन करें', type: 'success' });
                        setEmail('');
                        setConfirmPassword('');
                    }, 1000);
                } else {
                    onLogin(data.user);
                }
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Server से कनेक्ट नहीं हो पाया', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !username) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <div className="loading">⏳ Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>💰 Salary Calculator</h1>
                    <p>सैलरी कैलकुलेटर</p>
                </div>

                <h2>{isSignup ? '📝 Sign Up / साइन अप' : '🔐 Login / लॉगिन'}</h2>

                <form onSubmit={handleSubmit}>
                    {isSignup && (
                        <>
                            <div className="form-group">
                                <label>नाम / Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="login-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>ईमेल / Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="login-input"
                                    autoComplete="email"
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>यूजरनेम / Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            className="login-input"
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label>पासवर्ड / Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="login-input"
                            autoComplete={isSignup ? 'new-password' : 'current-password'}
                        />
                    </div>

                    {isSignup && (
                        <div className="form-group">
                            <label>पासवर्ड दोबारा / Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                className="login-input"
                                autoComplete="new-password"
                            />
                        </div>
                    )}

                    <div className="remember-me">
                        <label>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>याद रखें / Remember Me</span>
                        </label>
                    </div>

                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading
                            ? '⏳ Please wait...'
                            : isSignup
                                ? '📝 Sign Up / साइन अप करें'
                                : '🔐 Login / लॉगिन करें'
                        }
                    </button>
                </form>

                <div className="toggle-mode">
                    {isSignup ? (
                        <p>
                            Already have account?
                            <button onClick={() => setIsSignup(false)} className="link-btn">
                                Login / लॉगिन
                            </button>
                        </p>
                    ) : (
                        <p>
                            New user?
                            <button onClick={() => setIsSignup(true)} className="link-btn">
                                Sign Up / साइन अप
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;
