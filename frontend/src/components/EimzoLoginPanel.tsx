"use client";

import React, { useState, useEffect } from "react";
import { EimzoKeyItem, AuthUser } from "@/types";
import { EimzoService } from "@/services/eimzoService";

interface EimzoLoginPanelProps {
  apiBase: string;
  onLoginSuccess: (user: AuthUser, token: string) => void;
  onError: (msg: string) => void;
}

export function EimzoLoginPanel({ apiBase, onLoginSuccess, onError }: EimzoLoginPanelProps) {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [agentAvailable, setAgentAvailable] = useState<boolean>(false);
  const [keys, setKeys] = useState<EimzoKeyItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<EimzoKeyItem | null>(null);
  const [keyPassword, setKeyPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>("");
  const [demoKeys, setDemoKeys] = useState<EimzoKeyItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"client" | "demo">("client");

  // 1. E-IMZO agenti va demo kalitlarni yuklash
  useEffect(() => {
    checkAgentAndLoadKeys();
    loadDemoKeys();
  }, []);

  const loadDemoKeys = async () => {
    try {
      const res = await fetch(`${apiBase}/auth/e-imzo/demo-keys`);
      const data = await res.json();
      if (data.success && Array.isArray(data.keys)) {
        const mapped = data.keys.map((k: any) => ({ ...k, is_demo: true }));
        setDemoKeys(mapped);
      }
    } catch {
      // Demo kalitlar yuklanmasa standart namunalar
      setDemoKeys([
        {
          id: "demo_admin",
          cn: "QOSIMOV ILXOM MAXMUDOVICH",
          pinfl: "30101851234567",
          inn: "548123987",
          org: "OʻzMU JBNUU",
          role: "Bosh administrator",
          username: "admin",
          valid_from: "2025-01-01",
          valid_to: "2027-01-01",
          serial_number: "1A2B3C01",
          is_demo: true
        },
        {
          id: "demo_dean",
          cn: "XOLMATOV ANVAR RUSTAMOVICH",
          pinfl: "31508821234568",
          inn: "452789123",
          org: "OʻzMU JBNUU",
          role: "Fakultet dekani",
          username: "dekan",
          valid_from: "2025-02-10",
          valid_to: "2027-02-10",
          serial_number: "1A2B3C02",
          is_demo: true
        }
      ]);
    }
  };

  const checkAgentAndLoadKeys = async () => {
    setIsChecking(true);
    setLocalError("");
    setSelectedKey(null);
    setKeyPassword("");

    try {
      const available = await EimzoService.isAgentAvailable();
      setAgentAvailable(available);

      if (available) {
        setActiveSubTab("client");
        try {
          const clientKeys = await EimzoService.listAllCertificates();
          setKeys(clientKeys);
          if (clientKeys.length > 0) {
            setSelectedKey(clientKeys[0]);
          }
        } catch (e: any) {
          setLocalError(e.message || "Kalitlarni oʻqishda xatolik");
        }
      } else {
        // Agar agent bo'lmasa, demo kalitlar subtabini faollashtiramiz
        setActiveSubTab("demo");
      }
    } catch {
      setAgentAvailable(false);
      setActiveSubTab("demo");
    } finally {
      setIsChecking(false);
    }
  };

  // 2. E-IMZO orqali kirish jarayoni
  const handleEimzoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) {
      setLocalError("Iltimos, tizimga kirish uchun E-IMZO kalitini tanlang.");
      return;
    }

    setLocalError("");
    setIsSubmitting(true);

    try {
      // 1. Serverdan challenge olish
      let challenge = "";
      try {
        const chRes = await fetch(`${apiBase}/auth/e-imzo/challenge`);
        const chData = await chRes.json();
        challenge = chData.challenge;
      } catch {
        challenge = `DEMO_CHALLENGE_${Date.now()}`;
      }

      let pkcs7Signature = "";

      // 2. Imzolash
      if (selectedKey.is_demo) {
        // Demo imzo
        pkcs7Signature = `DEMO_PKCS7_SIGNATURE_${selectedKey.pinfl}_${Date.now()}`;
      } else {
        // Haqiqiy E-IMZO agenti orqali imzolash
        if (!keyPassword) {
          setLocalError("Iltimos, E-IMZO kalitingiz parolini kiriting.");
          setIsSubmitting(false);
          return;
        }

        const signResult = await EimzoService.signChallenge(selectedKey, keyPassword, challenge);
        pkcs7Signature = signResult.pkcs7;
      }

      // 3. Backendga yuborish
      const loginRes = await fetch(`${apiBase}/auth/e-imzo/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge: challenge,
          pkcs7: pkcs7Signature,
          pinfl: selectedKey.pinfl,
          inn: selectedKey.inn,
          full_name: selectedKey.cn,
          serial_number: selectedKey.serial_number
        })
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.detail || "E-IMZO orqali kirishda xatolik yuz berdi");
      }

      if (loginData.success && loginData.user) {
        onLoginSuccess(loginData.user, loginData.access_token);
      } else {
        throw new Error("Tizimdan notoʻgʻri javob qaytdi");
      }
    } catch (err: any) {
      const msg = err.message || "E-IMZO orqali kirishda xatolik yuz berdi";
      setLocalError(msg);
      onError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Agent Holati va Sub-tablar */}
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

      {/* Subtab tanlov: Shaxsiy kalitlar / Namoyish (Demo) */}
      <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700/80">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab("client");
            if (keys.length > 0 && !selectedKey?.id.startsWith("demo_")) {
              setSelectedKey(keys[0]);
            }
          }}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
            activeSubTab === "client"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Kompyuterdagi E-IMZO kalitlari {keys.length > 0 ? `(${keys.length})` : ""}
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSubTab("demo");
            if (demoKeys.length > 0) {
              setSelectedKey(demoKeys[0]);
            }
          }}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
            activeSubTab === "demo"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Sinov va Test kalitlari ({demoKeys.length})
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

      {/* KALITLAR RO'YXATI */}
      {activeSubTab === "client" ? (
        agentAvailable ? (
          keys.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {keys.map((k) => {
                const isSelected = selectedKey?.id === k.id;
                return (
                  <div
                    key={k.id}
                    onClick={() => {
                      setSelectedKey(k);
                      setLocalError("");
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500 shadow-md ring-1 ring-blue-500/30"
                        : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{k.cn}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>JSHSHIR: <strong className="text-slate-300">{k.pinfl || "Mavjud emas"}</strong></span>
                          {k.inn && <span>STIR: <strong className="text-slate-300">{k.inn}</strong></span>}
                        </div>
                        {k.org && <div className="text-[10px] text-slate-500 mt-0.5 truncate">{k.org}</div>}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {k.valid_to ? `gacha: ${k.valid_to}` : "Faol"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              E-IMZO moduli oʻrnatilmagan yoki ishga tushirilmagan
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Tizimga shaxsiy elektron raqamli imzo (ERI) kalitingiz orqali kirish uchun kompyuteringizda E-IMZO moduli ishlab turishi zarur.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://e-imzo.uz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-[11px] shadow-sm transition-all"
              >
                E-IMZO dasturini yuklab olish
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button
                type="button"
                onClick={() => setActiveSubTab("demo")}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium text-[11px] transition-colors"
              >
                Test kalitlar bilan sinash
              </button>
            </div>
          </div>
        )
      ) : (
        /* DEMO / TEST KALITLARI */
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          <div className="text-[11px] text-blue-400 font-medium px-1 flex items-center justify-between">
            <span>Rollar boʻyicha sinov kalitlari:</span>
            <span className="text-slate-500 text-[10px]">Parol talab qilinmaydi</span>
          </div>
          {demoKeys.map((k) => {
            const isSelected = selectedKey?.id === k.id;
            return (
              <div
                key={k.id}
                onClick={() => {
                  setSelectedKey(k);
                  setLocalError("");
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-blue-600/15 border-blue-500 shadow-md ring-1 ring-blue-500/30"
                    : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{k.cn}</div>
                    <div className="text-[11px] text-blue-400 font-semibold mt-0.5">{k.role}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex gap-3">
                      <span>JSHSHIR: <strong>{k.pinfl}</strong></span>
                      <span>STIR: <strong>{k.inn}</strong></span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Test kalit
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tanlangan kalit va Parol kiritish */}
      {selectedKey && (
        <form onSubmit={handleEimzoLogin} className="space-y-3 pt-1 border-t border-slate-800">
          {!selectedKey.is_demo && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-IMZO kalit paroli
              </label>
              <input
                type="password"
                value={keyPassword}
                onChange={(e) => setKeyPassword(e.target.value)}
                placeholder="Kalit maxfiy parolini kiriting"
                required
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Imzolanmoqda va kirilmoqda...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>E-IMZO bilan tizimga kirish</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
