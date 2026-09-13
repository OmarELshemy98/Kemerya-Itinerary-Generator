import { Svg, Path, Circle } from '@react-pdf/renderer';

// 1. Sharp Vector Logo (Replacing blurry PNG)
export const KemeryaLogoSvg = () => (
  <svg viewBox="0 0 100 100" width="70" height="70">
    <circle cx="50" cy="50" r="45" fill="none" stroke="#C9A962" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="#C9A962" />
    <path d="M50 20 L65 70 L35 70 Z" fill="none" stroke="#171717" />
    <path d="M50 40 L58 70 L42 70 Z" fill="#C9A962" />
  </svg>
);

// 2. Inclusion/Exclusion Icons
export const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14">
    <path fill="none" stroke="#16a34a" d="M20 6L9 17l-5-5" />
  </svg>
);
export const CrossIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14">
    <path fill="none" stroke="#dc2626" d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// 3. Booking Summary Icons (Gold Weighted)
export const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12">
    <path fill="none" stroke="#C9A962" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);
export const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12">
    <path fill="none" stroke="#C9A962" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
export const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12">
    <path fill="none" stroke="#C9A962" d="M15 10a3 3 0 11-6 0 3 3 0 016 0z M19.5 10c0 7.142-7.5 11.25-7.5 11.25S4.5 17.142 4.5 10a7.5 7.5 0 0115 0z" />
  </svg>
);