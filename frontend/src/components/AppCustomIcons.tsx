import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

// 1. Qidiruv piktogrammasi (Original nozik hand-crafted SVG)
export const IconSearch: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="9" cy="9" r="2" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

// 2. Foydalanuvchi / O'qituvchi piktogrammasi
export const IconUser: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="7.5" r="4.5" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M4.5 19.5C4.5 15.634 7.85786 13.5 12 13.5C16.1421 13.5 19.5 15.634 19.5 19.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

// 3. Kitob / Fan piktogrammasi
export const IconBook: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M4 19.5V5.5C4 4.39543 4.89543 3.5 6 3.5H11.5C12.5 3.5 12.5 5 12.5 5V20.5H5.5C4.67157 20.5 4 19.8284 4 19.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M20 19.5V5.5C20 4.39543 19.1046 3.5 18 3.5H12.5C11.5 3.5 11.5 5 11.5 5V20.5H18.5C19.3284 20.5 20 19.8284 20 19.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M7 7.5H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 11H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 7.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 11H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 4. Kafedra / Bino piktogrammasi
export const IconBuilding: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect x="3.5" y="4.5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3.5 9.5H20.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7.5 13.5H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M14.5 13.5H16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M11 17V20.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M13 17V20.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

// 5. Soat / Dars soatlari piktogrammasi
export const IconClock: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7.5V12L15.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 6. Tanlash / Tasdiqlash piktogrammasi
export const IconCheck: React.FC<IconProps> = ({ size = 16, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M4.5 12.5L9.5 17.5L19.5 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 7. Ochilish strelkasi (Chevron Down)
export const IconChevronDown: React.FC<IconProps> = ({ size = 16, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M6 9.5L12 15.5L18 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 8. O'chirish / Yopish piktogrammasi
export const IconX: React.FC<IconProps> = ({ size = 16, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 9. Filtr piktogrammasi
export const IconFilter: React.FC<IconProps> = ({ size = 16, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M3.5 5.5H20.5L13.5 13.5V19.5L10.5 21V13.5L3.5 5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

// 10. Bitiruvchi / Ta'lim piktogrammasi
export const IconGraduation: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M12 3.5L2 8.5L12 13.5L22 8.5L12 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M6 10.8V16C6 17.5 8.68629 19.5 12 19.5C15.3137 19.5 18 17.5 18 16V10.8" stroke="currentColor" strokeWidth="1.8" />
    <path d="M22 8.5V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 11. Xavfsizlik qalqoni
export const IconShield: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M12 3L4 6.5V11.5C4 16.5 7.5 20.5 12 21.5C16.5 20.5 20 16.5 20 11.5V6.5L12 3Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 12. Ma'lumotlar bazasi (HEMIS relyatsion piktogrammasi)
export const IconDatabase: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <ellipse cx="12" cy="5" rx="8" ry="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 5V12C4 13.6569 7.58172 15 12 15C16.4183 15 20 13.6569 20 12V5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 12V19C4 20.6569 7.58172 22 12 22C16.4183 22 20 20.6569 20 19V12" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

// 13. Qayta yangilash / Sinxronlash piktogrammasi
export const IconRefresh: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5V9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 13A8.1 8.1 0 0 0 19.5 15M20 19V15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
