import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Login({ onLogin }) {
    const [mode, setMode] = useState('login'); // login, signup, forgot
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Check for saved credentials on mount
    useEffect(() => {
        const savedCredentials = localStorage.getItem('salaryAppCredentials');
        if (savedCredentials) {
            const { email: savedEmail, password: savedPass } = JSON.parse(savedCredentials);
            setEmail(savedEmail);
            setPassword(savedPass);
            handleAutoLogin(savedEmail, savedPass);
        }
    }, []);

    const handleAutoLogin = async (savedEmail, savedPass) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: savedEmail, password: savedPass })
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data.user);
            } else {
                localStorage.removeItem('salaryAppCredentials');
                setEmail('');
                setPassword('');
            }
        } catch (error) {
            console.error('Auto-login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Validate email format (proper format with real domain patterns)
    const validateEmail = (email) => {
        // Check for valid email format with proper domain
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!re.test(email)) return false;

        // Check for common typos and invalid domains
        const domain = email.split('@')[1];
        if (!domain || domain.length < 4) return false; // min: a.co

        // Must have at least one dot in domain
        if (!domain.includes('.')) return false;

        // Domain extension must be at least 2 characters
        const extension = domain.split('.').pop();
        if (!extension || extension.length < 2) return false;

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        // Validate email
        if (!email || !validateEmail(email)) {
            setMessage({ text: 'Please enter a valid email / सही ईमेल भरें', type: 'error' });
            return;
        }

        // For forgot password, only need email
        if (mode === 'forgot') {
            handleForgotPassword();
            return;
        }

        // Validate password (minimum 8 characters)
        if (!password || password.length < 8) {
            setMessage({ text: 'Password must be at least 8 characters / पासवर्ड 8 अक्षर का होना चाहिए', type: 'error' });
            return;
        }

        // Signup validations
        if (mode === 'signup') {
            if (!username || username.length < 3) {
                setMessage({ text: 'Username must be at least 3 characters / यूजरनेम 3 अक्षर का होना चाहिए', type: 'error' });
                return;
            }
            if (password !== confirmPassword) {
                setMessage({ text: 'Passwords do not match / पासवर्ड मेल नहीं खाता', type: 'error' });
                return;
            }
        }

        setLoading(true);

        try {
            const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
            const body = mode === 'signup'
                ? { email, username, password }
                : { email, password };

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                if (rememberMe && mode === 'login') {
                    localStorage.setItem('salaryAppCredentials', JSON.stringify({ email, password }));
                }

                setMessage({ text: data.message, type: 'success' });

                if (mode === 'signup') {
                    setTimeout(() => {
                        setMode('login');
                        setUsername('');
                        setConfirmPassword('');
                        setMessage({ text: 'Now login with your email / अब ईमेल से लॉगिन करें', type: 'success' });
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

    const handleForgotPassword = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: '✅ Password reset email sent! Check your inbox / ईमेल भेज दिया', type: 'success' });
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Server से कनेक्ट नहीं हो पाया', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !email) {
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

                <h2>
                    {mode === 'signup' && '📝 Sign Up / साइन अप'}
                    {mode === 'login' && '🔐 Login / लॉगिन'}
                    {mode === 'forgot' && '🔑 Forgot Password'}
                </h2>

                <form onSubmit={handleSubmit}>
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

                    {mode === 'signup' && (
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
                    )}

                    {mode !== 'forgot' && (
                        <div className="form-group">
                            <label>पासवर्ड / Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="login-input"
                                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                            />
                        </div>
                    )}

                    {mode === 'signup' && (
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

                    {mode === 'login' && (
                        <>
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
                            <div className="forgot-link">
                                <button type="button" onClick={() => setMode('forgot')} className="link-btn">
                                    Forgot Password? / पासवर्ड भूल गए?
                                </button>
                            </div>
                        </>
                    )}

                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading
                            ? '⏳ Please wait...'
                            : mode === 'signup'
                                ? '📝 Sign Up / साइन अप करें'
                                : mode === 'forgot'
                                    ? '📧 Send Reset Link / लिंक भेजें'
                                    : '🔐 Login / लॉगिन करें'
                        }
                    </button>
                </form>

                <div className="toggle-mode">
                    {mode === 'signup' ? (
                        <p>
                            Already have account?
                            <button onClick={() => setMode('login')} className="link-btn">
                                Login / लॉगिन
                            </button>
                        </p>
                    ) : mode === 'forgot' ? (
                        <p>
                            Remember password?
                            <button onClick={() => setMode('login')} className="link-btn">
                                Back to Login
                            </button>
                        </p>
                    ) : (
                        <p>
                            New user?
                            <button onClick={() => setMode('signup')} className="link-btn">
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
