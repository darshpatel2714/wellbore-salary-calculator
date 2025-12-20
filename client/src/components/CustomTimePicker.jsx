import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';

// Custom Time Picker - Same look on mobile and desktop
function CustomTimePicker({ value, onChange, className }) {
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef(null);

    // Parse incoming value
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            setHours(h || '');
            setMinutes(m || '');
        } else {
            setHours('');
            setMinutes('');
        }
    }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const updateTime = (newHours, newMinutes) => {
        const h = newHours.padStart(2, '0');
        const m = newMinutes.padStart(2, '0');
        onChange({ target: { value: `${h}:${m}` } });
    };

    const handleHoursChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(0, 2);
        if (parseInt(val) > 23) val = '23';
        setHours(val);
        if (val.length === 2 && minutes) {
            updateTime(val, minutes);
        }
    };

    const handleMinutesChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(0, 2);
        if (parseInt(val) > 59) val = '59';
        setMinutes(val);
        if (val.length === 2 && hours) {
            updateTime(hours, val);
        }
    };

    const handleHoursBlur = () => {
        if (hours && minutes) {
            updateTime(hours, minutes);
        }
    };

    const handleMinutesBlur = () => {
        if (hours && minutes) {
            updateTime(hours, minutes);
        }
    };

    // Quick select hours
    const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    // Quick select minutes (every 15 min)
    const minuteOptions = ['00', '15', '30', '45'];

    const selectHour = (h) => {
        setHours(h);
        if (minutes) {
            updateTime(h, minutes);
        }
    };

    const selectMinute = (m) => {
        setMinutes(m);
        if (hours) {
            updateTime(hours, m);
            setShowDropdown(false);
        }
    };

    return (
        <div className={`custom-time-picker ${className || ''}`} ref={containerRef}>
            <div className="time-display" onClick={() => setShowDropdown(!showDropdown)}>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={hours}
                    onChange={handleHoursChange}
                    onBlur={handleHoursBlur}
                    placeholder="HH"
                    maxLength={2}
                    className="time-digit"
                />
                <span className="time-separator">:</span>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={minutes}
                    onChange={handleMinutesChange}
                    onBlur={handleMinutesBlur}
                    placeholder="MM"
                    maxLength={2}
                    className="time-digit"
                />
                <button type="button" className="time-dropdown-btn" onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}>
                    <Icons.Clock />
                </button>
            </div>

            {showDropdown && (
                <div className="time-dropdown">
                    <div className="time-dropdown-section">
                        <div className="time-dropdown-label">Hour</div>
                        <div className="time-options hours-options">
                            {hourOptions.map(h => (
                                <button
                                    key={h}
                                    type="button"
                                    className={`time-option ${hours === h ? 'selected' : ''}`}
                                    onClick={() => selectHour(h)}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="time-dropdown-section">
                        <div className="time-dropdown-label">Minute</div>
                        <div className="time-options minutes-options">
                            {minuteOptions.map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    className={`time-option ${minutes === m ? 'selected' : ''}`}
                                    onClick={() => selectMinute(m)}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomTimePicker;
