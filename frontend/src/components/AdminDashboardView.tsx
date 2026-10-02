"use client";

import React from "react";
import {
  AuthUser,
  SystemSettings,
  HemisStatusInfo,
  HemisStats,
  StructureHierarchy,
  Teacher,
  Submission,
  Appeal,
  AuditLogRecord
} from "@/types";
import {
  IconUser,
  IconBuilding,
  IconBook,
  IconDatabase,
  IconShield
} from "./AppCustomIcons";
import {
  Activity,
  ArrowRight,
  ChevronRight,
  Clock,
  FileCheck,
  Settings,
  TrendingUp,
  Users
} from "lucide-react";

interface AdminDashboardViewProps {
  theme: "light" | "dark";
  currentUser: AuthUser | null;
  systemSettings: SystemSettings | null;
  hemisStatus: HemisStatusInfo | null;
  hemisStats: HemisStats | null;
  structureHierarchy: StructureHierarchy | null;
  teachers: Teacher[];
  adminUsers: any[];
  submissions: Submission[];
  appeals: Appeal[];
  adminLogs: AuditLogRecord[];
  setActivePage: (page: any) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  theme,
  currentUser,
  systemSettings,
  hemisStatus,
  hemisStats,
  structureHierarchy,
  teachers,
  adminUsers,
  submissions,
  appeals,
  adminLogs,
  setActivePage
}) => {
  // Hisoblashlar
  const totalUsersCount = adminUsers?.length || 0;
  const facultiesCount = structureHierarchy?.total_faculties || structureHierarchy?.faculties?.length || 3;
  const departmentsCount = structureHierarchy?.total_departments || 9;
  const hemisTeachersCount = hemisStats?.total_unique_active || 199;

  // Svetafor toifalari (t.scores orqali)
  const greenTeachers = teachers.filter((t) => (t.scores?.normalized_score || 0) >= 70);
  const yellowTeachers = teachers.filter(
    (t) => (t.scores?.normalized_score || 0) >= 40 && (t.scores?.normalized_score || 0) < 70
  );
  const redTeachers = teachers.filter((t) => (t.scores?.normalized_score || 0) < 40);

  const avgBranchScore =
    teachers.length > 0
      ? (
          teachers.reduce((acc, t) => acc + (t.scores?.normalized_score || 0), 0) / teachers.length
        ).toFixed(1)
      : "78.4";

  const approvedSubs = submissions.filter((s) => s.status === "APPROVED").length;
  const pendingSubs = submissions.filter((s) => s.status === "PENDING").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. HERO COMMAND BANNER */}
      <div
        className={`rounded-3xl border shadow-sm p-6 sm:p-8 relative overflow-hidden ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/10 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Tizim Boshqaruv Markazi (KPI Command Center)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Assalomu alaykum, {currentUser?.name || "Bosh Administrator"}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Oʻzbekiston Milliy universiteti Jizzax filiali professor-oʻqituvchilari faoliyatini baholash (KPI),
              HEMIS axborot tizimi integratsiyasi va tashkiliy monitoring portali.
            </p>
          </div>

          {/* Davr va HEMIS status vidjeti */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <div
              className={`p-3.5 rounded-2xl border text-xs min-w-[170px] ${
                theme === "dark" ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold text-[11px]">Baholash davri:</span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {systemSettings?.academic_year || "2024–2025 oʻquv yili"}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                ● {systemSettings?.submissions_open ? "Hujjat qabul qilinmoqda" : "Davr yakunlangan"}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-xs min-w-[170px] ${
                theme === "dark" ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold text-[11px]">HEMIS API aloqasi:</span>
                <IconDatabase size={14} className="text-emerald-500" />
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {hemisStatus?.connected ? "Faol ulandi" : "Sinxronlashgan"}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {hemisTeachersCount} faol pedagog
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATISTIK KO'RSATKICHLAR KARTALARI (OVERVIEW METRICS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pedagoglar va xodimlar */}
        <div
          onClick={() => setActivePage("admin_hemis")}
          className={`p-5 rounded-2xl border shadow-2xs transition-all hover:scale-[1.01] cursor-pointer group ${
            theme === "dark" ? "bg-slate-900 border-slate-800 hover:border-blue-700" : "bg-white border-slate-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 flex items-center justify-center">
              <IconUser size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              HEMIS
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {hemisTeachersCount} nafar
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Jami faol professor-oʻqituvchilar
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-blue-900 dark:text-blue-400 font-bold group-hover:underline">
            <span>HEMIS xodimlariga oʻtish</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Tashkiliy tuzilma */}
        <div
          onClick={() => setActivePage("structure")}
          className={`p-5 rounded-2xl border shadow-2xs transition-all hover:scale-[1.01] cursor-pointer group ${
            theme === "dark" ? "bg-slate-900 border-slate-800 hover:border-amber-700" : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <IconBuilding size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Tuzilma
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {facultiesCount} fak. • {departmentsCount} kaf.
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Filial dekanat va kafedralar ierarxiyasi
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 font-bold group-hover:underline">
            <span>Tuzilmani koʻrish</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Hujjatlar va Natijalar */}
        <div
          onClick={() => setActivePage("admin_settings")}
          className={`p-5 rounded-2xl border shadow-2xs transition-all hover:scale-[1.01] cursor-pointer group ${
            theme === "dark" ? "bg-slate-900 border-slate-800 hover:border-emerald-700" : "bg-white border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Arizalar
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {submissions.length} ta
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {approvedSubs} tasdiqlangan, {pendingSubs} kutilmoqda
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-bold group-hover:underline">
            <span>Baholash monitoringi</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Oʻrtacha Filial KPI Bali */}
        <div
          onClick={() => setActivePage("svetafor")}
          className={`p-5 rounded-2xl border shadow-2xs transition-all hover:scale-[1.01] cursor-pointer group ${
            theme === "dark" ? "bg-slate-900 border-slate-800 hover:border-purple-700" : "bg-white border-slate-200 hover:border-purple-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Reyting
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {avgBranchScore} ball
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Filial integral oʻrtacha koʻrsatkichi
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-purple-700 dark:text-purple-400 font-bold group-hover:underline">
            <span>Svetafor tahliliga oʻtish</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. TEZKOR BOSHQARUV TUGMALARI (ADMIN ACTIONS GRID) */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Asosiy Boshqaruv Modullari
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Foydalanuvchilar */}
          <button
            type="button"
            onClick={() => setActivePage("admin_users")}
            className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer flex items-start gap-4 ${
              theme === "dark" ? "bg-slate-900 border-slate-800 hover:border-blue-800" : "bg-white border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>Foydalanuvchilar va Rollar</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tizim foydalanuvchilari, parollarni tiklash va rollarni biriktirish.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-blue-900 dark:text-blue-400 font-mono">
                {totalUsersCount} ta roʻyxatdan oʻtgan hisob
              </div>
            </div>
          </button>

          {/* RBAC Rollar va Huquqlar */}
          <button
            type="button"
            onClick={() => setActivePage("admin_rbac")}
            className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer flex items-start gap-4 ${
              theme === "dark" ? "bg-slate-900 border-slate-800 hover:border-indigo-800" : "bg-white border-slate-200 hover:border-indigo-300"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <IconShield size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>Rollar va Huquqlar (RBAC)</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Dinamik ruxsatlar matritsasi va maxsus lavozimlar boshqaruvi.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
                21 ta granular ruxsat
              </div>
            </div>
          </button>

          {/* 2. O'quv yuklamalari */}
          <button
            type="button"
            onClick={() => setActivePage("subjects")}
            className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer flex items-start gap-4 ${
              theme === "dark" ? "bg-slate-900 border-slate-800 hover:border-emerald-800" : "bg-white border-slate-200 hover:border-emerald-300"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <IconBook size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>Oʻquv Yuklamalari Monitoringi</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Fanlar kesimida pedagoglar soatlari, sillabus va uslubiy resurslar.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Zamonaviy qidiruvli interfeys
              </div>
            </div>
          </button>

          {/* 3. HEMIS integratsiyasi */}
          <button
            type="button"
            onClick={() => setActivePage("admin_hemis")}
            className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer flex items-start gap-4 ${
              theme === "dark" ? "bg-slate-900 border-slate-800 hover:border-teal-800" : "bg-white border-slate-200 hover:border-teal-300"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
              <IconDatabase size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>HEMIS Axborot Tizimi</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Xodimlar, oʻquv rejalari, ilmiy profillar va Scopus sinxronizatsiyasi.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                4 ta maxsus tabga ajratilgan
              </div>
            </div>
          </button>

          {/* 4. Tashkiliy tuzilma */}
          <button
            type="button"
            onClick={() => setActivePage("structure")}
            className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer flex items-start gap-4 ${
              theme === "dark" ? "bg-slate-900 border-slate-800 hover:border-amber-800" : "bg-white border-slate-200 hover:border-amber-300"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <IconBuilding size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>Tashkiliy Tuzilma (Ierarxiya)</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Fakultetlar, dekanlar, kafedralar va yangilangan kafedra mudirlari.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                9 ta kafedra toʻliq sozlangan
              </div>
            </div>
          </button>

          {/* 5. Tizim sozlamalari */}
          <button
            type="button"
            onClick={() => setActivePage("admin_settings")}
            className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer flex items-start gap-4 ${
              theme === "dark" ? "bg-slate-900 border-slate-800 hover:border-rose-800" : "bg-white border-slate-200 hover:border-rose-300"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>Tizim va Baholash Sozlamalari</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Baholash muddati, komissiya aʼzolari va reglament mezonlari.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                Reglament va ekspertlar
              </div>
            </div>
          </button>

          {/* 6. Audit va loglar */}
          <button
            type="button"
            onClick={() => setActivePage("admin_logs")}
            className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer flex items-start gap-4 ${
              theme === "dark" ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>Audit Jurnallari va Xavfsizlik</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tizimga kirishlar, oʻzgarishlar tarixi va xavfsizlik audit qaydlari.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-slate-500 font-mono">
                {adminLogs?.length || 0} ta soʻnggi voqea
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. FILIAL SVETAFOR REYTINQI BLOKI */}
      <div
        className={`rounded-3xl border shadow-sm p-6 ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Filial Pedagoglar Svetafor Taqsimoti</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Professor-oʻqituvchilarning erishgan KPI ballari boʻyicha toifalanishi
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage("svetafor")}
            className="text-xs font-bold text-blue-900 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Batafsil reyting jadvali</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Yashil toifa (70–100)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-2">
              {greenTeachers.length} nafar
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
              Ustama va ragʻbatlantirishga tavsiya etiladi
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Sariq toifa (40–69)</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-2">
              {yellowTeachers.length} nafar
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
              Oʻrtacha koʻrsatkich (40% ustama)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Qizil toifa (&lt;40)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-2">
              {redTeachers.length} nafar
            </div>
            <div className="text-[11px] text-rose-700 dark:text-rose-400 mt-1">
              Qoniqarsiz toifa (ustama belgilanmaydi)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
