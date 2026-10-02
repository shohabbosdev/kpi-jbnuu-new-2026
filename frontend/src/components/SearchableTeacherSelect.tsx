"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  IconSearch,
  IconUser,
  IconBuilding,
  IconClock,
  IconCheck,
  IconChevronDown,
  IconX
} from "./AppCustomIcons";

export interface TeacherSelectItem {
  id: number | string;
  name: string;
  department: string;
  totalHours: number;
}

interface SearchableTeacherSelectProps {
  teachers: TeacherSelectItem[];
  selectedTeacherName: string;
  onSelectTeacher: (teacherName: string) => void;
  activeRole: string;
  currentUserName?: string;
  theme: "light" | "dark";
}

export const SearchableTeacherSelect: React.FC<SearchableTeacherSelectProps> = ({
  teachers,
  selectedTeacherName,
  onSelectTeacher,
  activeRole,
  currentUserName,
  theme
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tanlangan o'qituvchi obyekti
  const currentSelected = useMemo(() => {
    return teachers.find(
      (t) =>
        t.name.toLowerCase() === (selectedTeacherName || "").toLowerCase() ||
        t.name.toLowerCase().includes((selectedTeacherName || "").toLowerCase()) ||
        (selectedTeacherName || "").toLowerCase().includes(t.name.toLowerCase())
    );
  }, [teachers, selectedTeacherName]);

  // Noyob kafedralar ro'yxati
  const departments = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.department) set.add(t.department);
    });
    return Array.from(set).sort();
  }, [teachers]);

  // Qidiruv va kafedra filtrlash
  const filteredTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return teachers.filter((t) => {
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.department && t.department.toLowerCase().includes(q));

      const matchDept =
        selectedDeptFilter === "ALL" ||
        (t.department && t.department.toLowerCase() === selectedDeptFilter.toLowerCase());

      return matchSearch && matchDept;
    });
  }, [teachers, searchQuery, selectedDeptFilter]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modal ochilganda qidiruv maydoniga fokus berish
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
      setSelectedDeptFilter("ALL");
    }
  }, [isOpen]);

  const handleSelect = (teacherName: string) => {
    onSelectTeacher(teacherName);
    setIsOpen(false);
  };

  const roleTitle =
    activeRole === "HEAD_OF_DEPT"
      ? "Kafedra oʻqituvchisi"
      : activeRole === "DEAN"
      ? "Fakultet oʻqituvchisi"
      : "Filial oʻqituvchisi";

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Tanlash tugmasi (Trigger Button) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer min-w-[220px] sm:min-w-[270px] max-w-[340px] ${
          isOpen
            ? "ring-2 ring-blue-900 border-blue-900"
            : theme === "dark"
            ? "bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-slate-750"
            : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-400 flex items-center justify-center shrink-0">
            <IconUser size={14} />
          </div>
          <div className="text-left truncate">
            <div className="truncate font-bold leading-tight">
              {currentSelected ? currentSelected.name : selectedTeacherName || "Oʻqituvchini tanlang"}
            </div>
            {currentSelected && (
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                {currentSelected.totalHours} soat • {currentSelected.department}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 font-mono">
            {teachers.length}
          </span>
          <IconChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-900 dark:text-blue-400" : ""}`}
          />
        </div>
      </button>

      {/* Ochiluvchi zamonaviy qidiruv paneli (Searchable Dropdown Popup) */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 w-[320px] sm:w-[380px] rounded-2xl border shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            theme === "dark" ? "bg-slate-900 border-slate-700 shadow-slate-950/80" : "bg-white border-slate-200 shadow-slate-900/15"
          }`}
        >
          {/* Header & Qidiruv maydoni */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400">
                {roleTitle}ni qidirish
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
              >
                <IconX size={14} />
              </button>
            </div>

            {/* Qidiruv inputi */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IconSearch size={15} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Familiya, ism yoki kafedra nomi..."
                className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <IconX size={13} />
                </button>
              )}
            </div>

            {/* Kafedralar bo'yicha tezkor filtr teglari (agar 1 tadan ko'p kafedra bo'lsa) */}
            {departments.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedDeptFilter("ALL")}
                  className={`px-2 py-0.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                    selectedDeptFilter === "ALL"
                      ? "bg-blue-900 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  Barchasi ({teachers.length})
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDeptFilter(dept)}
                    className={`px-2 py-0.5 rounded-lg font-bold shrink-0 truncate max-w-[140px] transition-colors cursor-pointer ${
                      selectedDeptFilter === dept
                        ? "bg-blue-900 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                    title={dept}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* O'qituvchilar ro'yxati (Scrollable List) */}
          <div className="max-h-[260px] overflow-y-auto p-1.5 space-y-1">
            {filteredTeachers.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                  <IconSearch size={18} />
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Mos pedagog topilmadi
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Qidiruv soʻzini oʻzgartirib koʻring
                </p>
              </div>
            ) : (
              filteredTeachers.map((t) => {
                const isSelected =
                  currentSelected?.name === t.name ||
                  selectedTeacherName?.toLowerCase() === t.name.toLowerCase();

                return (
                  <button
                    key={t.id + t.name}
                    type="button"
                    onClick={() => handleSelect(t.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200 font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs truncate font-semibold leading-tight">
                          {t.name}
                        </span>
                        {isSelected && (
                          <span className="shrink-0 text-blue-900 dark:text-blue-400">
                            <IconCheck size={14} />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 shrink-0 font-medium">
                          <IconBuilding size={12} className="text-slate-400" />
                          <span className="truncate max-w-[170px]">{t.department}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 shrink-0 font-mono font-bold text-slate-700 dark:text-slate-300">
                          <IconClock size={11} className="text-slate-400" />
                          {t.totalHours} s.
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                          isSelected
                            ? "bg-blue-900 text-white"
                            : "bg-slate-200/70 dark:bg-slate-750 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {t.totalHours} soat
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Pastki panel (Footer) */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-850/50">
            <span>
              Topildi: <b className="text-slate-800 dark:text-slate-200">{filteredTeachers.length}</b> / {teachers.length} nafar
            </span>
            {currentUserName && selectedTeacherName !== currentUserName && (
              <button
                type="button"
                onClick={() => handleSelect(currentUserName)}
                className="font-bold text-blue-900 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Mening yuklamam
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
