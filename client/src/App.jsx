import { useState } from 'react';
import Login from './components/Login';
import SalarySetup from './components/SalarySetup';
import Settings from './components/Settings';
import DailyEntry from './components/DailyEntry';
import MonthlyView from './components/MonthlyView';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('entry');
  const [showSettings, setShowSettings] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('salaryAppCredentials');
  };

  const handleSalarySetup = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleSettingsUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

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
            <img src="/logo.png" alt="WellBore" className="header-logo" />
            <div>
              <h1>Salary Calculator</h1>
              <p>नमस्ते, {user.name}!</p>
            </div>
          </div>
          <div className="header-buttons">
            <button className="settings-btn" onClick={() => setShowSettings(true)}>
              ⚙️
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              🚪
            </button>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'entry' ? 'active' : ''}`}
          onClick={() => setActiveTab('entry')}
        >
          📝 Daily Entry
        </button>
        <button
          className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          📊 Monthly View
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
