"use client";

import React, { useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  HelpCircle,
  Layers,
  Save,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  XCircle
} from "lucide-react";
import { SystemSettings, EvaluatorRecord } from "@/types";

interface AdminSettingsPanelProps {
  systemSettings: SystemSettings;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  handleSaveEvaluationPeriod: (e: React.FormEvent) => Promise<void>;
  isSavingSettings: boolean;
  settingsSaveSuccess: boolean;
  evaluators: EvaluatorRecord[];
  setIsAddEvaluatorModalOpen: (open: boolean) => void;
  handleDeleteEvaluator: (id: number, name: string) => void;
  theme: "light" | "dark";
}

export const AdminSettingsPanel: React.FC<AdminSettingsPanelProps> = ({
  systemSettings,
  setSystemSettings,
  handleSaveEvaluationPeriod,
  isSavingSettings,
  settingsSaveSuccess,
  evaluators,
  setIsAddEvaluatorModalOpen,
  handleDeleteEvaluator,
  theme
}) => {
  const [evaluatorSearch, setEvaluatorSearch] = useState("");

  const filteredEvaluators = evaluators.filter((ev) => {
    const q = evaluatorSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      ev.name.toLowerCase().includes(q) ||
      ev.username.toLowerCase().includes(q) ||
      (ev.assigned_category && ev.assigned_category.toLowerCase().includes(q))
    );
  });

  // Byudjetni chiroyli formatlash
  const formatMoney = (val: number | string) => {
    const n = Number(val) || 0;
    return n.toLocaleString("uz-UZ");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header Banner */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 shadow-sm transition-all ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Settings className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Tizim konfiguratsiyasi va reglament
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    systemSettings.submissions_open
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      systemSettings.submissions_open ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                  {systemSettings.submissions_open ? "Qabul ochiq" : "Qabul toʻxtatilgan"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                KPI baholash bosqichlari kalendari, qabul eshigi va oylik ragʻbatlantirish byudjeti nazorati
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                theme === "dark"
                  ? "bg-slate-800 border-slate-700 text-blue-300"
                  : "bg-blue-50 border-blue-200 text-blue-900"
              }`}
            >
              {systemSettings.academic_year}
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {settingsSaveSuccess && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border animate-in fade-in duration-200 ${
              theme === "dark"
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Reglament parametrlari va muddatlar muvaffaqiyatli saqlandi hamda tizimda toʻliq qoʻllanildi.</span>
          </div>
        )}
      </div>

      {/* 2. Asosiy parametrlar formasi */}
      <form onSubmit={handleSaveEvaluationPeriod} className="space-y-6">
        {/* Karta A: Qabul eshigi va O'quv yili (2 ustunli) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* O'quv yili va Qabul Gateway */}
          <div
            className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Oʻquv davri va qabul eshigi
              </h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Rasmiy oʻquv yili:
              </label>
              <input
                type="text"
                required
                value={systemSettings.academic_year}
                onChange={(e) => setSystemSettings({ ...systemSettings, academic_year: e.target.value })}
                placeholder="2025/2026-oʻquv yili"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Filial rasmiy meʼyoriy hujjatlarida aks etadigan hisobot oʻquv yili
              </p>
            </div>

            {/* Qabul Switch Kartasi */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                systemSettings.submissions_open
                  ? theme === "dark"
                    ? "bg-emerald-950/20 border-emerald-900/60"
                    : "bg-emerald-50/70 border-emerald-200"
                  : theme === "dark"
                  ? "bg-rose-950/20 border-rose-900/60"
                  : "bg-rose-50/70 border-rose-200"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Arizalar va hujjatlar qabuli</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      systemSettings.submissions_open
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
                    }`}
                  >
                    {systemSettings.submissions_open ? "OCHIQ" : "TOʻXTATILGAN"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {systemSettings.submissions_open
                    ? "Oʻqituvchilar yangi natija kiritishi va hujjat yuklashi mumkin"
                    : "Yangi natijalarni kiritish va tahrirlash bloklangan"}
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={systemSettings.submissions_open}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, submissions_open: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Byudjet va Bosqich tanlovi */}
          <div
            className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Byudjet va reglament bosqichi
              </h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Joriy faol bosqich (Reglament statusi):
              </label>
              <select
                value={systemSettings.current_stage || "ALL_OPEN"}
                onChange={(e) => setSystemSettings({ ...systemSettings, current_stage: e.target.value })}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                <option value="ALL_OPEN">🟢 Barcha jarayonlar faol (Sinov / Ochiq rejim)</option>
                <option value="SUBMISSION_STAGE">📝 1-bosqich: Faqat arizalar topshirish davri</option>
                <option value="REVIEW_STAGE">🔍 2-bosqich: Ekspertlar tekshiruvi davri</option>
                <option value="APPEAL_STAGE">⚖️ 3-bosqich: Apellyatsiya koʻrib chiqish davri</option>
                <option value="CLOSED">🔒 4-bosqich: Yakuniy tasdiqlangan (Reyting yopiq)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Yuqori taymer va tizim amallari aynan shu bosqichga mos ishlaydi
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Oylik ragʻbatlantirish byudjet limiti:
                </label>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatMoney(systemSettings.budget_cap_monthly)} soʻm
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  required
                  step="1000000"
                  value={systemSettings.budget_cap_monthly}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, budget_cap_monthly: Number(e.target.value) })
                  }
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">
                  SOʻM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Svetafor tizimi va oylik ustama fondi hisob-kitobida qoʻllanadi
              </p>
            </div>
          </div>
        </div>

        {/* Karta B: 3 Bosqichli Reglament Kalendari (Interactive Stage Cards) */}
        <div
          className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                3 bosqichli reglament kalendari va muddatlar
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Har bir bosqichning soʻnggi yakunlanish sanasi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bosqich 1: Ariza topshirish */}
            <div
              className={`p-4 rounded-xl border relative transition-all ${
                theme === "dark"
                  ? "bg-blue-950/20 border-blue-900/60"
                  : "bg-blue-50/50 border-blue-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Ariza topshirish muddati
                  </h5>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    Oʻqituvchilar davri
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                Professor-oʻqituvchilar KPI natijalari va tasdiqlovchi hujjatlarni kiritish muddati.
              </p>

              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Oxirgi sana:
              </label>
              <input
                type="date"
                required
                value={systemSettings.submission_deadline || systemSettings.deadline_date}
                onChange={(e) =>
                  setSystemSettings({
                    ...systemSettings,
                    submission_deadline: e.target.value,
                    deadline_date: e.target.value
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-white border-slate-300 text-slate-900"
                }`}
              />
            </div>

            {/* Bosqich 2: Ekspertlar tekshiruvi */}
            <div
              className={`p-4 rounded-xl border relative transition-all ${
                theme === "dark"
                  ? "bg-amber-950/20 border-amber-900/60"
                  : "bg-amber-50/50 border-amber-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Baholash / Tekshirish
                  </h5>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    Ekspertlar davri
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                Kafedra mudirlari va biriktirilgan ekspertlar arizalarni tekshiradi va ball qoʻyadi.
              </p>

              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Oxirgi sana:
              </label>
              <input
                type="date"
                required
                value={systemSettings.review_deadline || "2026-11-05"}
                onChange={(e) => setSystemSettings({ ...systemSettings, review_deadline: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-white border-slate-300 text-slate-900"
                }`}
              />
            </div>

            {/* Bosqich 3: Apellyatsiya */}
            <div
              className={`p-4 rounded-xl border relative transition-all ${
                theme === "dark"
                  ? "bg-purple-950/20 border-purple-900/60"
                  : "bg-purple-50/50 border-purple-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Apellyatsiya muddati
                  </h5>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                    Komissiya davri
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                Natijadan norozi boʻlgan oʻqituvchilar eʼtiroz arizasi beradi va komissiya koʻrib chiqadi.
              </p>

              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Oxirgi sana:
              </label>
              <input
                type="date"
                required
                value={systemSettings.appeal_deadline || "2026-11-15"}
                onChange={(e) => setSystemSettings({ ...systemSettings, appeal_deadline: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-white border-slate-300 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* Saqlash tugmasi */}
          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? "Saqlanmoqda..." : "Reglament va sozlamalarni saqlash"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 3. BAHOLOVCHILAR VA EKSPERTLAR KOMISSIYASI REYESTRI */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border shadow-sm space-y-4 ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Tayinlangan baholovchilar va ekspertlar komissiyasi
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                {evaluators.length} nafar masʼul
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mezonlar yoʻnalishlari va kafedralar boʻyicha arizalarni tekshiruvchi masʼul ekspertlar
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Ekspertni qidirish..."
                value={evaluatorSearch}
                onChange={(e) => setEvaluatorSearch(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAddEvaluatorModalOpen(true)}
              className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <span>+ Yangi baholovchi tayinlash</span>
            </button>
          </div>
        </div>

        {/* Ekspertlar jadvali */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Baholovchi F.I.Sh.</th>
                <th className="py-3 px-4">Masʼul yoʻnalishi / Mezon bloki</th>
                <th className="py-3 px-4">Roli</th>
                <th className="py-3 px-4">Baholash muddati</th>
                <th className="py-3 px-4 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEvaluators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    {evaluators.length === 0
                      ? "Hozircha qoʻshimcha ekspertlar biriktirilmagan. «+ Yangi baholovchi tayinlash» orqali qoʻshing."
                      : "Qidiruv boʻyicha baholovchi topilmadi."}
                  </td>
                </tr>
              ) : (
                filteredEvaluators.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div>{ev.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{ev.username}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                        {ev.assigned_category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {ev.role_type === "EXPERT"
                        ? "Ilmiy/Oʻquv Eksperti"
                        : ev.role_type === "COMMISSION"
                        ? "Apellyatsiya Komissiyasi"
                        : ev.role_type}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {ev.deadline_date || "2026-06-25"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteEvaluator(ev.id, ev.name)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                        title="Baholovchini roʻyxatdan chiqarish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
