// Salary calculation constants and functions
export const DAILY_RATE = 1355;
export const FULL_DAY_HOURS = 8;
export const HOURLY_RATE = DAILY_RATE / FULL_DAY_HOURS; // 169.375
export const PF_RATE = 0.12;

// Calculate working hours from in/out time
export function calculateHours(inTime, outTime) {
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);

    const inMinutes = inH * 60 + inM;
    const outMinutes = outH * 60 + outM;

    return (outMinutes - inMinutes) / 60;
}

// Calculate all salary details
export function calculateSalary(totalHours) {
    const presentHours = Math.min(FULL_DAY_HOURS, totalHours);
    const otHours = Math.max(0, totalHours - FULL_DAY_HOURS);

    // Present amount is prorated if less than 8 hours
    const presentAmount = presentHours >= FULL_DAY_HOURS
        ? DAILY_RATE
        : presentHours * HOURLY_RATE;

    const otAmount = otHours * HOURLY_RATE;

    // PF is ONLY on present amount, NOT on OT
    const pf = presentAmount * PF_RATE;

    const dailySalary = (presentAmount + otAmount) - pf;

    return {
        presentHours: Math.round(presentHours * 100) / 100,
        otHours: Math.round(otHours * 100) / 100,
        presentAmount: Math.round(presentAmount * 100) / 100,
        otAmount: Math.round(otAmount * 100) / 100,
        pf: Math.round(pf * 100) / 100,
        dailySalary: Math.round(dailySalary * 100) / 100
    };
}

// Format date for display (DD/MM/YYYY)
export function formatDateDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}
