"use client";

import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { ConfirmDialogState } from "@/types";

interface ConfirmModalProps {
  confirmModal: ConfirmDialogState | null;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ confirmModal, onClose }) => {
  if (!confirmModal || !confirmModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
        <div className="flex items-start gap-3.5 mb-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              confirmModal.type === "danger"
                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                : confirmModal.type === "warning"
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                : confirmModal.type === "success"
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                : "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900"
            }`}
          >
            {confirmModal.type === "danger" && <AlertTriangle className="w-5 h-5" />}
            {confirmModal.type === "warning" && <AlertCircle className="w-5 h-5" />}
            {confirmModal.type === "success" && <CheckCircle className="w-5 h-5" />}
            {(!confirmModal.type || confirmModal.type === "info") && <HelpCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              {confirmModal.message}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          {!confirmModal.isAlertOnly && (
            <button
              type="button"
              onClick={() => {
                if (confirmModal.onCancel) confirmModal.onCancel();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {confirmModal.cancelText || "Bekor qilish"}
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              const onConf = confirmModal.onConfirm;
              onClose();
              if (onConf) await onConf();
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
              confirmModal.type === "danger"
                ? "bg-rose-600 hover:bg-rose-700"
                : confirmModal.type === "success"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-blue-900 hover:bg-blue-800"
            }`}
          >
            {confirmModal.confirmText || (confirmModal.isAlertOnly ? "Tushunarli" : "Tasdiqlash")}
          </button>
        </div>
      </div>
    </div>
  );
};
