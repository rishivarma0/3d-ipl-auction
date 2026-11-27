export const money = (l) => (l >= 100 ? `₹${+(l / 100).toFixed(2)} Cr` : `₹${l} L`);
export const step = (c) => (c < 100 ? 5 : c < 200 ? 10 : c < 500 ? 20 : 25);
export const fixResult = (r) => (r || '').replace('by 1 wickets', 'by 1 wicket');
export const ROLE = { BAT: 'Batter', WK: 'Keeper', AR: 'All-rounder', PACE: 'Pacer', SPIN: 'Spinner' };
