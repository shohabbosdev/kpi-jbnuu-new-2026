import { AuthUser } from "@/types";

/**
 * Granular RBAC (Role-Based Access Control) Permission Checker
 * 
 * 100% Orqaga moslashuvchanlik (Backward Compatible):
 * 1. Agar foydalanuvchida permissions ro'yxati kelsa - bazadagi dinamik ruxsatlar bilan tekshiriladi.
 * 2. Agar foydalanuvchi ADMIN bo'lsa - barcha huquqlarga to'liq ega bo'ladi.
 * 3. Agar foydalanuvchi ma'lumotlarida permissions hali yuklanmagan bo'lsa - tizim mavjud roli bo'yicha
 *    avtomatik xavfsiz fallback ruxsatlarni hisoblaydi (hech qachon xato bermaydi).
 */

// Standart rollar uchun fallback huquqlar (Fallback permissions map)
const FALLBACK_ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["*"],
  RECTORATE: [
    "dashboard:view",
    "structure:view",
    "subjects:view_all",
    "hemis:view",
    "svetafor:view",
    "logs:view"
  ],
  DEAN: [
    "dashboard:view",
    "structure:view",
    "subjects:view_faculty",
    "subjects:view_own",
    "subjects:manage_docs",
    "subjects:approve_dekan",
    "hemis:view",
    "kpi:submit",
    "kpi:appeal",
    "svetafor:view"
  ],
  HEAD_OF_DEPT: [
    "dashboard:view",
    "structure:view",
    "subjects:view_dept",
    "subjects:view_own",
    "subjects:manage_docs",
    "subjects:approve_mudir",
    "hemis:view",
    "kpi:submit",
    "kpi:review_mudir",
    "kpi:appeal",
    "svetafor:view"
  ],
  TEACHER: [
    "dashboard:view",
    "subjects:view_own",
    "subjects:manage_docs",
    "kpi:submit",
    "kpi:appeal",
    "svetafor:view"
  ]
};

/**
 * Aniq huquqni tekshirish funksiyasi
 * @param user Tizimga kirgan foydalanuvchi
 * @param permissionCode Huquq kodi (masalan: 'subjects:view_all', 'hemis:sync')
 */
export function hasPermission(user: AuthUser | null, permissionCode: string): boolean {
  if (!user) return false;

  // 1. ADMIN har doim to'liq huquqqa ega
  if (user.role === "ADMIN") return true;

  // 2. Dinamik permissions ro'yxati tekshiruvi
  if (user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0) {
    if (user.permissions.includes("*")) return true;
    return user.permissions.includes(permissionCode);
  }

  // 3. Fallback: agar dinamik ro'yxat bo'lmasa, roli bo'yicha ruxsat berish
  const fallbackList = FALLBACK_ROLE_PERMISSIONS[user.role] || [];
  if (fallbackList.includes("*")) return true;
  return fallbackList.includes(permissionCode);
}

/**
 * Bir nechta huquqlardan kamida birortasi borligini tekshirish (OR condition)
 */
export function hasAnyPermission(user: AuthUser | null, permissionCodes: string[]): boolean {
  if (!user) return false;
  return permissionCodes.some((code) => hasPermission(user, code));
}

/**
 * Barcha so'ralgan huquqlarning mavjudligini tekshirish (AND condition)
 */
export function hasAllPermissions(user: AuthUser | null, permissionCodes: string[]): boolean {
  if (!user) return false;
  return permissionCodes.every((code) => hasPermission(user, code));
}
