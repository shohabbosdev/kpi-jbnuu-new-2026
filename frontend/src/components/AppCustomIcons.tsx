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

// 14. Rol almashtirish (Hand-crafted Role Switcher)
export const IconRoleSwitch: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M6 18.5C6 15.1863 8.68629 13 12 13C13.2 13 14.3 13.3 15.2 13.8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M17 16L21 16M21 16L19 14M21 16L19 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 20L15 20M15 20L17 18M15 20L17 22"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 15. Administrator roli (Hand-crafted Admin Shield & Gear)
export const IconRoleAdmin: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
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
      d="M12 2.75L4.5 6V11.25C4.5 16.2 7.7 20.7 12 21.75C16.3 20.7 19.5 16.2 19.5 11.25V6L12 2.75Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 13V16.5M10.5 15H13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 16. Dekan roli (Hand-crafted Faculty Dean / Academic Columns)
export const IconRoleDean: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M3 8.5L12 3.5L21 8.5H3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M4 19.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M6 9.5V18.5M10 9.5V18.5M14 9.5V18.5M18 9.5V18.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="6" r="0.75" fill="currentColor" />
  </svg>
);

// 17. Kafedra mudiri roli (Hand-crafted Department Chair / Leadership)
export const IconRoleHead: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M6.5 18.5C6.5 15 8.9 12.5 12 12.5C15.1 12.5 17.5 15 17.5 18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="4.5" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M2.5 18.5C2.5 16.5 3.5 15 5 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="19.5" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M21.5 18.5C21.5 16.5 20.5 15 19 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// 18. O'qituvchi roli (Hand-crafted Professor / Educator)
export const IconRoleTeacher: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M4 4.5H16C17.1 4.5 18 5.4 18 6.5V14.5C18 15.6 17.1 16.5 16 16.5H4C2.9 16.5 2 15.6 2 14.5V6.5C2 5.4 2.9 4.5 4 4.5Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7 8.5H13M7 11.5H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M14 16.5L16 20.5M6 16.5L4 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="19.5" cy="13.5" r="2.25" stroke="currentColor" strokeWidth="1.8" />
    <path d="M19.5 17C18.5 17 17.5 17.8 17.5 19V20.5H21.5V19C21.5 17.8 20.5 17 19.5 17Z" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

// 19. Rektorat roli (Hand-crafted Rectorate Emblem / Institutional Crest)
export const IconRoleRectorate: React.FC<IconProps> = ({ size = 18, className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 5.5L13.7 9.5H18L14.5 12.2L15.8 16.5L12 13.8L8.2 16.5L9.5 12.2L6 9.5H10.3L12 5.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="12" cy="11.5" r="1.5" fill="currentColor" />
  </svg>
);

