"use client";

import React, { useState, useEffect, useRef } from "react";
import { EimzoKeyItem, AuthUser } from "@/types";
import { EimzoService } from "@/services/eimzoService";

interface EimzoLoginPanelProps {
  apiBase: string;
  onLoginSuccess: (user: AuthUser, token?: string) => void;
  onError: (msg: string) => void;
}

export function EimzoLoginPanel({ apiBase, onLoginSuccess, onError }: EimzoLoginPanelProps) {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [agentAvailable, setAgentAvailable] = useState<boolean>(false);
  const [keys, setKeys] = useState<EimzoKeyItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<EimzoKeyItem | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAgentAndLoadKeys();
  }, []);

  // Tashqariga bosilganda dropdownni yopish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const checkAgentAndLoadKeys = async () => {
    setIsChecking(true);
    setLocalError("");
    setSelectedKey(null);
    setIsDropdownOpen(false);
    setSearchQuery("");

    try {
      const available = await EimzoService.isAgentAvailable();
      setAgentAvailable(available);

      if (available) {
        try {
          const clientKeys = await EimzoService.listAllCertificates();
          setKeys(clientKeys);
          if (clientKeys.length > 0) {
            setSelectedKey(clientKeys[0]);
          } else {
            setLocalError("Kompyuterda yoki ulangan USB fleshkada E-IMZO (.pfx) kalitlari topilmadi.");
          }
        } catch (e: any) {
          setLocalError(e.message || "E-IMZO kalitlarini oʻqishda xatolik yuz berdi");
        }
      }
    } catch {
      setAgentAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleEimzoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) {
      setLocalError("Iltimos, tizimga kirish uchun shaxsiy E-IMZO kalitingizni tanlang.");
      return;
    }

    setLocalError("");
    setIsSubmitting(true);

    try {
      // 1. Serverdan xavfsiz bir martalik challenge olish
      const chRes = await fetch(`${apiBase}/auth/e-imzo/challenge`);
      const chData = await chRes.json();
      if (!chRes.ok || !chData.challenge) {
        throw new Error(chData.detail || "Serverdan tasdiq kodini (challenge) olib boʻlmadi");
      }

      // 2. E-IMZO agenti orqali PKCS#7 raqamli imzo yaratish (Agent o'zining xavfsiz tizimli oynasida parolni so'raydi)
      const signResult = await EimzoService.signChallenge(selectedKey, chData.challenge);
      if (!signResult.pkcs7) {
        throw new Error("E-IMZO orqali imzo yaratilmadi");
      }

      // 3. Backendga yuborish va autentifikatsiyadan o'tish
      const loginRes = await fetch(`${apiBase}/auth/e-imzo/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge: chData.challenge,
          pkcs7: signResult.pkcs7,
          pinfl: selectedKey.pinfl,
          inn: selectedKey.inn,
          full_name: selectedKey.cn,
          serial_number: selectedKey.serial_number
        })
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.detail || "E-IMZO orqali tizimga kirishda xatolik yuz berdi");
      }

      if (loginData.success && loginData.user) {
        onLoginSuccess(loginData.user, loginData.access_token);
      } else {
        throw new Error("Tizimdan kutilmagan javob qaytdi");
      }
    } catch (err: any) {
      const msg = err.message || "E-IMZO orqali kirishda xatolik yuz berdi";
      setLocalError(msg);
      onError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kalitlarni qidiruv bo'yicha filtrlash
  const filteredKeys = keys.filter((k) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (k.cn && k.cn.toLowerCase().includes(q)) ||
      (k.pinfl && k.pinfl.includes(q)) ||
      (k.inn && k.inn.includes(q)) ||
      (k.org && k.org.toLowerCase().includes(q))
    );
  });

  const maskPinfl = (p?: string) => {
    if (!p) return "Mavjud emas";
    if (p.length >= 8) return `${p.slice(0, 4)}••••${p.slice(-4)}`;
    return p;
  };

  return (
    <div className="space-y-4">
      {/* E-IMZO Agent holati */}
      <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              agentAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span className="font-medium text-slate-300">
            {isChecking
              ? "E-IMZO moduli tekshirilmoqda..."
              : agentAvailable
              ? "E-IMZO Agent faol (127.0.0.1:64443)"
              : "E-IMZO Agent aniqlanmadi"}
          </span>
        </div>

        <button
          type="button"
          onClick={checkAgentAndLoadKeys}
          disabled={isChecking}
          className="text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
        >
          {isChecking ? "Tekshirilmoqda..." : "Qayta tekshirish"}
        </button>
      </div>

      {/* Xatolik xabari */}
      {localError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="leading-relaxed">{localError}</div>
        </div>
      )}

      {/* KALITLAR TANLOVI: Ajoyib ixcham Dropdown Select */}
      {agentAvailable ? (
        keys.length > 0 ? (
          <div className="space-y-3" ref={dropdownRef}>
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span>E-IMZO kalitini tanlang</span>
                <span className="text-blue-400">*</span>
              </label>
              <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                {keys.length} ta kalit topildi
              </span>
            </div>

            {/* Custom Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isDropdownOpen
                    ? "bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10"
                    : "bg-slate-900/90 border-slate-700/80 hover:border-slate-600 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/25 to-indigo-600/25 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400 shadow-inner">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate leading-tight">
                      {selectedKey ? selectedKey.cn : "Kalitni tanlang..."}
                    </div>
                    {selectedKey && (
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 truncate">
                        <span>JSHSHIR: <strong className="text-slate-300 font-mono">{maskPinfl(selectedKey.pinfl)}</strong></span>
                        {selectedKey.inn && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span>STIR: <strong className="text-slate-300 font-mono">{selectedKey.inn}</strong></span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`transition-transform duration-200 text-slate-400 ${isDropdownOpen ? "rotate-180 text-blue-400" : ""}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Ochiluvchi Dropdown Menyusi */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900/95 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* Qidiruv paneli (agar 3 tadan ko'p kalit bo'lsa) */}
                  {keys.length > 2 && (
                    <div className="p-2.5 border-b border-slate-800 bg-slate-950/40">
                      <div className="relative">
                        <svg className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="F.I.O, JSHSHIR yoki STIR boʻyicha qidirish..."
                          className="w-full pl-8 pr-7 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                          autoFocus
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Kalitlar ro'yxati (Max-height cheklangan, ixcham scroll) */}
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/60 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {filteredKeys.length > 0 ? (
                      filteredKeys.map((k) => {
                        const isSelected = selectedKey?.id === k.id;
                        return (
                          <div
                            key={k.id}
                            onClick={() => {
                              setSelectedKey(k);
                              setIsDropdownOpen(false);
                              setLocalError("");
                            }}
                            className={`p-2.5 px-3 cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                              isSelected
                                ? "bg-blue-600/20 text-white"
                                : "hover:bg-slate-800/80 text-slate-300 hover:text-white"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold truncate">{k.cn}</span>
                                {isSelected && (
                                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/20 px-1.5 py-0.2 rounded">
                                    Tanlangan
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span>
                                  JSHSHIR: <strong className="text-slate-200 font-mono">{maskPinfl(k.pinfl)}</strong>
                                </span>
                                {k.inn && (
                                  <>
                                    <span className="text-slate-600">•</span>
                                    <span>STIR: <strong className="text-slate-200 font-mono">{k.inn}</strong></span>
                                  </>
                                )}
                              </div>

                              {k.org && (
                                <div className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                                  <svg className="w-3 h-3 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span>{k.org}</span>
                                </div>
                              )}
                            </div>

                            <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                                {k.valid_to ? `Muddati: ${k.valid_to}` : "Faol"}
                              </span>
                              {isSelected && (
                                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Qidiruv boʻyicha mos E-IMZO kaliti topilmadi
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tanlangan kalit pasport kartasi (juda ixcham) */}
            {selectedKey && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 px-3 text-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Tasdiqlovchi sertifikat
                  </div>
                  <div className="font-semibold text-slate-200 truncate mt-0.5">
                    {selectedKey.cn}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Amal qiladi: {selectedKey.valid_to || "Faol"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl text-center text-xs text-slate-400">
            <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Kompyuteringizda yoki USB fleshkada E-IMZO (.pfx) kaliti topilmadi.
          </div>
        )
      ) : (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2.5">
          <div className="font-semibold text-amber-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            E-IMZO moduli ishga tushmagan
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Tizimga shaxsiy elektron raqamli imzo (ERI) kalitingiz orqali kirish uchun kompyuteringizda rasmiy E-IMZO agenti ishlab turishi kerak.
          </p>
          <div className="pt-1">
            <a
              href="https://e-imzo.uz"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-[11px] shadow-sm transition-all"
            >
              E-IMZO dasturini yuklab olish (e-imzo.uz)
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* Tanlangan kalit uchun Kirish tugmasi va Tushuntirish */}
      {selectedKey && (
        <form onSubmit={handleEimzoLogin} className="space-y-3 pt-2 border-t border-slate-800">
          <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl text-[11px] text-slate-300 flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="leading-relaxed">
              Xavfsizlik talablariga muvofiq, kalit paroli brauzerga yozilmaydi. Tugmani bosganingizda kalit paroli rasmiy <strong>E-IMZO tizimli oynasida</strong> soʻraladi.
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>E-IMZO oynasida tasdiqlash kutilmoqda...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>E-IMZO orqali tasdiqlash va tizimga kirish</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
