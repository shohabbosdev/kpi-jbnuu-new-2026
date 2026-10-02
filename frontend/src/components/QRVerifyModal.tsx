"use client";

import React from "react";
import { Download } from "lucide-react";

interface QRVerifyModalProps {
  isOpen: boolean;
  verifyItemData: {
    type: "pub" | "doc";
    data: any;
  } | null;
  onClose: () => void;
}

export const QRVerifyModal: React.FC<QRVerifyModalProps> = ({
  isOpen,
  verifyItemData,
  onClose
}) => {
  if (!isOpen || !verifyItemData) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto overflow-x-hidden w-full max-w-full">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95 duration-150 min-w-0">
        {/* Blank header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Oʻzbekiston Respublikasi Oliy Taʼlim, Fan va Innovatsiyalar Vazirligi
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
            MIRZO ULUGʻBEK NOMIDAGI OʻZBEKISTON MILLIY UNIVERSITETI JIZZAX FILIALI
          </h2>
          <div className="text-xs font-bold text-blue-950">
            {verifyItemData.type === "pub"
              ? "ILMIY KENGASH BAYONNOMASIDAN KOʻCHIRMA"
              : "FAN OʻQUV-USLUBIY MAJMUASI TASDIQNOMASI"}
          </div>
        </div>

        {/* Blank Body */}
        <div className="py-5 space-y-3.5 text-xs leading-relaxed">
          {verifyItemData.type === "pub" ? (
            <>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Filial Kengashi bayonnomasi:</span>
                  <b>№ {verifyItemData.data.council_protocol_num || "___"}</b>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Sana:</span>
                  <b>{verifyItemData.data.council_protocol_date || "2026-yil"}</b>
                </div>
              </div>

              <p>
                Mirzo Ulugʻbek nomidagi Oʻzbekiston Milliy universiteti Jizzax filiali Ilmiy Kengashi fanning{" "}
                <b>"{verifyItemData.data.subject_name}"</b> kafedrasi boʻyicha professor-oʻqituvchi{" "}
                <b>{verifyItemData.data.authors}</b> tomonidan tayyorlangan quyidagi adabiyotni koʻrib chiqdi va
                vazirlik grifiga tavsiya etdi:
              </p>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
                <div>
                  <b>Adabiyot turi:</b> {verifyItemData.data.pub_type}
                </div>
                <div>
                  <b>Nomi:</b> <span className="font-bold text-blue-950">{verifyItemData.data.title}</span>
                </div>
                <div>
                  <b>Antiplagiat tizimidan oʻtkazilganlik natijasi:</b>{" "}
                  <span className="font-black text-emerald-700">
                    {verifyItemData.data.antiplagiarism_score}% originallik
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600">
                Mazkur koʻchirma adabiyotni <b>my.gov.uz</b> portali orqali Oliy taʼlim, fan va innovatsiyalar
                vazirligi Kengashiga davlat grifi olish uchun topshirish huquqini beradi.
              </p>
            </>
          ) : (
            <>
              <p>
                Ushbu elektron hujjat orqali OʻzMU Jizzax filiali{" "}
                <b>"{verifyItemData.data.department_name || "Tegishli"}"</b> kafedrasi oʻqituvchisi{" "}
                <b>{verifyItemData.data.teacher_name}</b> tomonidan taqdim etilgan quyidagi oʻquv-uslubiy hujjat
                toʻliq tasdiqlanganligi qayd etiladi:
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div>
                  <b>Fan nomi:</b> <span className="font-bold">{verifyItemData.data.subject_name}</span>
                </div>
                <div>
                  <b>Hujjat turi:</b> {verifyItemData.data.doc_type}
                </div>
                <div>
                  <b>Hujjat sarlavhasi:</b> {verifyItemData.data.title}
                </div>
                <div>
                  <b>Kafedra mudiri:</b> <span className="font-semibold text-emerald-700">Maʼqullangan ✓</span>
                </div>
                <div>
                  <b>Fakultet dekani:</b> <span className="font-semibold text-emerald-700">Tasdiqlangan ✓</span>
                </div>
              </div>
            </>
          )}

          {/* QR-Kod & Verification stamp */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1 text-[10px] text-slate-500 font-mono">
              <div>
                <b>Verifikatsiya kodi:</b> {verifyItemData.data.verification_token?.slice(0, 18)}...
              </div>
              <div>
                <b>Holat:</b> RASMAN TASDIQLANGAN
              </div>
              <div>
                <b>Tizim:</b> KPI JBNUU Elektron Hujjat Aylanish Tizimi
              </div>
            </div>

            {/* Simulated SVG QR-code badge */}
            <div className="w-24 h-24 p-1.5 bg-white border-2 border-slate-900 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-sm text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-lg p-1 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-1 w-full h-full p-0.5">
                  <div className="bg-white rounded-xs" />
                  <div className="bg-slate-900" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-slate-900" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-slate-900" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-slate-900" />
                  <div className="bg-white rounded-xs" />
                </div>
              </div>
              <span className="text-[8px] font-black tracking-tight text-slate-900 mt-0.5">QR VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Print & Close actions */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Chop etish (PDF)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
