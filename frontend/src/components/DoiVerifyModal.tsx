"use client";

import React, { useState } from "react";
import { X, Search, CheckCircle, AlertCircle, ExternalLink, BookOpen, UserCheck, ShieldCheck, Copy } from "lucide-react";

interface DoiVerifyResult {
  doi: string;
  title: string;
  authors: string;
  authors_list?: string[];
  journal: string;
  year: string;
  publisher: string;
  type: string;
  url: string;
  author_match: boolean;
  verified: boolean;
}

interface DoiVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName?: string;
  API_BASE: string;
  onApplyToSubmission?: (data: { title: string; description: string; fileUrl?: string }) => void;
  showAlert: (config: { title: string; message: string; type?: "danger" | "warning" | "info" | "success" }) => void;
}

export const DoiVerifyModal: React.FC<DoiVerifyModalProps> = ({
  isOpen,
  onClose,
  teacherName = "",
  API_BASE,
  onApplyToSubmission,
  showAlert
}) => {
  const [doiInput, setDoiInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DoiVerifyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = doiInput.trim();
    if (!clean) {
      setErrorMsg("Iltimos, maqolaning DOI raqami yoki havolasini kiriting!");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/publications/verify-doi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doi: clean,
          teacher_name: teacherName
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "DOI tekshirishda xatolik yuz berdi");
      }

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Xalqaro ilmiy bazadan maʼlumot topilmadi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    const submissionTitle = result.title;
    const submissionDesc = `Xalqaro ilmiy nashr (DOI: ${result.doi}). Jurnal: «${result.journal}» (${result.year}). Mualliflar: ${result.authors}. Nashriyot: ${result.publisher}.`;

    if (onApplyToSubmission) {
      onApplyToSubmission({
        title: submissionTitle,
        description: submissionDesc,
        fileUrl: result.url
      });
      showAlert({
        title: "Maʼlumotlar koʻchirildi",
        message: "Maqola sarlavhasi va rasmiy maʼlumotlari KPI ariza formasiga avtomatik biriktirildi!",
        type: "success"
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Scopus & CrossRef DOI Avto-Tekshiruvi
              </h3>
              <p className="text-xs text-blue-200/80">
                Xalqaro ilmiy maqola haqiqiyligini real vaqtda tasdiqlash va plagiatni oldini olish
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
        <div className="p-6 space-y-5">
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Maqolaning DOI raqami yoki havolasi
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={doiInput}
                  onChange={(e) => setDoiInput(e.target.value)}
                  placeholder="Masalan: 10.1016/j.procs.2023.01.001 yoki https://doi.org/10.1016/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer flex-shrink-0"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{isLoading ? "Tekshirilmoqda..." : "Tekshirish"}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              * Tizim xalqaro <b>CrossRef</b> va <b>OpenAlex</b> ochiq bazalari bilan toʻgʻridan-toʻgʻri bogʻlanib, maqola maʼlumotlarini yuklab oladi.
            </p>
          </form>

          {/* Xatolik xabari */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <b className="font-bold">Tekshiruv xatoligi:</b>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Muvaffaqiyatli Natija Kartochkasi */}
          {result && (
            <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5" /> Rasmiy tasdiqlangan
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    DOI: {result.doi}
                  </span>
                </div>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1 font-semibold underline"
                >
                  <span>Asl havola</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Maqola Sarlavhasi */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Maqola sarlavhasi:</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                  {result.title}
                </h4>
              </div>

              {/* Detallar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                <div>
                  <span className="text-slate-400 text-[11px]">Jurnal:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{result.journal}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Nashriyot va Yil:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {result.publisher} {result.year ? `(${result.year})` : ""}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 text-[11px]">Mualliflar roʻyxati:</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                    {result.authors}
                  </p>
                </div>
              </div>

              {/* Muallif mosligi nishoni */}
              <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
                result.author_match
                  ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
              }`}>
                <UserCheck className="w-4 h-4 flex-shrink-0" />
                <span>
                  {result.author_match
                    ? `F.I.O mosligi tasdiqlandi: Siz ushbu maqola mualliflari tarkibida mavjudsiz!`
                    : `Diqqat: Mualliflar roʻyxatida ismingiz toʻliq topilmadi yoki boshqa transliteratsiyada yozilgan. Qoʻlda tekshiruv talab etilishi mumkin.`}
                </span>
              </div>

              {/* Ariza formasiga ko'chirish tugmasi */}
              {onApplyToSubmission && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Maʼlumotlarni arizaga koʻchirish va toʻldirish</span>
                  </button>
                </div>
              )}
            </div>
          )}
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
