import { useState, useRef, useEffect } from 'react';

// Windows-style scroll wheel time picker
function CustomTimePicker({ value, onChange, className }) {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedHour, setSelectedHour] = useState(10);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [period, setPeriod] = useState('AM');
    const containerRef = useRef(null);
    const hourRef = useRef(null);
    const minuteRef = useRef(null);

    // Generate hours 01-12
    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    // Generate minutes 00-59
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    // Parse incoming 24h value
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
                if (h === 0) {
                    setSelectedHour(12);
                    setPeriod('AM');
                } else if (h === 12) {
                    setSelectedHour(12);
                    setPeriod('PM');
                } else if (h > 12) {
                    setSelectedHour(h - 12);
                    setPeriod('PM');
                } else {
                    setSelectedHour(h);
                    setPeriod('AM');
                }
                setSelectedMinute(m);
            }
        }
    }, [value]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Scroll to selected item when picker opens
    useEffect(() => {
        if (showPicker) {
            if (hourRef.current) {
                const index = selectedHour - 1;
                hourRef.current.scrollTop = index * 44 - 44;
            }
            if (minuteRef.current) {
                minuteRef.current.scrollTop = selectedMinute * 44 - 44;
            }
        }
    }, [showPicker]);

    const handleConfirm = () => {
        let hour24 = selectedHour;
        if (period === 'AM') {
            if (selectedHour === 12) hour24 = 0;
            else hour24 = selectedHour;
        } else {
            if (selectedHour === 12) hour24 = 12;
            else hour24 = selectedHour + 12;
        }
        const timeStr = `${String(hour24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
        onChange({ target: { value: timeStr } });
        setShowPicker(false);
    };

    const formatDisplayTime = () => {
        if (!value) return '-- : -- --';
        const [h, m] = value.split(':');
        if (!h || !m) return '-- : -- --';
        let hour = parseInt(h);
        const p = hour >= 12 ? 'PM' : 'AM';
        if (hour === 0) hour = 12;
        else if (hour > 12) hour = hour - 12;
        return `${String(hour).padStart(2, '0')} : ${m} ${p}`;
    };

    return (
        <div className={`windows-time-picker ${className || ''}`} ref={containerRef}>
            {/* Display Box */}
            <div className="time-display-box" onClick={() => setShowPicker(!showPicker)}>
                <span className="time-text">{formatDisplayTime()}</span>
                <span className="time-icon">🕐</span>
            </div>

            {/* Picker Modal */}
            {showPicker && (
                <div className="time-picker-modal">
                    <div className="picker-columns">
                        {/* Hour Column */}
                        <div className="picker-column" ref={hourRef}>
                            {hours.map((h, i) => (
                                <div
                                    key={h}
                                    className={`picker-item ${selectedHour === i + 1 ? 'selected' : ''}`}
                                    onClick={() => setSelectedHour(i + 1)}
                                >
                                    {h}
                                </div>
                            ))}
                        </div>

                        {/* Minute Column */}
                        <div className="picker-column" ref={minuteRef}>
                            {minutes.map((m, i) => (
                                <div
                                    key={m}
                                    className={`picker-item ${selectedMinute === i ? 'selected' : ''}`}
                                    onClick={() => setSelectedMinute(i)}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>

                        {/* AM/PM Column */}
                        <div className="picker-column period-column">
                            <div
                                className={`picker-item ${period === 'AM' ? 'selected' : ''}`}
                                onClick={() => setPeriod('AM')}
                            >
                                AM
                            </div>
                            <div
                                className={`picker-item ${period === 'PM' ? 'selected' : ''}`}
                                onClick={() => setPeriod('PM')}
                            >
                                PM
                            </div>
                        </div>
                    </div>

                    {/* Selection Highlight */}
                    <div className="selection-highlight"></div>

                    {/* Confirm Button */}
                    <button type="button" className="confirm-btn" onClick={handleConfirm}>
                        ✓ Set Time
                    </button>
                </div>
            )}
        </div>
    );
}

export default CustomTimePicker;
