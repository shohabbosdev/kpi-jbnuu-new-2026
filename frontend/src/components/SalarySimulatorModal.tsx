"use client";

import React, { useState } from "react";
import { X, TrendingUp, Award, Calculator, Check, ArrowRight, Zap, DollarSign } from "lucide-react";

interface SalarySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScore: number;
  teacherName?: string;
  fte?: number;
}

interface ActivityItem {
  id: string;
  name: string;
  category: string;
  points: number;
  description: string;
}

const ACTIVITIES: ActivityItem[] = [
  { id: "scopus_q1", name: "Scopus / WoS Q1-Q2 jurnali", category: "Ilmiy faoliyat", points: 30, description: "Xalqaro nufuzli jurnaldagi maqola" },
  { id: "scopus_q3", name: "Scopus / WoS Q3-Q4 jurnali", category: "Ilmiy faoliyat", points: 20, description: "Xalqaro indekslangan ilmiy maqola" },
  { id: "textbook", name: "Darslik (Vazirlik grifi)", category: "Oʻquv-uslubiy", points: 35, description: "Kengashdan oʻtgan rasmiy darslik" },
  { id: "manual", name: "Oʻquv qoʻllanma", category: "Oʻquv-uslubiy", points: 25, description: "Filial kengashida tasdiqlangan qoʻllanma" },
  { id: "syllabus", name: "Yangi fan sillabusi", category: "Oʻquv-uslubiy", points: 10, description: "Tasdiqlangan fan ishchi dasturi" },
  { id: "patent", name: "Patent / DGU guvohnomasi", category: "Innovatsiya", points: 15, description: "Mualliflik huquqi guvohnomasi" },
  { id: "olympiad", name: "Talabani olimpiadada gʻolib qilish", category: "Ustoz-shogird", points: 20, description: "Respublika bosqichi 1-3 oʻrinlar" }
];

export const SalarySimulatorModal: React.FC<SalarySimulatorModalProps> = ({
  isOpen,
  onClose,
  currentScore,
  teacherName = "Oʻqituvchi",
  fte = 1.0
}) => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [baseSalary, setBaseSalary] = useState<number>(6000000); // O'rtacha oylik maosh: 6 mln so'm

  if (!isOpen) return null;

  const toggleActivity = (id: string) => {
    if (selectedActivities.includes(id)) {
      setSelectedActivities(selectedActivities.filter(a => a !== id));
    } else {
      setSelectedActivities([...selectedActivities, id]);
    }
  };

  const addedPoints = selectedActivities.reduce((sum, id) => {
    const act = ACTIVITIES.find(a => a.id === id);
    return sum + (act ? act.points : 0);
  }, 0);

  const rawSimulatedScore = currentScore + addedPoints;
  const normalizedSimulatedScore = fte > 0 ? Math.round((rawSimulatedScore / fte) * 10) / 10 : rawSimulatedScore;

  // Rasmiy Nizom bo'yicha ustama toifalari
  const getTier = (score: number) => {
    if (score >= 100) return { percent: 50, label: "Oltin toifa (Maksimal)", color: "text-amber-500", bg: "bg-amber-500", border: "border-amber-400" };
    if (score >= 80) return { percent: 30, label: "Yashil toifa (Yuqori)", color: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-400" };
    if (score >= 60) return { percent: 15, label: "Sariq toifa (Oʻrta)", color: "text-sky-500", bg: "bg-sky-500", border: "border-sky-400" };
    return { percent: 0, label: "Qizil toifa (Yetarsiz)", color: "text-rose-500", bg: "bg-rose-500", border: "border-rose-400" };
  };

  const currentTier = getTier(currentScore);
  const futureTier = getTier(normalizedSimulatedScore);

  const currentBonusAmount = Math.round(baseSalary * (currentTier.percent / 100));
  const futureBonusAmount = Math.round(baseSalary * (futureTier.percent / 100));
  const diffBonus = futureBonusAmount - currentBonusAmount;

  // Keyingi toifagacha qancha ball qolgan
  const getNextTierThreshold = (score: number) => {
    if (score < 60) return { target: 60, needed: Math.round((60 - score) * 10) / 10, nextPercent: 15 };
    if (score < 80) return { target: 80, needed: Math.round((80 - score) * 10) / 10, nextPercent: 30 };
    if (score < 100) return { target: 100, needed: Math.round((100 - score) * 10) / 10, nextPercent: 50 };
    return null;
  };

  const nextTierInfo = getNextTierThreshold(currentScore);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <TrendingUp className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Oylik Ustama va Karyera Simulyatori
              </h3>
              <p className="text-xs text-emerald-200/80">
                Reyting ballaringiz oylik daromad va ustamaga taʼsirini real vaqtda hisoblang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Hozirgi holat va Keyingi toifaga yo'l */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Joriy KPI holatingiz:</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{currentScore} ball</span>
                <span className={`text-xs font-bold ${currentTier.color}`}>
                  ({currentTier.percent}% ustama)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Kategoriya: <b className="text-slate-700 dark:text-slate-300">{currentTier.label}</b>
              </p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Keyingi toifa maqsadi:</span>
              {nextTierInfo ? (
                <>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      +{nextTierInfo.needed} ball
                    </span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      ({nextTierInfo.nextPercent}% ustamaga yetish uchun)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Maqsad: <b className="text-indigo-900 dark:text-indigo-200">{nextTierInfo.target} ball</b> darajasi
                  </p>
                </>
              ) : (
                <div className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Tabriklaymiz! Siz allaqachon maksimal (50%) toifadasiz!</span>
                </div>
              )}
            </div>
          </div>

          {/* Interaktiv Simulyatsiya Rejalari */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Yana qanday ishlarni rejalashtiryapsiz? (Belgilang):
              </label>
              {addedPoints > 0 && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                  +{addedPoints} qoʻshimcha ball
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
              {ACTIVITIES.map(act => {
                const isSelected = selectedActivities.includes(act.id);
                return (
                  <div
                    key={act.id}
                    onClick={() => toggleActivity(act.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm"
                        : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? "bg-emerald-600 text-white" : "border border-slate-300 dark:border-slate-600"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{act.name}</span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          +{act.points} b.
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{act.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kutilayotgan Natija (Forecast) */}
          <div className="p-4.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                Kutilayotgan natija (Simulyatsiya):
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {normalizedSimulatedScore} ball
                </span>
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                  → {futureTier.percent}% oylik ustama
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Oylik ustamangiz: <b className="text-slate-800 dark:text-slate-200">~{futureBonusAmount.toLocaleString("uz-UZ")} soʻm/oy</b>
                {diffBonus > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                    (+{diffBonus.toLocaleString("uz-UZ")} soʻm koʻp!)
                  </span>
                )}
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-teal-200 dark:border-teal-800 text-center flex-shrink-0 w-full sm:w-auto">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Reyting toifasi</span>
              <span className={`text-xs font-black ${futureTier.color} block mt-0.5`}>
                {futureTier.label}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
