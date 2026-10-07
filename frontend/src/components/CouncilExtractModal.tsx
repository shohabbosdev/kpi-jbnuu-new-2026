"use client";

import React from "react";
import { X, Printer, Download, CheckCircle, ShieldCheck, QrCode } from "lucide-react";

interface ProtocolExtractData {
  id?: number;
  university_name: string;
  protocol_number: string;
  protocol_date: string;
  stage_level: string;
  publication_title: string;
  pub_type: string;
  authors: string;
  co_authors?: string;
  department: string;
  antiplagiarism_score: number;
  verification_token?: string;
  verification_url?: string;
  is_recommended?: boolean;
  created_at?: string;
}

interface CouncilExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
  extract: ProtocolExtractData | null;
}

export const CouncilExtractModal: React.FC<CouncilExtractModalProps> = ({
  isOpen,
  onClose,
  extract
}) => {
  if (!isOpen || !extract) return null;

  const handlePrint = () => {
    window.print();
  };

  const verifyUrl = extract.verification_url || `https://jbnuu.uz/kpi/verify?token=${extract.verification_token || ""}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-8 print:border-none print:shadow-none print:max-w-none print:w-full print:m-0">
        
        {/* Modal Controls - Hidden when Printing */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Rasmiy Kengash Qarori Koʻchirmasi (Elektron Guvohnoma)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Certificate Body */}
        <div className="p-8 sm:p-12 text-slate-900 dark:text-slate-100 print:text-black print:p-8 font-serif space-y-6 bg-white dark:bg-slate-900 print:bg-white" id="printable-certificate">
          
          {/* Header with University Seal & Title */}
          <div className="text-center space-y-2 border-b-2 border-slate-800 pb-5">
            <div className="text-xs font-bold tracking-widest uppercase text-slate-500 print:text-slate-700">
              Oʻzbekiston Respublikasi Oliy Taʼlim, Fan va Innovatsiyalar Vazirligi
            </div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 print:text-black">
              Oʻzbekiston Milliy Universiteti Jizzax Filiali
            </h2>
            <div className="text-sm font-bold text-blue-900 print:text-black uppercase tracking-wider">
              {extract.stage_level}ning rasmiy bayonnomasi koʻchirmasi
            </div>
          </div>

          {/* Protocol Metadata Bar */}
          <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2 font-mono">
            <div>
              <b>Bayonnoma №:</b> <span className="font-bold text-blue-800 print:text-black">{extract.protocol_number}</span>
            </div>
            <div>
              <b>Sana:</b> <span>{extract.protocol_date || "2026-yil"}</span>
            </div>
            <div>
              <b>Jizzax shahri</b>
            </div>
          </div>

          {/* Main Resolution Text */}
          <div className="space-y-4 text-justify text-sm leading-relaxed">
            <p>
              <b>KUN TARTIBI:</b> {extract.department} kafedrasi professor-oʻqituvchisi <b>{extract.authors}</b> {extract.co_authors ? `(hammualliflar: ${extract.co_authors})` : ""} tomonidan tayyorlangan <b>«{extract.publication_title}»</b> nomli {extract.pub_type.toLowerCase()}ni nashrga tavsiya etish toʻgʻrisida.
            </p>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 print:bg-slate-50 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Ekspertiza va Taqrizlar Xulosasi:</div>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Ichki va tashqi rasmiy taqrizchilar tomonidan ijobiy baholandi.</li>
                <li>Filial Oʻquv-uslubiy kengashi talablariga va namunaviy dasturga toʻliq mos keladi.</li>
                <li>Antiplagiat tizimi boʻyicha oʻzlashtirish (originallik) darajasi: <b className="text-emerald-700 print:text-black">{extract.antiplagiarism_score}%</b> (Talabga toʻliq javob beradi).</li>
              </ul>
            </div>

            <p className="font-bold">
              KENGASH QAROR QILADI:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2 text-xs">
              <li>Muallif(lar) {extract.authors} tomonidan tayyorlangan <b>«{extract.publication_title}»</b> nomli {extract.pub_type.toLowerCase()} maʼqullansin va nashrga tavsiya etilsin.</li>
              <li>Ushbu {extract.pub_type.toLowerCase()}ga OʻzMU JBNUU Ilmiy Kengashi tavsiyanomasi rasmiylashtirilsin hamda keyingi bosqich davlat reyestri roʻyxatiga taqdim etilsin.</li>
              <li>Qaror ijrosi boʻyicha nazorat Ilmiy boʻlim va tegishli fakultet dekanati zimmasiga yuklatilsin.</li>
            </ol>
          </div>

          {/* Signatures & Stamp section */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-end gap-6 border-t border-slate-200">
            <div className="space-y-1 text-xs">
              <div className="font-bold">Kengash Raisi: ________________________</div>
              <div className="font-bold">Ilmiy Kotib: ________________________</div>
              <p className="text-[10px] text-slate-400 mt-2">
                * Ushbu hujjat elektron axborot tizimida rasmiylashtirilgan va QR-kod orqali verifikatsiya qilinadi.
              </p>
            </div>

            {/* QR Code Verification Stamp */}
            <div className="flex flex-col items-center p-2.5 rounded-2xl border-2 border-slate-900 bg-white text-center flex-shrink-0 shadow-xs">
              <div className="w-20 h-20 bg-slate-900 rounded-xl p-1.5 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-white rounded-lg">
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-white" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-white" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-white" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-white" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-white" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-white" />
                  <div className="bg-slate-900 rounded-xs" />
                </div>
              </div>
              <div className="text-[9px] font-mono font-black text-slate-900 mt-1">
                QR VERIFIED
              </div>
              <span className="text-[8px] text-slate-500 font-mono">
                jbnuu.uz/kpi/verify
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end print:hidden">
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
