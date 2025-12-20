import { useState, useEffect } from 'react';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import SalarySetup from './components/SalarySetup';
import Settings from './components/Settings';
import DailyEntry from './components/DailyEntry';
import MonthlyView from './components/MonthlyView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Icons } from './components/Icons';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('entry');
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState({ text: '', type: '' });
  const [savingUsername, setSavingUsername] = useState(false);

  // Admin state
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [admin, setAdmin] = useState(null);

  // Check URL for admin route or reset token
  useEffect(() => {
    const path = window.location.pathname;

    if (path.startsWith('/admin')) {
      setIsAdminRoute(true);
      // Check for saved admin session
      const savedAdmin = localStorage.getItem('adminSession');
      if (savedAdmin) {
        try {
          setAdmin(JSON.parse(savedAdmin));
        } catch (e) {
          localStorage.removeItem('adminSession');
        }
      }
    } else if (path.startsWith('/reset-password/')) {
      const token = path.split('/reset-password/')[1];
      if (token) {
        setResetToken(token);
      }
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
        setEditingUsername(false);
        setUsernameMessage({ text: '', type: '' });
      }
    };
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('salaryAppCredentials');
  };

  const handleAdminLogin = (adminData) => {
    setAdmin(adminData);
  };

  const handleAdminLogout = () => {
    setAdmin(null);
    localStorage.removeItem('adminSession');
  };

  const handleSalarySetup = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleSettingsUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleResetComplete = () => {
    setResetToken(null);
    window.history.pushState({}, '', '/');
  };

  const handleEditUsername = () => {
    setEditingUsername(true);
    setNewUsername(user.username);
    setUsernameMessage({ text: '', type: '' });
  };

  const handleSaveUsername = async () => {
    if (!newUsername || newUsername.length < 3) {
      setUsernameMessage({ text: 'Min 3 characters', type: 'error' });
      return;
    }

    if (newUsername.toLowerCase() === user.username.toLowerCase()) {
      setEditingUsername(false);
      return;
    }

    setSavingUsername(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, username: newUsername })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setEditingUsername(false);
        setUsernameMessage({ text: 'Updated!', type: 'success' });
        setTimeout(() => setUsernameMessage({ text: '', type: '' }), 2000);
      } else {
        setUsernameMessage({ text: data.message, type: 'error' });
      }
    } catch (error) {
      setUsernameMessage({ text: 'Server error', type: 'error' });
    } finally {
      setSavingUsername(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUsername(false);
    setUsernameMessage({ text: '', type: '' });
  };

  // ========== ADMIN ROUTES ==========
  if (isAdminRoute) {
    if (!admin) {
      return <AdminLogin onLogin={handleAdminLogin} />;
    }
    return <AdminDashboard admin={admin} onLogout={handleAdminLogout} />;
  }

  // ========== USER ROUTES ==========

  // Show reset password page if token is present
  if (resetToken) {
    return <ResetPassword token={resetToken} onComplete={handleResetComplete} />;
  }

  // Show login if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Show salary setup if salary not set
  if (!user.dailySalaryRate) {
    return <SalarySetup userId={user.id} onComplete={handleSalarySetup} />;
  }

  // Show settings screen
  if (showSettings) {
    return (
      <Settings
        user={user}
        onUpdate={handleSettingsUpdate}
        onBack={() => setShowSettings(false)}
      />
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div>
              <h1>Salary Calculator</h1>
              <p>नमस्ते, {user.username}!</p>
            </div>
          </div>
          <div className="header-buttons">
            {/* User Profile Button */}
            <div className="user-menu-container">
              <button
                className="user-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
              >
                <Icons.User />
              </button>
              {showUserMenu && (
                <div className="user-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="user-dropdown-header">
                    <Icons.User />
                    <span>Profile</span>
                  </div>

                  {/* Username - Editable */}
                  <div className="user-dropdown-item">
                    <span className="label">Username</span>
                    {editingUsername ? (
                      <div className="edit-username-form">
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="edit-username-input"
                          autoFocus
                        />
                        <div className="edit-username-actions">
                          <button
                            className="save-username-btn"
                            onClick={handleSaveUsername}
                            disabled={savingUsername}
                          >
                            {savingUsername ? <Icons.Loader /> : <Icons.CheckCircle />}
                          </button>
                          <button
                            className="cancel-username-btn"
                            onClick={handleCancelEdit}
                          >
                            <Icons.XCircle />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="username-display">
                        <span className="value">{user.username}</span>
                        <button className="edit-btn" onClick={handleEditUsername}>
                          <Icons.Edit />
                        </button>
                      </div>
                    )}
                    {usernameMessage.text && (
                      <span className={`username-msg ${usernameMessage.type}`}>
                        {usernameMessage.text}
                      </span>
                    )}
                  </div>

                  {/* Email - Read only */}
                  <div className="user-dropdown-item">
                    <span className="label">Email</span>
                    <span className="value">{user.email}</span>
                  </div>
                </div>
              )}
            </div>
            <button className="settings-btn" onClick={() => setShowSettings(true)}>
              <Icons.Settings />
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <Icons.LogOut />
            </button>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'entry' ? 'active' : ''}`}
          onClick={() => setActiveTab('entry')}
        >
          <Icons.Edit /> Daily Entry
        </button>
        <button
          className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          <Icons.BarChart /> Monthly View
        </button>
      </nav>

      <main className="content">
        {activeTab === 'entry' ? (
          <DailyEntry userId={user.id} dailySalaryRate={user.dailySalaryRate} />
        ) : (
          <MonthlyView userId={user.id} />
        )}
      </main>

      <footer className="footer">
        <p>© Darsh Patel</p>
      </footer>
    </div>
  );
}

export default App;
