"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  IconRoleSwitch,
  IconRoleAdmin,
  IconRoleDean,
  IconRoleHead,
  IconRoleTeacher,
  IconRoleRectorate,
  IconCheck,
  IconChevronDown
} from "./AppCustomIcons";

export type RoleType = "ADMIN" | "DEAN" | "HEAD_OF_DEPT" | "TEACHER" | "RECTORATE";

interface RoleSwitcherDropdownProps {
  activeRole: RoleType;
  onSelectRole: (role: RoleType) => void;
  theme: "light" | "dark";
}

interface RoleConfig {
  code: RoleType;
  title: string;
  badge: string;
  desc: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  colorClasses: {
    bg: string;
    border: string;
    text: string;
    activeRing: string;
  };
}

const ROLES: RoleConfig[] = [
  {
    code: "ADMIN",
    title: "Administrator",
    badge: "Boshqaruv",
    desc: "Tizim toʻliq boshqaruvi va monitoring",
    Icon: IconRoleAdmin,
    colorClasses: {
      bg: "bg-blue-50 dark:bg-blue-950/70",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-900 dark:text-blue-400",
      activeRing: "ring-blue-900"
    }
  },
  {
    code: "DEAN",
    title: "Fakultet dekani",
    badge: "Fakultet",
    desc: "Fakultet kafedralari va umumiy KPI monitoringi",
    Icon: IconRoleDean,
    colorClasses: {
      bg: "bg-indigo-50 dark:bg-indigo-950/70",
      border: "border-indigo-200 dark:border-indigo-800",
      text: "text-indigo-900 dark:text-indigo-400",
      activeRing: "ring-indigo-900"
    }
  },
  {
    code: "HEAD_OF_DEPT",
    title: "Kafedra mudiri",
    badge: "Kafedra",
    desc: "Kafedra oʻqituvchilari yuklamasi va arizalari",
    Icon: IconRoleHead,
    colorClasses: {
      bg: "bg-emerald-50 dark:bg-emerald-950/70",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-900 dark:text-emerald-400",
      activeRing: "ring-emerald-900"
    }
  },
  {
    code: "TEACHER",
    title: "Professor-oʻqituvchi",
    badge: "Pedagog",
    desc: "Shaxsiy oʻquv yuklamasi va KPI arizalari",
    Icon: IconRoleTeacher,
    colorClasses: {
      bg: "bg-violet-50 dark:bg-violet-950/70",
      border: "border-violet-200 dark:border-violet-800",
      text: "text-violet-900 dark:text-violet-400",
      activeRing: "ring-violet-900"
    }
  },
  {
    code: "RECTORATE",
    title: "Filial rahbariyati",
    badge: "Rektorat",
    desc: "Filial integral KPI reytingi va nazorati",
    Icon: IconRoleRectorate,
    colorClasses: {
      bg: "bg-amber-50 dark:bg-amber-950/70",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-900 dark:text-amber-400",
      activeRing: "ring-amber-900"
    }
  }
];

export const RoleSwitcherDropdown: React.FC<RoleSwitcherDropdownProps> = ({
  activeRole,
  onSelectRole,
  theme
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRole = ROLES.find((r) => r.code === activeRole) || ROLES[0];
  const ActiveIcon = currentRole.Icon;

  // Tashqariga bosilganda menyuni yopish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Klaviatura Esc tugmasi bosilganda yopish
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Asosiy Rol almashtirish tugmasi */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Rol koʻrinishini almashtirish (Administrator inspektori)"
        className={`flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs shadow-xs transition-all cursor-pointer ${
          isOpen
            ? "border-blue-900 ring-2 ring-blue-900/20"
            : theme === "dark"
            ? "bg-slate-850 border-slate-700 hover:border-slate-600 text-slate-100"
            : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
        }`}
      >
        {/* Tanlangan rol piktogrammasi (Original SVG) */}
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${currentRole.colorClasses.bg} ${currentRole.colorClasses.border} ${currentRole.colorClasses.text}`}
        >
          <ActiveIcon size={14} />
        </div>

        {/* Matn qismi */}
        <div className="flex flex-col text-left leading-none">
          <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-450 tracking-wider">
            Rol koʻrinishi:
          </span>
          <span className="font-bold text-xs mt-0.5 text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>{currentRole.title}</span>
          </span>
        </div>

        {/* Ochilish belgisi (Original SVG chevron) */}
        <IconChevronDown
          size={13}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ml-0.5 ${
            isOpen ? "rotate-180 text-blue-900 dark:text-blue-400" : ""
          }`}
        />
      </button>

      {/* Ochiladigan menyu (Barcha rollar ro'yxati) */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
            theme === "dark"
              ? "bg-slate-900/98 border-slate-800 text-slate-100"
              : "bg-white/98 border-slate-200 text-slate-900"
          }`}
        >
          {/* Menyu sarlavhasi */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconRoleSwitch size={15} className="text-blue-900 dark:text-blue-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rolni tanlang
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">5 ta portal</span>
          </div>

          {/* Rollar ro'yxati */}
          <div className="space-y-1">
            {ROLES.map((role) => {
              const isSelected = role.code === activeRole;
              const RoleIcon = role.Icon;

              return (
                <button
                  key={role.code}
                  type="button"
                  onClick={() => {
                    onSelectRole(role.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? theme === "dark"
                        ? "bg-blue-950/60 border border-blue-800/80 text-white"
                        : "bg-blue-50/80 border border-blue-200 text-blue-950"
                      : theme === "dark"
                      ? "hover:bg-slate-800/70 border border-transparent text-slate-300 hover:text-white"
                      : "hover:bg-slate-50 border border-transparent text-slate-700 hover:text-slate-900"
                  }`}
                >
                  {/* Rolning maxsus qo'lda chizilgan SVG piktogrammasi */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${role.colorClasses.bg} ${role.colorClasses.border} ${role.colorClasses.text}`}
                  >
                    <RoleIcon size={16} />
                  </div>

                  {/* Rol tavsifi */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="text-xs font-bold truncate">{role.title}</span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                          isSelected
                            ? "bg-blue-900 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate leading-tight">
                      {role.desc}
                    </p>
                  </div>

                  {/* Tanlanganlik nishoni (Original SVG chek) */}
                  {isSelected && (
                    <div className="shrink-0 text-blue-900 dark:text-blue-400">
                      <IconCheck size={15} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
