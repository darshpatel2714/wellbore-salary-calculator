import { useState } from 'react';
import { Icons } from './Icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ResetPassword({ token, onComplete }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!password || password.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters / पासवर्ड 6 अक्षर का होना चाहिए', type: 'error' });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ text: 'Passwords do not match / पासवर्ड मेल नहीं खाता', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Password reset successful! पासवर्ड बदल गया!', type: 'success' });
                setTimeout(() => {
                    onComplete();
                }, 2000);
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
            <div className="login-box">
                <div className="login-header">
                    <h1><Icons.Key /> Reset Password</h1>
                    <p>नया पासवर्ड बनाएं</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>नया पासवर्ड / New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="login-input"
                                autoComplete="new-password"
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

                    <div className="form-group">
                        <label>पासवर्ड दोबारा / Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="login-input"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                            </button>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.type === 'success' ? <Icons.CheckCircle /> : <Icons.XCircle />}
                            {message.text}
                        </div>
                    )}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? <><Icons.Loader /> Please wait...</> : <><Icons.Key /> Reset Password / पासवर्ड बदलें</>}
                    </button>
                </form>

                <div className="toggle-mode">
                    <p>
                        <button onClick={onComplete} className="link-btn">
                            <Icons.ArrowLeft /> Back to Login / वापस जाएं
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
