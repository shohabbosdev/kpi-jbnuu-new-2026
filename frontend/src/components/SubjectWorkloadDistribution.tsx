"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Layers, Award, BarChart3, GraduationCap } from "lucide-react";

interface SubjectWorkloadItem {
  id?: string | number;
  subject_name: string;
  total_hours: number;
  education_type_code?: string;
  education_type_name?: string;
  department_name?: string;
  [key: string]: any;
}

interface SubjectWorkloadDistributionProps {
  rawSubjects: SubjectWorkloadItem[];
  totalHours: number;
  theme: "light" | "dark";
}

interface AggregatedSubject {
  name: string;
  total_hours: number;
  percent: number;
  isMaster: boolean;
  isBachelor: boolean;
  blockCount: number;
  colorClass: string;
  barBgClass: string;
  textColorClass: string;
}

const PALETTE = [
  { bar: "bg-blue-600", lightBg: "bg-blue-100 dark:bg-blue-950/60", text: "text-blue-600 dark:text-blue-400" },
  { bar: "bg-emerald-600", lightBg: "bg-emerald-100 dark:bg-emerald-950/60", text: "text-emerald-600 dark:text-emerald-400" },
  { bar: "bg-indigo-600", lightBg: "bg-indigo-100 dark:bg-indigo-950/60", text: "text-indigo-600 dark:text-indigo-400" },
  { bar: "bg-amber-600", lightBg: "bg-amber-100 dark:bg-amber-950/60", text: "text-amber-600 dark:text-amber-400" },
  { bar: "bg-rose-600", lightBg: "bg-rose-100 dark:bg-rose-950/60", text: "text-rose-600 dark:text-rose-400" },
  { bar: "bg-teal-600", lightBg: "bg-teal-100 dark:bg-teal-950/60", text: "text-teal-600 dark:text-teal-400" },
  { bar: "bg-purple-600", lightBg: "bg-purple-100 dark:bg-purple-950/60", text: "text-purple-600 dark:text-purple-400" },
  { bar: "bg-cyan-600", lightBg: "bg-cyan-100 dark:bg-cyan-950/60", text: "text-cyan-600 dark:text-cyan-400" },
];

const OTHERS_COLOR = {
  bar: "bg-slate-400 dark:bg-slate-500",
  lightBg: "bg-slate-100 dark:bg-slate-800",
  text: "text-slate-600 dark:text-slate-400",
};

export const SubjectWorkloadDistribution: React.FC<SubjectWorkloadDistributionProps> = ({
  rawSubjects,
  totalHours,
  theme,
}) => {
  const [showAll, setShowAll] = useState(false);

  // 1. Fanlar nomi bo'yicha aqlli guruhlash (Smart Aggregation & Deduplication)
  const aggregatedData = useMemo(() => {
    if (!rawSubjects || rawSubjects.length === 0 || totalHours <= 0) {
      return {
        allSubjects: [],
        topSegments: [],
        dominantSubject: null,
        uniqueCount: 0,
        avgHours: 0,
      };
    }

    const map = new Map<string, {
      name: string;
      total_hours: number;
      isMaster: boolean;
      isBachelor: boolean;
      blockCount: number;
    }>();

    rawSubjects.forEach((item) => {
      const cleanName = (item.subject_name || "Nomaʼlum fan").trim();
      const lower = cleanName.toLowerCase();
      const isM = item.education_type_code === "12" || item.education_type_name === "Magistr";
      const isB = item.education_type_code === "11" || item.education_type_name === "Bakalavr" || (!isM);
      const hours = Number(item.total_hours) || 0;

      if (!map.has(lower)) {
        map.set(lower, {
          name: cleanName,
          total_hours: hours,
          isMaster: isM,
          isBachelor: isB,
          blockCount: 1,
        });
      } else {
        const existing = map.get(lower)!;
        existing.total_hours += hours;
        existing.blockCount += 1;
        if (isM) existing.isMaster = true;
        if (isB) existing.isBachelor = true;
      }
    });

    // Soati bo'yicha kamayish tartibida saralash
    const sorted = Array.from(map.values())
      .filter((s) => s.total_hours > 0)
      .sort((a, b) => b.total_hours - a.total_hours);

    const allSubjects: AggregatedSubject[] = sorted.map((s, idx) => {
      const pct = (s.total_hours / totalHours) * 100;
      const palette = PALETTE[idx % PALETTE.length];
      return {
        ...s,
        percent: Number(pct.toFixed(1)),
        colorClass: palette.bar,
        barBgClass: palette.lightBg,
        textColorClass: palette.text,
      };
    });

    // Top 5 + "Boshqa fanlar" segmentlari (Progress bar va asosiy ko'rinish uchun)
    let topSegments: Array<{
      name: string;
      total_hours: number;
      percent: number;
      colorClass: string;
      textColorClass: string;
      barBgClass: string;
      isOthers?: boolean;
      othersCount?: number;
      blockCount: number;
      isMaster?: boolean;
      isBachelor?: boolean;
    }> = [];

    if (allSubjects.length <= 5) {
      topSegments = allSubjects;
    } else {
      const top4 = allSubjects.slice(0, 4);
      const others = allSubjects.slice(4);
      const othersHours = others.reduce((acc, curr) => acc + curr.total_hours, 0);
      const othersPct = Number(((othersHours / totalHours) * 100).toFixed(1));

      topSegments = [
        ...top4,
        {
          name: `Boshqa fanlar (${others.length} ta fan)`,
          total_hours: othersHours,
          percent: othersPct,
          colorClass: OTHERS_COLOR.bar,
          textColorClass: OTHERS_COLOR.text,
          barBgClass: OTHERS_COLOR.lightBg,
          isOthers: true,
          othersCount: others.length,
          blockCount: others.reduce((acc, curr) => acc + curr.blockCount, 0),
        },
      ];
    }

    const dominantSubject = allSubjects[0] || null;
    const uniqueCount = allSubjects.length;
    const avgHours = uniqueCount > 0 ? Math.round(totalHours / uniqueCount) : 0;

    return {
      allSubjects,
      topSegments,
      dominantSubject,
      uniqueCount,
      avgHours,
    };
  }, [rawSubjects, totalHours]);

  if (totalHours <= 0 || aggregatedData.allSubjects.length === 0) {
    return null;
  }

  const { allSubjects, topSegments, dominantSubject, uniqueCount, avgHours } = aggregatedData;
  const displayItems = showAll ? allSubjects : topSegments;

  return (
    <div
      className={`p-4 sm:p-6 rounded-2xl border shadow-sm space-y-5 transition-all ${
        theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}
    >
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Fanlar kesimida yuklama taqsimoti
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Jami <b>{totalHours} soat</b> pedagogik yuklamaning fanlar boʻyicha taqsimlangan salmogʻi
          </p>
        </div>

        {/* 3 ta ixcham tahliliy metrika */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto text-xs">
          <div
            className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
              theme === "dark" ? "bg-slate-800/80 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>
              Unikal fanlar: <b>{uniqueCount} ta</b>
            </span>
          </div>

          <div
            className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
              theme === "dark" ? "bg-slate-800/80 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              Oʻrtacha: <b>{avgHours} soat/fan</b>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Asosiy Segmented Progress Bar (Maksimal 5-6 ta yirik, qulay va tushunarli segment) */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            Umumiy soatdagi nisbiy ulushlar:
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
            100% ({totalHours} soat)
          </span>
        </div>

        <div className="w-full h-3.5 sm:h-4 rounded-xl overflow-hidden flex bg-slate-100 dark:bg-slate-800 p-0.5 gap-0.5 shadow-inner">
          {topSegments.map((item, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === topSegments.length - 1;
            return (
              <div
                key={idx}
                style={{ width: `${Math.max(2, item.percent)}%` }}
                className={`${item.colorClass} h-full transition-all duration-300 relative group cursor-help ${
                  isFirst ? "rounded-l-lg" : ""
                } ${isLast ? "rounded-r-lg" : ""}`}
                title={`${item.name}: ${item.total_hours} soat (${item.percent}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* 3. Modern Bar-List (Tushunarli, har bir fanning progress barli toza qatorlari) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {showAll ? `Barcha fanlar reytingi (${allSubjects.length} ta)` : `Asosiy yetakchi fanlar (Top 4 + Boshqalar)`}
          </span>
          {dominantSubject && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
              Eng katta ulush: <b className="text-blue-600 dark:text-blue-400">{dominantSubject.name}</b> ({dominantSubject.percent}%)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {displayItems.map((item, idx) => {
            const rank = idx + 1;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all hover:shadow-xs ${
                  theme === "dark"
                    ? "bg-slate-800/40 border-slate-800 hover:bg-slate-800/70"
                    : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Rank pill */}
                    <span
                      className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                        (item as any).isOthers
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          : idx === 0
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {(item as any).isOthers ? "•" : `#${rank}`}
                    </span>

                    {/* Subject name */}
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </span>

                    {/* Level badges */}
                    {!((item as any).isOthers) && (
                      <div className="hidden md:flex items-center gap-1 shrink-0">
                        {item.isMaster && item.isBachelor ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            Bakalavr + Magistr
                          </span>
                        ) : item.isMaster ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-0.5">
                            <GraduationCap className="w-2.5 h-2.5" />
                            Magistratura
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Bakalavriat
                          </span>
                        )}

                        {item.blockCount > 1 && (
                          <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {item.blockCount} ta dars boʻlagi
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hours and percent */}
                  <div className="flex items-baseline gap-1.5 shrink-0 text-right">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                      {item.total_hours}
                      <span className="text-[10px] font-normal text-slate-500 ml-0.5">soat</span>
                    </span>
                    <span className={`text-[11px] font-bold font-mono ${item.textColorClass}`}>
                      ({item.percent}%)
                    </span>
                  </div>
                </div>

                {/* Individual Bar */}
                <div className="w-full bg-slate-200/70 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${item.colorClass} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(1, item.percent))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Expand / Collapse Action Button */}
      {allSubjects.length > 5 && (
        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              theme === "dark"
                ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
            }`}
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Ixcham koʻrinishga qaytish (Top fanlar)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Barcha fanlar taqsimotini koʻrish ({allSubjects.length} ta fan)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
