"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { SystemSettings } from "@/types";

interface NavbarCountdownTimerProps {
  settings: SystemSettings;
  theme: string;
  onOpenSettings?: () => void;
}

export const NavbarCountdownTimer: React.FC<NavbarCountdownTimerProps> = ({
  settings,
  theme,
  onOpenSettings
}) => {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    stageName: string;
    targetDateStr: string;
    isClosed: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    stageName: "Yuklanmoqda...",
    targetDateStr: "",
    isClosed: false
  });

  useEffect(() => {
    setMounted(true);

    const parseDateSafe = (dateStr?: string): number | null => {
      if (!dateStr) return null;
      const trimmed = String(dateStr).trim();

      // YYYY-MM-DD yoki YYYY-MM-DDTHH:mm:ss
      if (/^\d{4}-\d{1,2}-\d{1,2}/.test(trimmed)) {
        const clean = trimmed.includes("T") ? trimmed.split("T")[0] : trimmed;
        const d = new Date(`${clean}T23:59:59`);
        if (!isNaN(d.getTime())) return d.getTime();
      }

      // DD.MM.YYYY
      if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(trimmed)) {
        const parts = trimmed.split(".");
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2];
        const d = new Date(`${year}-${month}-${day}T23:59:59`);
        if (!isNaN(d.getTime())) return d.getTime();
      }

      // DD/MM/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
        const parts = trimmed.split("/");
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2];
        const d = new Date(`${year}-${month}-${day}T23:59:59`);
        if (!isNaN(d.getTime())) return d.getTime();
      }

      const fallback = new Date(trimmed).getTime();
      return isNaN(fallback) ? null : fallback;
    };

    const calculateTime = () => {
      const stage = settings.current_stage || "ALL_OPEN";

      if (stage === "CLOSED" || (!settings.submissions_open && stage === "SUBMISSION_STAGE")) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          stageName: !settings.submissions_open ? "Qabul toʻxtatilgan" : "Reyting yakunlangan",
          targetDateStr: "",
          isClosed: true
        };
      }

      const now = Date.now();
      const subTime = parseDateSafe(settings.submission_deadline || settings.deadline_date);
      const revTime = parseDateSafe(settings.review_deadline);
      const appTime = parseDateSafe(settings.appeal_deadline);

      let targetTime: number | null = null;
      let stageLabel = "Ariza topshirish";
      let targetDateDisplay = settings.submission_deadline || settings.deadline_date || "";

      if (stage === "ALL_OPEN") {
        if (subTime && subTime > now) {
          stageLabel = "Ariza topshirish";
          targetTime = subTime;
          targetDateDisplay = settings.submission_deadline || settings.deadline_date || "";
        } else if (revTime && revTime > now) {
          stageLabel = "Ekspertlar baholashi";
          targetTime = revTime;
          targetDateDisplay = settings.review_deadline || "";
        } else if (appTime && appTime > now) {
          stageLabel = "Apellyatsiya davri";
          targetTime = appTime;
          targetDateDisplay = settings.appeal_deadline || "";
        } else {
          targetTime = appTime || revTime || subTime;
          stageLabel = "Baholash muddati";
          targetDateDisplay = settings.appeal_deadline || settings.review_deadline || settings.submission_deadline || "";
        }
      } else if (stage === "SUBMISSION_STAGE") {
        stageLabel = "Ariza topshirish";
        targetTime = subTime;
        targetDateDisplay = settings.submission_deadline || settings.deadline_date || "";
      } else if (stage === "REVIEW_STAGE") {
        stageLabel = "Ekspertlar baholashi";
        targetTime = revTime;
        targetDateDisplay = settings.review_deadline || "";
      } else if (stage === "APPEAL_STAGE") {
        stageLabel = "Apellyatsiya davri";
        targetTime = appTime;
        targetDateDisplay = settings.appeal_deadline || "";
      }

      if (!targetTime) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: false,
          stageName: stageLabel,
          targetDateStr: "Muddatsiz",
          isClosed: false
        };
      }

      const diff = targetTime - now;

      if (diff <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          stageName: stageLabel,
          targetDateStr: targetDateDisplay,
          isClosed: false
        };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        stageName: stageLabel,
        targetDateStr: targetDateDisplay,
        isClosed: false
      };
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  if (!mounted) {
    return (
      <div
        className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
          theme === "dark" ? "bg-slate-800/60 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Muddat...</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds, isExpired, stageName, targetDateStr, isClosed } = timeLeft;

  let pulseDotColor = "bg-blue-500";
  let badgeBorder =
    theme === "dark" ? "border-blue-800/80 bg-blue-950/40 text-blue-300" : "border-blue-200 bg-blue-50 text-blue-900";

  if (isClosed) {
    pulseDotColor = "bg-slate-400";
    badgeBorder =
      theme === "dark" ? "border-slate-700 bg-slate-800/60 text-slate-400" : "border-slate-200 bg-slate-100 text-slate-600";
  } else if (isExpired) {
    pulseDotColor = "bg-rose-500";
    badgeBorder =
      theme === "dark" ? "border-rose-900/80 bg-rose-950/50 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-800";
  } else if (days < 1) {
    pulseDotColor = "bg-rose-500";
    badgeBorder =
      theme === "dark"
        ? "border-rose-800 bg-rose-950/60 text-rose-300 ring-1 ring-rose-500/50"
        : "border-rose-300 bg-rose-50 text-rose-900 ring-1 ring-rose-300";
  } else if (days <= 3) {
    pulseDotColor = "bg-amber-400";
    badgeBorder =
      theme === "dark" ? "border-amber-800/80 bg-amber-950/40 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-900";
  } else {
    pulseDotColor = "bg-emerald-500";
    badgeBorder =
      theme === "dark" ? "border-emerald-800/80 bg-emerald-950/40 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      onClick={onOpenSettings}
      title={
        onOpenSettings
          ? "Baholash reglamenti va muddatlarni sozlash (Administrator)"
          : `Tizim muddati: ${targetDateStr || "Belgilanmagan"}`
      }
      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium border shadow-xs transition-all flex-shrink-0 ${badgeBorder} ${
        onOpenSettings ? "cursor-pointer hover:scale-102 hover:shadow-md" : ""
      }`}
    >
      <span className="relative flex h-2 w-2 flex-shrink-0">
        {!isClosed && !isExpired && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseDotColor}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseDotColor}`}></span>
      </span>

      <span className="font-semibold hidden md:inline opacity-90 truncate max-w-[130px]">
        {stageName}:
      </span>

      {isClosed ? (
        <span className="font-bold">Yopilgan</span>
      ) : isExpired ? (
        <span className="font-bold">Tugadi</span>
      ) : (
        <div className="flex items-center gap-0.5 sm:gap-1 font-mono font-bold tracking-tight">
          {days > 0 && (
            <span>
              <span className="text-xs sm:text-sm">{days}</span>
              <span className="text-[10px] sm:text-[11px] font-sans font-normal opacity-80 ml-0.5 mr-0.5">k</span>
            </span>
          )}
          <span className="text-[11px] sm:text-xs">
            {pad(hours)}:{pad(minutes)}
            <span className="hidden sm:inline">:{pad(seconds)}</span>
          </span>
        </div>
      )}

      {onOpenSettings && (
        <span className="text-[10px] opacity-60 ml-0.5 hidden xl:inline underline">
          (sozlash)
        </span>
      )}
    </div>
  );
};
