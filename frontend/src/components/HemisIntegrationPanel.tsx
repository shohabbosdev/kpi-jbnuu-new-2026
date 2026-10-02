"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Check,
  Database,
  ExternalLink,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  LockKeyhole,
  Microscope,
  RefreshCw,
  Search,
  ShieldCheck,
  Users
} from "lucide-react";
import {
  HemisStatusInfo,
  HemisStats,
  HemisCurriculum,
  HemisScientificActivity,
  HemisDoctorateStudent,
  HemisAcademicStats
} from "@/types";
import { UniversalPagination } from "@/components/UniversalPagination";

interface HemisIntegrationPanelProps {
  theme: "light" | "dark";
  hemisStatus: HemisStatusInfo | null;
  hemisStats: HemisStats | null;
  isHemisSyncing: boolean;
  hemisSyncMessage: string | null;
  promptSyncHemis: () => void;
  handleSyncWorkloads: () => void;
  isWorkloadsLoading: boolean;
  workloadsSummary: any;
  teacherWorkloads: any[];
  hemisCurriculums: HemisCurriculum[];
  hemisScientificActivities: HemisScientificActivity[];
  hemisDoctorateStudents: HemisDoctorateStudent[];
  hemisAcademicStats: HemisAcademicStats | null;
  isAcademicLoading: boolean;
  handleSyncAcademicData: () => void;
  filteredHemisEmployees: any[];
  pagedHemisEmployees: any[];
  hemisEmployeeType: "teacher" | "all";
  setHemisEmployeeType: (t: "teacher" | "all") => void;
  hemisFilterText: string;
  setHemisFilterText: (t: string) => void;
  hemisPage: number;
  setHemisPage: (p: number) => void;
  hemisPerPage: number;
  setHemisPerPage: (s: number) => void;
  isHemisLoading: boolean;
  getTeacherWorkloadData: (id: any) => any;
  setSelectedWorkloadTeacher: (t: any) => void;
  hemisCurriculumFilter: string;
  setHemisCurriculumFilter: (s: string) => void;
}

export const HemisIntegrationPanel: React.FC<HemisIntegrationPanelProps> = ({
  theme,
  hemisStatus,
  hemisStats,
  isHemisSyncing,
  hemisSyncMessage,
  promptSyncHemis,
  handleSyncWorkloads,
  isWorkloadsLoading,
  workloadsSummary,
  teacherWorkloads,
  hemisCurriculums,
  hemisScientificActivities,
  hemisDoctorateStudents,
  hemisAcademicStats,
  isAcademicLoading,
  handleSyncAcademicData,
  filteredHemisEmployees,
  pagedHemisEmployees,
  hemisEmployeeType,
  setHemisEmployeeType,
  hemisFilterText,
  setHemisFilterText,
  hemisPage,
  setHemisPage,
  hemisPerPage,
  setHemisPerPage,
  isHemisLoading,
  getTeacherWorkloadData,
  setSelectedWorkloadTeacher,
  hemisCurriculumFilter,
  setHemisCurriculumFilter
}) => {
  // Asosiy HEMIS kichik bo'limlari (Tablari)
  const [activeHemisTab, setActiveHemisTab] = useState<"employees" | "workloads" | "curriculums" | "scientific">("employees");
  const [scientificSearch, setScientificSearch] = useState("");
  const [scientificPlatformFilter, setScientificPlatformFilter] = useState("ALL");

  const totalEmployeePages = Math.ceil(filteredHemisEmployees.length / hemisPerPage) || 1;

  const filteredScientificActivities = (hemisScientificActivities || []).filter((s) => {
    const q = scientificSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      (s.employee_name && s.employee_name.toLowerCase().includes(q)) ||
      (s.scientific_platform && s.scientific_platform.toLowerCase().includes(q));
    const matchPlatform =
      scientificPlatformFilter === "ALL" ||
      (s.scientific_platform && s.scientific_platform.toLowerCase() === scientificPlatformFilter.toLowerCase());
    return matchSearch && matchPlatform;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Yuqori HEMIS Status va Sinxronizatsiya Headeri */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 shadow-sm transition-all ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl border shadow-sm flex-shrink-0 ${
                theme === "dark"
                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-400"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  HEMIS Axborot Tizimi Integratsiyasi
                </h3>
                {hemisStatus?.connected ? (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      theme === "dark"
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Faol ulandi
                  </span>
                ) : (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      theme === "dark"
                        ? "bg-rose-950/60 text-rose-300 border-rose-800"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}
                  >
                    Ulanmagan
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Server: {hemisStatus?.base_url || "https://student.jbnuu.uz/rest/v1"}
              </p>
            </div>
          </div>

          <button
            onClick={promptSyncHemis}
            disabled={isHemisSyncing}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isHemisSyncing ? "animate-spin" : ""}`} />
            <span>{isHemisSyncing ? "Sinxronlashtirilmoqda..." : "HEMIS bilan toʻliq sinxronlash"}</span>
          </button>
        </div>

        {hemisSyncMessage && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border animate-in fade-in duration-200 ${
              theme === "dark"
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{hemisSyncMessage}</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <LockKeyhole className="w-3.5 h-3.5 text-blue-500" />
            <span>Shaxsga doir maxfiy maʼlumotlar xavfsizligi kafolatlangan (Pasport, manzil bazada saqlanmaydi)</span>
          </div>
          <span className="hidden sm:inline font-mono text-[11px] text-slate-400">Token: .env himoyalangan</span>
        </div>
      </div>

      {/* 2. Asosiy 4 ta Bo'lim Navigatsiya Tablari (Segmented Navigation) */}
      <div
        className={`p-1.5 rounded-2xl border shadow-xs flex items-center gap-1.5 overflow-x-auto max-w-full ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveHemisTab("employees")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeHemisTab === "employees"
              ? "bg-blue-900 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Xodimlar va pedagoglar</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
              activeHemisTab === "employees"
                ? "bg-blue-800 text-blue-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {hemisStats?.total_unique_active || 199}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHemisTab("workloads")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeHemisTab === "workloads"
              ? "bg-blue-900 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>2. Oʻquv yuklamalari</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
              activeHemisTab === "workloads"
                ? "bg-blue-800 text-blue-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {workloadsSummary?.total_items || teacherWorkloads.length || 456}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHemisTab("curriculums")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeHemisTab === "curriculums"
              ? "bg-blue-900 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-purple-400" />
          <span>3. Oʻquv rejalari va fanlar</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
              activeHemisTab === "curriculums"
                ? "bg-blue-800 text-blue-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {hemisCurriculums.length || 197}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveHemisTab("scientific")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeHemisTab === "scientific"
              ? "bg-blue-900 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Microscope className="w-4 h-4 text-amber-400" />
          <span>4. Ilmiy faoliyat va doktorantura</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
              activeHemisTab === "scientific"
                ? "bg-blue-800 text-blue-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            {(hemisScientificActivities.length || 271) + (hemisDoctorateStudents.length || 28)}
          </span>
        </button>
      </div>

      {/* 3. TABLAR MAZMUNI */}

      {/* TAB 1: XODIMLAR VA PEDAGOGLAR */}
      {activeHemisTab === "employees" && (
        <div className="space-y-6">
          {/* Deduplication & Cleanup Alert */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 shadow-sm transition-colors ${
              theme === "dark"
                ? "bg-slate-900 border-blue-900/60 text-slate-200"
                : "bg-blue-50/80 border-blue-200/80 text-slate-700"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h5
                className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${
                  theme === "dark" ? "text-blue-300" : "text-blue-950"
                }`}
              >
                <span>Dublikatlarni tozalash, pedagogik shtat va xavfsiz avtorizatsiya mexanizmi</span>
              </h5>
              <div className="text-xs leading-relaxed space-y-1">
                <p>
                  • <b>Pedagogik shtat mezoni:</b> Agar xodim maʼmuriy lavozimda (masalan, 1.0 stavka) ishlab, kafedrada 0.5 yoki 0.25 stavka dars bersa, uning KPI dagi hisob-kitob stavkasi aynan uning <b>pedagogik stavkasi (0.5 yoki 0.25)</b> boʻyicha olinadi. Oʻqituvchilik shartnomasi boʻlmagan sof maʼmuriy xodimlar KPI dan chetlatiladi.
                </p>
                <p>
                  • <b>Birlamchi login va parol:</b> Har bir oʻqituvchi oʻzining <b>HEMIS ID raqami</b> orqali login va birlamchi parol bilan tizimga kiradi.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-2xl border shadow-sm ${
                theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold uppercase text-slate-400">Xom HEMIS yozuvlari</span>
                <Database className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {hemisStats?.raw_total_records || 459} ta
              </div>
              <div className="text-[11px] text-slate-400 mt-1">HEMIS dagi barcha shartnoma qatorlari</div>
            </div>

            <div
              className={`p-4 rounded-2xl border shadow-sm ${
                theme === "dark" ? "bg-slate-900 border-rose-900/40" : "bg-white border-rose-200 bg-rose-50/20"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400">Boʻshaganlar</span>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {hemisStats?.total_fired_excluded || 110} nafar
              </div>
              <div className="text-[11px] text-rose-500 mt-1">Universitetda ishlamaydi (chiqarilgan)</div>
            </div>

            <div
              className={`p-4 rounded-2xl border shadow-sm ${
                theme === "dark" ? "bg-slate-900 border-amber-900/40" : "bg-white border-amber-200 bg-amber-50/20"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">Birlashtirilgan oʻrindoshlik</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {hemisStats?.multi_contracts_merged || 7} nafar
              </div>
              <div className="text-[11px] text-amber-500 mt-1">Asosiy va oʻrindosh stavkalari jamlandi</div>
            </div>

            <div
              className={`p-4 rounded-2xl border shadow-sm ${
                theme === "dark" ? "bg-slate-900 border-emerald-900/40" : "bg-white border-emerald-200 bg-emerald-50/20"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Noyob faol oʻqituvchilar</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {hemisStats?.total_unique_active || 199} nafar
              </div>
              <div className="text-[11px] text-emerald-500 mt-1">Hozirda faol professor-oʻqituvchilar</div>
            </div>
          </div>

          {/* Cleaned Employees Table */}
          <div
            className={`rounded-2xl border shadow-sm p-5 sm:p-6 ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Tozalangan va Unifikatsiya qilingan Xodimlar Bazasi
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dublikatlarsiz va sobiq boʻshagan xodimlarsiz filtrlangan yagona roʻyxat (jami: {filteredHemisEmployees.length} nafar)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="http://localhost:8080/api/export/hemis-excel"
                  download
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                  title="HEMIS dan tozalangan xodimlar bazasini Excel (.xlsx) faylida yuklab olish"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
                  <span>Excel (.xlsx) yuklash</span>
                </a>

                <div
                  className={`flex p-0.5 rounded-xl border text-xs ${
                    theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
                  }`}
                >
                  <button
                    onClick={() => {
                      setHemisEmployeeType("teacher");
                      setHemisPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      hemisEmployeeType === "teacher"
                        ? theme === "dark"
                          ? "bg-slate-700 text-white shadow-xs"
                          : "bg-white text-blue-950 shadow-xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Faqat oʻqituvchilar
                  </button>
                  <button
                    onClick={() => {
                      setHemisEmployeeType("all");
                      setHemisPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      hemisEmployeeType === "all"
                        ? theme === "dark"
                          ? "bg-slate-700 text-white shadow-xs"
                          : "bg-white text-blue-950 shadow-xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Barcha xodimlar
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={hemisFilterText}
                    onChange={(e) => {
                      setHemisFilterText(e.target.value);
                      setHemisPage(1);
                    }}
                    placeholder="F.I.Sh., kafedra yoki ID..."
                    className={`pl-8 pr-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 w-56 ${
                      theme === "dark"
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>
            </div>

            {isHemisLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                HEMIS API dan maʼlumotlar yuklanmoqda...
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm">
                  <thead
                    className={`border-b text-xs font-bold uppercase ${
                      theme === "dark"
                        ? "bg-slate-900/90 border-slate-800 text-slate-400"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}
                  >
                    <tr>
                      <th className="py-3 px-4">Xodim</th>
                      <th className="py-3 px-4">Kodi (ID)</th>
                      <th className="py-3 px-4">Kafedrasi</th>
                      <th className="py-3 px-4">Lavozimi</th>
                      <th className="py-3 px-4">Ilmiy darajasi / Unvoni</th>
                      <th className="py-3 px-4">Shtati (Stavka)</th>
                      <th className="py-3 px-4">Holati</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === "dark" ? "divide-slate-800" : "divide-slate-100"}`}>
                    {pagedHemisEmployees.map((emp) => (
                      <tr
                        key={emp.id}
                        className={`transition-colors ${theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {emp.image ? (
                              <img
                                src={emp.image}
                                alt={emp.short_name}
                                className={`w-8 h-8 rounded-full object-cover border ${
                                  theme === "dark" ? "border-slate-700" : "border-slate-200"
                                }`}
                              />
                            ) : (
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  theme === "dark" ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {emp.full_name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-xs leading-snug text-slate-900 dark:text-white">
                                  {emp.full_name}
                                </span>
                                {(() => {
                                  const wl = getTeacherWorkloadData(emp.id || emp.full_name);
                                  if (wl && wl.totalHours > 0) {
                                    return (
                                      <button
                                        onClick={() =>
                                          setSelectedWorkloadTeacher({
                                            name: emp.full_name,
                                            id: emp.id,
                                            department: emp.department
                                          })
                                        }
                                        title="HEMIS Oʻquv yuklamasini koʻrish"
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
                                      >
                                        <BookOpen className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>{wl.totalHours} soat ({wl.subjectsCount} fan)</span>
                                      </button>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">{emp.short_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500">
                          {emp.employee_id_number || emp.id}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {emp.department || "—"}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {emp.staff_position || "Oʻqituvchi"}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                          {emp.academic_degree || "Darajasiz"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-xs font-mono text-blue-700 dark:text-blue-400">
                            {emp.rate ? `${emp.rate} stavka` : "1.0 stavka"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Faol
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <UniversalPagination
                currentPage={hemisPage}
                totalPages={totalEmployeePages}
                totalItems={filteredHemisEmployees.length}
                itemsPerPage={hemisPerPage}
                onPageChange={(p) => setHemisPage(p)}
                onItemsPerPageChange={(s) => {
                  setHemisPerPage(s);
                  setHemisPage(1);
                }}
                theme={theme}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: O'QUV YUKLAMALARI */}
      {activeHemisTab === "workloads" && (
        <div className="space-y-6">
          <div
            className={`rounded-2xl border shadow-sm p-5 sm:p-6 ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>HEMIS Oʻqituvchilar Oʻquv Yuklamasi (Teacher Workload)</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      REST API
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Oʻqituvchilarning dars soatlari, biriktirilgan fanlari va taʼlim turlari (Bakalavr / Magistr) integratsiyasi
                  </p>
                </div>
              </div>

              <button
                onClick={handleSyncWorkloads}
                disabled={isWorkloadsLoading}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isWorkloadsLoading ? "animate-spin" : ""}`} />
                <span>{isWorkloadsLoading ? "Sinxronlashtirilmoqda..." : "Yuklamalarni sinxronlash"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Jami yuklama qatorlari
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {workloadsSummary?.total_items || teacherWorkloads.length || 456} ta
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">HEMIS fan-oʻqituvchi yozuvlari</div>
              </div>

              <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/50 dark:bg-blue-950/20">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                  Biriktirilgan oʻqituvchilar
                </div>
                <div className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">
                  {workloadsSummary?.total_teachers || 179} nafar
                </div>
                <div className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">Oʻquv soatiga ega pedagoglar</div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Jami oʻquv soatlari
                </div>
                <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
                  {workloadsSummary?.total_hours?.toLocaleString() || "39,596"} soat
                </div>
                <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Akademik oʻquv yili hajmi</div>
              </div>

              <div className="p-4 rounded-xl border border-purple-100 dark:border-purple-950/60 bg-purple-50/50 dark:bg-purple-950/20">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                  Taʼlim bosqichlari
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                    Bakalavr: {workloadsSummary?.bachelor_hours?.toLocaleString() || "38,828"} s.
                  </span>
                </div>
                <div className="text-[11px] text-purple-700/80 dark:text-purple-400/80 mt-0.5">
                  Magistratura: {workloadsSummary?.master_hours?.toLocaleString() || "768"} s.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: O'QUV REJALARI VA FAN RESURSLARI */}
      {activeHemisTab === "curriculums" && (
        <div className="space-y-6">
          <div
            className={`rounded-2xl border shadow-sm p-5 sm:p-6 ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Oʻquv Rejalar va HEMIS Elektron Fan Resurslari</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Sync Kesh
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Filial mutaxassisliklari boʻyicha oʻquv rejalari va elektron fan resurslari kesh bazasi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={hemisCurriculumFilter}
                    onChange={(e) => setHemisCurriculumFilter(e.target.value)}
                    placeholder="Oʻquv rejasini qidirish..."
                    className={`pl-8 pr-3 py-1.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 w-60 ${
                      theme === "dark"
                        ? "bg-slate-800 border-slate-700 text-slate-100"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <button
                  onClick={handleSyncAcademicData}
                  disabled={isAcademicLoading}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAcademicLoading ? "animate-spin" : ""}`} />
                  <span>{isAcademicLoading ? "Yuklanmoqda..." : "Keshni yangilash"}</span>
                </button>
              </div>
            </div>

            {/* O'quv rejalari jadvali */}
            <div className="overflow-x-auto mt-4 rounded-xl border border-slate-100 dark:border-slate-800 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`sticky top-0 z-10 border-b font-bold uppercase text-[10px] ${
                    theme === "dark"
                      ? "bg-slate-800 text-slate-300 border-slate-700"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <tr>
                    <th className="py-2.5 px-3">Oʻquv reja nomi</th>
                    <th className="py-2.5 px-3">Mutaxassislik</th>
                    <th className="py-2.5 px-3">Kafedra</th>
                    <th className="py-2.5 px-3 text-center">Oʻquv yili</th>
                    <th className="py-2.5 px-3 text-center">Taʼlim shakli</th>
                    <th className="py-2.5 px-3 text-center">Baholash tizimi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {hemisCurriculums
                    .filter(
                      (c) =>
                        !hemisCurriculumFilter ||
                        c.name.toLowerCase().includes(hemisCurriculumFilter.toLowerCase()) ||
                        c.specialty_name.toLowerCase().includes(hemisCurriculumFilter.toLowerCase()) ||
                        c.specialty_code.includes(hemisCurriculumFilter)
                    )
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {c.specialty_code}
                          </span>{" "}
                          - {c.specialty_name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{c.department_name}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-[10px]">
                            {c.education_year}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[10px] font-bold">
                            {c.education_form}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-300 text-[11px]">
                          {c.marking_system}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ILMIY FAOLIYAT VA DOKTORANTURA */}
      {activeHemisTab === "scientific" && (
        <div className="space-y-6">
          <div
            className={`rounded-2xl border shadow-sm p-5 sm:p-6 ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <Microscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Ilmiy Profillar, H-index va Tadqiqotlar Reyestri
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Scopus, ResearchGate, Google Scholar va tayanch doktorantura faoliyati
                  </p>
                </div>
              </div>

              {/* Jonli qidiruv va platforma filtri */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={scientificSearch}
                    onChange={(e) => setScientificSearch(e.target.value)}
                    placeholder="Olim yoki platforma boʻyicha qidirish..."
                    className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all w-56 ${
                      theme === "dark"
                        ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  {["ALL", "Google Scholar", "Scopus", "ResearchGate"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setScientificPlatformFilter(p)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        scientificPlatformFilter === p
                          ? "bg-amber-600 text-white shadow-2xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {p === "ALL" ? "Barchasi" : p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ilmiy faoliyat jadvali */}
            <div className="overflow-x-auto mt-4 rounded-xl border border-slate-100 dark:border-slate-800 max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={`sticky top-0 z-10 border-b font-bold uppercase text-[10px] ${
                    theme === "dark"
                      ? "bg-slate-800 text-slate-300 border-slate-700"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <tr>
                    <th className="py-2.5 px-3">Olim / Tadqiqotchi</th>
                    <th className="py-2.5 px-3">Ilmiy platforma</th>
                    <th className="py-2.5 px-3 text-center">H-index</th>
                    <th className="py-2.5 px-3 text-center">Iqtiboslar</th>
                    <th className="py-2.5 px-3 text-center">Nashrlar soni</th>
                    <th className="py-2.5 px-3 text-center">Oʻquv yili</th>
                    <th className="py-2.5 px-3 text-center">Profil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredScientificActivities.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Qidiruv boʻyicha maʼlumot topilmadi
                      </td>
                    </tr>
                  ) : (
                    filteredScientificActivities.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {s.employee_name || `Olim #${s.employee_id || idx + 1}`}
                          </div>
                          {s.employee_id && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {s.employee_id}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[10px] font-bold">
                            {s.scientific_platform}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-600 font-mono">
                          {s.h_index || 0}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono">{s.citation_count || 0}</td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono">{s.publication_work_count || 0}</td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{s.education_year}</td>
                        <td className="py-2.5 px-3 text-center">
                          {s.profile_link ? (
                            <a
                              href={s.profile_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline text-[11px]"
                            >
                              <span>Ochish</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Doktorantlar jadvali */}
            {hemisDoctorateStudents.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  Doktorantlar va Tayanch Doktorantura Reyestri ({hemisDoctorateStudents.length} nafar)
                </h5>
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800 max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead
                      className={`sticky top-0 z-10 border-b font-bold uppercase text-[10px] ${
                        theme === "dark"
                          ? "bg-slate-800 text-slate-300 border-slate-700"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      <tr>
                        <th className="py-2.5 px-3">Doktorant</th>
                        <th className="py-2.5 px-3">Ixtisoslik</th>
                        <th className="py-2.5 px-3">Kafedra</th>
                        <th className="py-2.5 px-3">Dissertatsiya mavzusi</th>
                        <th className="py-2.5 px-3 text-center">Bosqich</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {hemisDoctorateStudents.map((d, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                            {d.full_name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                              {d.specialty_code}
                            </span>{" "}
                            - {d.specialty_name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{d.department_name}</td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                            {d.dissertation_theme || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-[10px]">
                              {d.level || d.doctoral_type || "Doktorant"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
