"use client";

import React, { useState, useEffect } from "react";
import { RbacRole, RbacPermission } from "@/types";
import {
  IconShield,
  IconCheck,
  IconX,
  IconUser,
  IconBuilding,
  IconBook,
  IconDatabase
} from "./AppCustomIcons";
import {
  Check,
  Plus,
  RefreshCw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users
} from "lucide-react";

interface RbacRolesPanelProps {
  theme: "light" | "dark";
  API_BASE: string;
  showAlert: (config: { title: string; message: string; type?: "danger" | "warning" | "info" | "success" }) => void;
  showConfirm: (config: {
    title: string;
    message: string;
    confirmText?: string;
    type?: "danger" | "warning" | "info" | "success";
    onConfirm: () => void | Promise<void>;
  }) => void;
}

export const RbacRolesPanel: React.FC<RbacRolesPanelProps> = ({
  theme,
  API_BASE,
  showAlert,
  showConfirm
}) => {
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [selectedRoleCode, setSelectedRoleCode] = useState<string>("ADMIN");
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSuccessAlert, setIsSuccessAlert] = useState<boolean>(false);

  // Yangi rol qo'shish modal holati
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newRoleCode, setNewRoleCode] = useState<string>("");
  const [newRoleName, setNewRoleName] = useState<string>("");
  const [newRoleDescription, setNewRoleDescription] = useState<string>("");
  const [isCreatingRole, setIsCreatingRole] = useState<boolean>(false);

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("kpi_auth_token") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  };

  // 1. Rollar va Huquqlarni yuklab olish
  const fetchRbacData = async () => {
    setIsLoading(true);
    try {
      const [resRoles, resPerms] = await Promise.all([
        fetch(`${API_BASE}/rbac/roles`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/rbac/permissions`, { headers: getAuthHeaders() })
      ]);

      const dataRoles = await resRoles.json();
      const dataPerms = await resPerms.json();

      if (dataRoles.success) {
        setRoles(dataRoles.roles);
        const current = dataRoles.roles.find((r: RbacRole) => r.code === selectedRoleCode) || dataRoles.roles[0];
        if (current) {
          setSelectedRoleCode(current.code);
          setActivePermissions(current.permissions || []);
        }
      }

      if (dataPerms.success) {
        setPermissions(dataPerms.permissions);
      }
    } catch (err: any) {
      showAlert({
        title: "Xatolik",
        message: "Rollar va huquqlar maʼlumotlarini yuklashda xatolik yuz berdi.",
        type: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRbacData();
  }, []);

  // Tanlangan rol o'zgarganda
  const handleSelectRole = (role: RbacRole) => {
    setSelectedRoleCode(role.code);
    setActivePermissions(role.permissions || []);
  };

  // Huquqni yoqish / o'chirish (Checkbox toggle)
  const togglePermission = (permCode: string) => {
    if (activePermissions.includes(permCode)) {
      setActivePermissions(activePermissions.filter((p) => p !== permCode));
    } else {
      setActivePermissions([...activePermissions, permCode]);
    }
  };

  // Modul bo'yicha barchasini tanlash / bekor qilish
  const toggleModuleAll = (modulePerms: RbacPermission[]) => {
    const moduleCodes = modulePerms.map((p) => p.code);
    const allSelected = moduleCodes.every((c) => activePermissions.includes(c));

    if (allSelected) {
      // Bekor qilish
      setActivePermissions(activePermissions.filter((c) => !moduleCodes.includes(c)));
    } else {
      // Barchasini qo'shish
      const newSet = new Set([...activePermissions, ...moduleCodes]);
      setActivePermissions(Array.from(newSet));
    }
  };

  // Rol huquqlarini saqlash
  const handleSavePermissions = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/rbac/roles/${selectedRoleCode}/permissions`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ permissions: activePermissions })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || "Saqlashda xatolik");
      }

      // Lokal holatni yangilash
      setRoles(
        roles.map((r) => (r.code === selectedRoleCode ? { ...r, permissions: activePermissions } : r))
      );
      setIsSuccessAlert(true);
      setTimeout(() => setIsSuccessAlert(false), 3000);
    } catch (err: any) {
      showAlert({
        title: "Xatolik",
        message: err.message || "Huquqlarni saqlashda xatolik yuz berdi.",
        type: "danger"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Yangi rol yaratish
  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleCode.trim() || !newRoleName.trim()) {
      showAlert({ title: "Diqqat", message: "Rol kodi va nomini kiriting!", type: "warning" });
      return;
    }

    setIsCreatingRole(true);
    try {
      const res = await fetch(`${API_BASE}/rbac/roles`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          code: newRoleCode.trim(),
          name: newRoleName.trim(),
          description: newRoleDescription.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || "Rol yaratishda xatolik");
      }

      setIsCreateModalOpen(false);
      setNewRoleCode("");
      setNewRoleName("");
      setNewRoleDescription("");
      showAlert({ title: "Muvaffaqiyatli", message: data.message, type: "success" });
      await fetchRbacData();
    } catch (err: any) {
      showAlert({ title: "Xatolik", message: err.message || "Xatolik yuz berdi", type: "danger" });
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Maxsus rolni o'chirish
  const handleDeleteRole = (role: RbacRole) => {
    if (role.is_system) {
      showAlert({ title: "Taqiqlangan", message: "Tizim standart rollarini oʻchirish taqiqlanadi!", type: "warning" });
      return;
    }

    showConfirm({
      title: "Rolni oʻchirish",
      message: `Haqiqatan ham '${role.name}' rolini oʻchirmoqchimisiz? Ushbu roldagi foydalanuvchilar qayta sozlanishi lozim boʻladi.`,
      confirmText: "Ha, oʻchirilsin",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/rbac/roles/${role.code}`, {
            method: "DELETE",
            headers: getAuthHeaders()
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.detail || "Oʻchirishda xatolik");
          }
          showAlert({ title: "Muvaffaqiyatli", message: data.message, type: "success" });
          setSelectedRoleCode("ADMIN");
          await fetchRbacData();
        } catch (err: any) {
          showAlert({ title: "Xatolik", message: err.message, type: "danger" });
        }
      }
    });
  };

  // Huquqlarni modullar bo'yicha guruhlash
  const groupedPermissions: Record<string, RbacPermission[]> = {};
  permissions.forEach((p) => {
    if (!groupedPermissions[p.module]) {
      groupedPermissions[p.module] = [];
    }
    groupedPermissions[p.module].push(p);
  });

  const selectedRole = roles.find((r) => r.code === selectedRoleCode);

  return (
    <div className="space-y-6">
      {/* Sarlavha va Tavsif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-900 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Granular Dinamik Rollar va Ruxsatlar Tizimi (RBAC)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Har bir rol uchun aniq modullar va harakatlar huquqlarini belgilash (DB-driven Access Control)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchRbacData}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Qayta yuklash"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi rol qoʻshish</span>
          </button>
        </div>
      </div>

      {isSuccessAlert && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>'{selectedRole?.name}' roli uchun huquqlar bazada muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      {/* Asosiy Ishchi Maydon: Chapda Rollar, O'ngda Huquqlar Matritsasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chap ustun: Rollar Ro'yxati (4 ustun, sticky va mustaqil scroll bilan) */}
        <div className="lg:col-span-4 space-y-2 lg:sticky lg:top-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-2">
            Mavjud Rollar ({roles.length} ta)
          </div>

          <div className="space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {roles.map((role) => {
              const isSelected = role.code === selectedRoleCode;
              return (
                <div
                  key={role.code}
                  onClick={() => handleSelectRole(role)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                      : theme === "dark"
                      ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200"
                      : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold truncate leading-tight">
                        {role.name}
                      </span>
                      {role.is_system && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-md font-mono uppercase font-bold shrink-0 ${
                            isSelected
                              ? "bg-blue-800 text-blue-200"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          Tizim
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[11px] mt-0.5 font-mono truncate ${
                        isSelected ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      {role.code} • {role.permissions?.length || 0} ta ruxsat
                    </div>
                  </div>

                  {!role.is_system && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        isSelected
                          ? "hover:bg-blue-800 text-rose-300"
                          : "hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-500"
                      }`}
                      title="Ushbu maxsus rolni oʻchirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* O'ng ustun: Tanlangan Rol Huquqlari Matritsasi (8 ustun) */}
        <div
          className={`lg:col-span-8 rounded-3xl border shadow-sm p-6 flex flex-col ${
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          {selectedRole ? (
            <div className="space-y-4">
              {/* Rol Tafsilotlari va Saqlash Tugmasi (Doim ko'rinib turadigan sticky header) */}
              <div className="sticky -top-6 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-4 pt-1 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedRole.name}
                    </h4>
                    <span className="font-mono text-xs text-blue-900 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                      {selectedRole.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedRole.description || "Ushbu rol uchun ruxsat etilgan funksiyalar va modullar."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
                  <span>{isSaving ? "Saqlanmoqda..." : "Oʻzgarishlarni saqlash"}</span>
                </button>
              </div>

              {/* Modullar va Huquqlar Ro'yxati (Ichki mustaqil scroll bilan) */}
              <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                {Object.entries(groupedPermissions).map(([moduleName, modulePerms]) => {
                  const allInModuleSelected = modulePerms.every((p) =>
                    activePermissions.includes(p.code)
                  );

                  return (
                    <div
                      key={moduleName}
                      className={`p-4 rounded-2xl border ${
                        theme === "dark"
                          ? "bg-slate-850/60 border-slate-800"
                          : "bg-slate-50/70 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span>{moduleName} moduli</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleModuleAll(modulePerms)}
                          className="text-[11px] font-bold text-blue-900 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          {allInModuleSelected ? "Barchasini bekor qilish" : "Barchasini tanlash"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {modulePerms.map((perm) => {
                          const isChecked = activePermissions.includes(perm.code);
                          return (
                            <label
                              key={perm.code}
                              className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-100"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800/80 border-transparent text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.code)}
                                className="w-4 h-4 mt-0.5 rounded text-blue-900 focus:ring-blue-900 cursor-pointer"
                              />
                              <div className="min-w-0">
                                <div className="font-bold leading-tight flex items-center gap-1.5">
                                  <span>{perm.name}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                  {perm.description || perm.code}
                                </div>
                                <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500">
                                  {perm.code}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              Chapdagi roʻyxatdan rolni tanlang
            </div>
          )}
        </div>
      </div>

      {/* Yangi rol yaratish modali */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 ${
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                <span>Yangi Rol Yaratish</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Rol Kodi (Inglizcha, katta harflarda) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: DEPUTY_DEAN yoki COMMISSION_MEMBER"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                  className={`w-full px-3 py-2 rounded-xl border font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Rol Nomi (Oʻzbekcha toʻliq nomi) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Dekan oʻrinbosari yoki Komissiya kotibi"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Vazifasi va Tavsifi
                </label>
                <textarea
                  rows={3}
                  placeholder="Ushbu rol qanday vakolatga ega boʻlishi haqida qisqacha maʼlumot..."
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRole}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm"
                >
                  {isCreatingRole ? "Yaratilmoqda..." : "Rolni saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
