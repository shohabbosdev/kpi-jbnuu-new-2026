"use client";

import React, { useState, useEffect } from "react";
import StructureHierarchyView from "../components/StructureHierarchyView";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  FileQuestion,
  FileText,
  User,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Layers,
  LogOut,
  Lock,
  UserCheck,
  Settings,
  Users,
  ShieldAlert,
  Save,
  Check,
  Building,
  KeyRound,
  AlertCircle,
  Database,
  RefreshCw,
  Briefcase,
  GraduationCap,
  Award,
  LockKeyhole,
  Sliders,
  Plus,
  X,
  ChevronLeft,
  FileSpreadsheet,
  Sun,
  Moon,
  Menu,
  Eye,
  EyeOff,
  UserCog,
  AlertTriangle
} from "lucide-react";

interface TeacherScoreDetail {
  oqv: number;
  ilm: number;
  xal: number;
  man: number;
  jarima: number;
  flex_applied: number;
  raw_total: number;
  fte: number;
  normalized_score: number;
  svetafor_zone: string;
  svetafor_label: string;
  bonus_label: string;
}

interface Teacher {
  id: number;
  name: string;
  faculty: string;
  department: string;
  position: string;
  degree: string;
  fte: number;
  track: string;
  is_first_year: boolean;
  is_head_of_dept: boolean;
  scores: TeacherScoreDetail;
}

interface Indicator {
  id: string;
  block: string;
  name: string;
  max_ball: number;
  validity: string;
  dept: string;
  is_active?: boolean;
  description?: string;
}

interface Submission {
  id: number;
  teacher_id: number;
  teacher_name: string;
  indicator_id: string;
  title: string;
  doi?: string;
  authors_count: number;
  submitted_date: string;
  status: string;
  claimed_ball?: number;
  ball: number;
  file_name: string;
  dept: string;
  description?: string;
  reviewer_name?: string;
  reviewed_date?: string;
  reviewer_comment?: string;
  rejection_reason?: string;
}

interface Appeal {
  id: string;
  teacher_id: number;
  teacher_name: string;
  indicator_id: string;
  reason: string;
  submitted_date: string;
  status: string;
  decision?: string;
}

interface AuthUser {
  id: number;
  username: string;
  name: string;
  role: "ADMIN" | "DEAN" | "HEAD_OF_DEPT" | "TEACHER" | "RECTORATE";
  department?: string;
  faculty?: string;
  position?: string;
  degree?: string;
  fte: number;
  employee_id_number?: string;
  must_change_password?: boolean;
}

interface DepartmentHierarchy {
  id: number;
  name: string;
  code: string;
  head: string;
  head_fte: number;
  teachers_count: number;
  avg_score: number;
}

interface FacultyHierarchy {
  id: number;
  name: string;
  code: string;
  dean: string;
  dean_fte: number;
  departments: DepartmentHierarchy[];
}

interface StructureHierarchy {
  branch_name: string;
  total_faculties: number;
  total_departments: number;
  total_teachers_hemis: number;
  faculties: FacultyHierarchy[];
}

interface SystemSettings {
  academic_year: string;
  submissions_open: boolean;
  deadline_date: string;
  budget_cap_monthly: number;
}

interface AdminUserRecord {
  username: string;
  name: string;
  role: string;
  department?: string;
  position?: string;
  fte: number;
  must_change_password?: boolean;
  is_active?: boolean;
  employee_id_number?: string;
}

interface AuditLogRecord {
  id: number;
  time: string;
  user: string;
  action: string;
}

// HEMIS Data Structures (Shaxsga doir nozik ma'lumotlar saqlanmaydi)
interface HemisDepartment {
  id: number;
  name: string;
  code: string;
  structure_type: string;
  is_department: boolean;
  active: boolean;
}

interface HemisEmployee {
  id: number;
  full_name: string;
  short_name: string;
  employee_id_number: string;
  image?: string;
  department: string;
  department_id?: number;
  position: string;
  degree: string;
  rank: string;
  fte: number;
  raw_fte_sum?: number;
  active_contracts_count?: number;
  had_fired_contracts?: boolean;
  additional_positions?: string | null;
  employment_form: string;
  employee_type: string;
  specialty?: string;
}

interface HemisStats {
  raw_total_records: number;
  total_fired_excluded: number;
  total_unique_active: number;
  multi_contracts_merged: number;
}

interface HemisStatusInfo {
  connected: boolean;
  base_url: string;
  total_departments: number;
  message: string;
  error?: string;
}

export default function KpiEnterpriseApp() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loginUsername, setLoginUsername] = useState<string>("admin");
  const [loginPassword, setLoginPassword] = useState<string>("admin123");
  const [loginError, setLoginError] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Role and Navigation
  const [activeRole, setActiveRole] = useState<"ADMIN" | "DEAN" | "HEAD_OF_DEPT" | "TEACHER" | "RECTORATE">("ADMIN");
  const [activePage, setActivePage] = useState<
    "dashboard" | "structure" | "indicators" | "svetafor" | "appeals" | "doc" | "admin_settings" | "admin_users" | "admin_logs" | "admin_hemis" | "admin_indicators"
  >("dashboard");
  const [activeSvetaforFilter, setActiveSvetaforFilter] = useState<string>("ALL");
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>("ALL");
  const [fteFilter, setFteFilter] = useState<"ALL" | "1.5" | "1.0" | "PART">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [structureHierarchy, setStructureHierarchy] = useState<StructureHierarchy | null>(null);

  // Data states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);

  // Admin Data states
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    academic_year: "2025/2026-oʻquv yili",
    submissions_open: true,
    deadline_date: "2026-05-30",
    budget_cap_monthly: 150000000.0
  });
  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);
  const [adminLogs, setAdminLogs] = useState<AuditLogRecord[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Admin Users & Roles State
  const [adminUsersFilterRole, setAdminUsersFilterRole] = useState<string>("ALL");
  const [adminUsersSearchText, setAdminUsersSearchText] = useState<string>("");
  const [adminUsersStats, setAdminUsersStats] = useState<{
    total: number;
    teacher: number;
    head_of_dept: number;
    rectorate: number;
    admin: number;
  }>({ total: 0, teacher: 0, head_of_dept: 0, rectorate: 0, admin: 0 });
  const [userActionMessage, setUserActionMessage] = useState<string>("");

  // Admin Indicator Management (CRUD) State
  const [isAddIndicatorModalOpen, setIsAddIndicatorModalOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [indFormId, setIndFormId] = useState("");
  const [indFormBlock, setIndFormBlock] = useState("ILM");
  const [indFormName, setIndFormName] = useState("");
  const [indFormMaxBall, setIndFormMaxBall] = useState(10);
  const [indFormValidity, setIndFormValidity] = useState("1 oʻquv yili");
  const [indFormDept, setIndFormDept] = useState("Ilmiy-tadqiqotlar boʻlimi");
  const [indFormError, setIndFormError] = useState("");

  // HEMIS State
  const [hemisStatus, setHemisStatus] = useState<HemisStatusInfo | null>(null);
  const [hemisDepartments, setHemisDepartments] = useState<HemisDepartment[]>([]);
  const [hemisEmployees, setHemisEmployees] = useState<HemisEmployee[]>([]);
  const [hemisStats, setHemisStats] = useState<HemisStats | null>(null);
  const [hemisEmployeeType, setHemisEmployeeType] = useState<"teacher" | "all">("teacher");
  const [isHemisSyncing, setIsHemisSyncing] = useState<boolean>(false);
  const [hemisSyncMessage, setHemisSyncMessage] = useState<string>("");
  const [isHemisLoading, setIsHemisLoading] = useState<boolean>(false);
  const [hemisFilterText, setHemisFilterText] = useState<string>("");

  // Modal State for New KPI entry
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [doiInput, setDoiInput] = useState("");
  const [modalBlockFilter, setModalBlockFilter] = useState<string>("ALL");
  const [modalIndicator, setModalIndicator] = useState("1.1");
  const [modalTitle, setModalTitle] = useState("");
  const [modalAuthors, setModalAuthors] = useState(1);
  const [modalDate, setModalDate] = useState("2026-03-15");
  const [modalClaimedBall, setModalClaimedBall] = useState<number>(6.0);
  const [modalDescription, setModalDescription] = useState<string>("");
  const [isDoiLoading, setIsDoiLoading] = useState(false);

  // Reviewer Verification Modal State (Mudir, Dekan, Admin uchun)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [selectedSubForReview, setSelectedSubForReview] = useState<Submission | null>(null);
  const [verifyActionType, setVerifyActionType] = useState<"approved" | "rejected">("approved");
  const [verifyManualScore, setVerifyManualScore] = useState<number>(0);
  const [verifyRejectionReason, setVerifyRejectionReason] = useState<string>("");
  const [verifyComment, setVerifyComment] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string>("");

  // Appeal Form State
  const [appealIndicator, setAppealIndicator] = useState("2.3");
  const [appealReason, setAppealReason] = useState("");

  // Force Password Change on First Login State
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>("");
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [changePasswordError, setChangePasswordError] = useState<string>("");
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string>("");

  // Pagination States
  const [teacherPage, setTeacherPage] = useState<number>(1);
  const [teacherPerPage, setTeacherPerPage] = useState<number>(10);
  const [adminUsersPage, setAdminUsersPage] = useState<number>(1);
  const [adminUsersPerPage, setAdminUsersPerPage] = useState<number>(15);
  const [hemisPage, setHemisPage] = useState<number>(1);
  const [hemisPerPage, setHemisPerPage] = useState<number>(15);
  const [indicatorsPage, setIndicatorsPage] = useState<number>(1);
  const [indicatorsPerPage, setIndicatorsPerPage] = useState<number>(10);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sidebar Collapse State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Inactivity Auto-Logout Timeout Notice
  const [sessionTimeoutNotice, setSessionTimeoutNotice] = useState<string>("");

  // Profile Modal & Password Change State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profCurrentPassword, setProfCurrentPassword] = useState<string>("");
  const [profNewPassword, setProfNewPassword] = useState<string>("");
  const [profConfirmPassword, setProfConfirmPassword] = useState<string>("");
  const [profPasswordError, setProfPasswordError] = useState<string>("");
  const [profPasswordSuccess, setProfPasswordSuccess] = useState<string>("");
  const [isProfPasswordSaving, setIsProfPasswordSaving] = useState<boolean>(false);
  const [showProfNewPassword, setShowProfNewPassword] = useState<boolean>(false);

  const API_BASE = "http://localhost:8080/api";

  // Check saved session on mount
  useEffect(() => {
    // 1. Theme
    const savedTheme = localStorage.getItem("kpi_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    // 2. Sidebar collapsed
    const savedSidebar = localStorage.getItem("kpi_sidebar_collapsed");
    if (savedSidebar === "true") {
      setSidebarCollapsed(true);
    }

    // 3. Timeout notice
    const savedNotice = localStorage.getItem("kpi_timeout_notice");
    if (savedNotice) {
      setSessionTimeoutNotice(savedNotice);
      localStorage.removeItem("kpi_timeout_notice");
    }

    // 4. Session user & active page (Hard refresh persistence)
    const saved = localStorage.getItem("kpi_session_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        const savedRole = localStorage.getItem("kpi_active_role");
        if (savedRole) {
          setActiveRole(savedRole as any);
        } else {
          setActiveRole(parsed.role);
        }

        const savedPage = localStorage.getItem("kpi_active_page");
        if (savedPage) {
          setActivePage(savedPage as any);
        } else if (parsed.role === "ADMIN") {
          setActivePage("dashboard");
        }
      } catch {
        localStorage.removeItem("kpi_session_user");
      }
    }
    fetchInitialData();
  }, []);

  // Save activePage and activeRole on changes
  useEffect(() => {
    if (activePage) {
      localStorage.setItem("kpi_active_page", activePage);
    }
  }, [activePage]);

  useEffect(() => {
    if (activeRole) {
      localStorage.setItem("kpi_active_role", activeRole);
    }
  }, [activeRole]);

  // Toggle Theme handler
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("kpi_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  // Toggle Sidebar Collapse
  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("kpi_sidebar_collapsed", next ? "true" : "false");
  };

  // 30-minute Inactivity Auto-Logout watcher
  useEffect(() => {
    if (!currentUser) return;

    const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 daqiqa
    let lastActivity = Date.now();

    const recordActivity = () => {
      lastActivity = Date.now();
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(evt => window.addEventListener(evt, recordActivity));

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= INACTIVITY_LIMIT_MS) {
        localStorage.setItem(
          "kpi_timeout_notice",
          "Xavfsizlik ogohlantirishi: Siz 30 daqiqa davomida harakatsiz boʻlganingiz sababli tizim seansi avtomatik yakunlandi. Iltimos, qayta kiring."
        );
        localStorage.removeItem("kpi_session_user");
        setCurrentUser(null);
      }
    }, 15000); // Har 15 soniyada tekshiradi

    return () => {
      events.forEach(evt => window.removeEventListener(evt, recordActivity));
      clearInterval(checkInterval);
    };
  }, [currentUser]);

  // Handle password change from user profile modal
  const handleUpdateProfilePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfPasswordError("");
    setProfPasswordSuccess("");

    if (!currentUser) return;
    if (!profCurrentPassword.trim()) {
      setProfPasswordError("Joriy parolingizni kiriting");
      return;
    }
    if (profNewPassword.length < 6) {
      setProfPasswordError("Yangi parol kamida 6 ta belgidan iborat boʻlishi lozim");
      return;
    }
    if (profNewPassword !== profConfirmPassword) {
      setProfPasswordError("Yangi parol va uning tasdigʻi mos kelmadi");
      return;
    }

    setIsProfPasswordSaving(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser.username,
          current_password: profCurrentPassword,
          new_password: profNewPassword,
          confirm_password: profConfirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setProfPasswordError(data.detail || "Parolni yangilashda xatolik yuz berdi");
      } else {
        setProfPasswordSuccess("Maxfiy parolingiz muvaffaqiyatli yangilandi!");
        setProfCurrentPassword("");
        setProfNewPassword("");
        setProfConfirmPassword("");
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem("kpi_session_user", JSON.stringify(data.user));
        }
      }
    } catch (err: any) {
      setProfPasswordError("Serverga ulanishda xatolik: " + err.message);
    } finally {
      setIsProfPasswordSaving(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [tRes, iRes, sRes, aRes, hRes] = await Promise.all([
        fetch(`${API_BASE}/teachers`).then(r => r.json()),
        fetch(`${API_BASE}/indicators`).then(r => r.json()),
        fetch(`${API_BASE}/submissions`).then(r => r.json()),
        fetch(`${API_BASE}/appeals`).then(r => r.json()),
        fetch(`${API_BASE}/structure/hierarchy`).then(r => r.json()).catch(() => null)
      ]);
      setTeachers(tRes);
      setIndicators(iRes);
      setSubmissions(sRes);
      setAppeals(aRes);
      if (hRes) setStructureHierarchy(hRes);
    } catch (err) {
      console.error("FastAPI serverga ulanishda xatolik:", err);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [settingsRes, usersRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/settings`).then(r => r.json()),
        fetch(`${API_BASE}/admin/users?q=${encodeURIComponent(adminUsersSearchText)}&role=${adminUsersFilterRole}`).then(r => r.json()),
        fetch(`${API_BASE}/admin/logs`).then(r => r.json())
      ]);
      setSystemSettings(settingsRes);
      if (usersRes.items) {
        setAdminUsers(usersRes.items);
        setAdminUsersStats(usersRes.stats || { total: 0, teacher: 0, head_of_dept: 0, rectorate: 0, admin: 0 });
      } else {
        setAdminUsers(usersRes);
      }
      setAdminLogs(logsRes);
    } catch (err) {
      console.error("Admin maʼlumotlarini yuklashda xatolik:", err);
    }
  };

  const handleUpdateUserRole = async (username: string, newRole: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${username}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Rolni oʻzgartirishda xatolik");
      setUserActionMessage(`@${username} foydalanuvchisi roli muvaffaqiyatli '${newRole}' ga oʻzgartirildi`);
      fetchAdminData();
      setTimeout(() => setUserActionMessage(""), 4000);
    } catch (err: any) {
      alert(err.message || "Xatolik yuz berdi");
    }
  };

  const handleResetUserPassword = async (username: string) => {
    if (!confirm(`Haqiqatan ham @${username} xodimining parolini birlamchi HEMIS ID raqamiga tiklamoqchimisiz?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/users/${username}/reset-password`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Parolni tiklashda xatolik");
      setUserActionMessage(`@${username} xodimining paroli birlamchi HEMIS ID ga tiklandi va birinchi kirishda majburiy almashtirish oʻrnatildi`);
      fetchAdminData();
      setTimeout(() => setUserActionMessage(""), 5000);
    } catch (err: any) {
      alert(err.message || "Xatolik yuz berdi");
    }
  };

  const handleToggleUserStatus = async (username: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${username}/toggle-status`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Statusni oʻzgartirishda xatolik");
      setUserActionMessage(data.message);
      fetchAdminData();
      setTimeout(() => setUserActionMessage(""), 4000);
    } catch (err: any) {
      alert(err.message || "Xatolik yuz berdi");
    }
  };

  const handleSaveIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIndFormError("");
    if (!indFormId || !indFormName) {
      setIndFormError("Mezon kodi va nomini toʻldirish shart");
      return;
    }
    try {
      if (editingIndicator) {
        const res = await fetch(`${API_BASE}/indicators/${editingIndicator.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: indFormName,
            block: indFormBlock,
            max_ball: Number(indFormMaxBall),
            validity: indFormValidity,
            dept: indFormDept
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Tahrirlashda xatolik");
      } else {
        const res = await fetch(`${API_BASE}/indicators`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: indFormId.trim(),
            block: indFormBlock,
            name: indFormName.trim(),
            max_ball: Number(indFormMaxBall),
            validity: indFormValidity,
            dept: indFormDept,
            is_active: true
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Yangi mezon kiritishda xatolik");
      }
      setIsAddIndicatorModalOpen(false);
      setEditingIndicator(null);
      fetchInitialData();
      fetchAdminData();
    } catch (err: any) {
      setIndFormError(err.message || "Xatolik yuz berdi");
    }
  };

  const handleDeleteIndicator = async (indId: string) => {
    if (!confirm(`Haqiqatan ham '${indId}' mezonini arxivlamoqchimisiz? (Tarixiy arizalar buzilmaydi, lekin yangi ariza qabul qilinmaydi)`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/indicators/${indId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Arxivlashda xatolik");
      fetchInitialData();
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Xatolik yuz berdi");
    }
  };

  const fetchHemisData = async () => {
    setIsHemisLoading(true);
    try {
      const [statusRes, deptsRes, empsRes] = await Promise.all([
        fetch(`${API_BASE}/hemis/status`).then(r => r.json()),
        fetch(`${API_BASE}/hemis/departments`).then(r => r.json()),
        fetch(`${API_BASE}/hemis/employees?type=${hemisEmployeeType}&limit=300`).then(r => r.json())
      ]);
      setHemisStatus(statusRes);
      setHemisDepartments(deptsRes.items || []);
      setHemisEmployees(empsRes.items || []);
      if (empsRes.raw_total_records !== undefined) {
        setHemisStats({
          raw_total_records: empsRes.raw_total_records,
          total_fired_excluded: empsRes.total_fired_excluded,
          total_unique_active: empsRes.total_unique_active,
          multi_contracts_merged: empsRes.multi_contracts_merged
        });
      }
    } catch (err) {
      console.error("HEMIS maʼlumotlarini yuklashda xatolik:", err);
    } finally {
      setIsHemisLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "ADMIN" || activeRole === "ADMIN") {
      fetchAdminData();
    }
  }, [currentUser, activeRole]);

  useEffect(() => {
    if (activePage === "admin_hemis") {
      fetchHemisData();
    }
  }, [activePage, hemisEmployeeType]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.detail || "Login yoki maxfiy parol notoʻgʻri kiritildi");
        setIsLoggingIn(false);
        return;
      }

      const user: AuthUser = data.user;
      setCurrentUser(user);
      setActiveRole(user.role);
      localStorage.setItem("kpi_session_user", JSON.stringify(user));
      setActivePage("dashboard");

      if (user.must_change_password) {
        setCurrentPasswordInput(loginPassword.trim());
      }
    } catch {
      setLoginError("Backend server bilan aloqa oʻrnatilmadi. Qayta urinib koʻring.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Force Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError("");
    setChangePasswordSuccess("");

    if (!newPasswordInput || newPasswordInput.length < 6) {
      setChangePasswordError("Yangi maxfiy parol kamida 6 ta belgidan iborat boʻlishi shart.");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setChangePasswordError("Yangi parol va uning tasdigʻi bir-biriga mos kelmadi.");
      return;
    }
    if (newPasswordInput === currentPasswordInput) {
      setChangePasswordError("Yangi parol birlamchi HEMIS ID parolidan farq qilishi lozim!");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser?.username || "",
          current_password: currentPasswordInput,
          new_password: newPasswordInput,
          confirm_password: confirmPasswordInput
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || "Parolni oʻzgartirishda xatolik yuz berdi");
      }

      setChangePasswordSuccess("Maxfiy parol muvaffaqiyatli oʻrnatildi! Shaxsiy kabinetingiz ochilmoqda...");
      setTimeout(() => {
        const updated: AuthUser = { ...currentUser!, must_change_password: false };
        setCurrentUser(updated);
        localStorage.setItem("kpi_session_user", JSON.stringify(updated));
        setNewPasswordInput("");
        setConfirmPasswordInput("");
        setCurrentPasswordInput("");
        setChangePasswordSuccess("");
      }, 1000);
    } catch (err: any) {
      setChangePasswordError(err.message || "Xatolik yuz berdi. Iltimos qayta urinib koʻring.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Fast Fill Demo Users
  const handleFillDemo = (username: string, pass: string) => {
    setLoginUsername(username);
    setLoginPassword(pass);
    setLoginError("");
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("kpi_session_user");
    localStorage.removeItem("kpi_active_page");
    localStorage.removeItem("kpi_active_role");
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
    setSessionTimeoutNotice("");
  };

  // Save Admin Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSaveSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(systemSettings)
      });
      if (res.ok) {
        const updated = await res.json();
        setSystemSettings(updated);
        setSettingsSaveSuccess(true);
        setTimeout(() => setSettingsSaveSuccess(false), 4000);
      } else {
        alert("Sozlamalarni saqlashda xatolik yuz berdi");
      }
    } catch {
      alert("Serverga ulanishda xatolik");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Sync teachers from HEMIS
  const handleSyncHemis = async () => {
    setIsHemisSyncing(true);
    setHemisSyncMessage("");
    try {
      const res = await fetch(`${API_BASE}/hemis/sync`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setHemisSyncMessage(data.message);
        fetchInitialData();
        fetchAdminData();
        fetchHemisData();
        setTimeout(() => setHemisSyncMessage(""), 5000);
      } else {
        alert(data.detail || "Sinxronizatsiyada xatolik");
      }
    } catch {
      alert("HEMIS sinxronizatsiya soʻrovi bajarilmadi");
    } finally {
      setIsHemisSyncing(false);
    }
  };

  // Identify current teacher based on user
  const currentTeacher = currentUser
    ? teachers.find(t => t.id === currentUser.id) || teachers[0]
    : teachers[0] || null;

  // Svetafor stats
  const totalTeachersCount = teachers.length;
  const greenTeachers = teachers.filter(t => t.scores?.svetafor_zone === "green");
  const yellowTeachers = teachers.filter(t => t.scores?.svetafor_zone === "yellow");
  const redTeachers = teachers.filter(t => t.scores?.svetafor_zone === "red");

  const greenPct = totalTeachersCount > 0 ? Math.round((greenTeachers.length / totalTeachersCount) * 100) : 0;
  const yellowPct = totalTeachersCount > 0 ? Math.round((yellowTeachers.length / totalTeachersCount) * 100) : 0;
  const redPct = totalTeachersCount > 0 ? Math.round((redTeachers.length / totalTeachersCount) * 100) : 0;

  // DOI lookup
  const handleDoiLookup = async () => {
    if (!doiInput.trim()) {
      alert("Iltimos, DOI raqamini kiriting");
      return;
    }
    setIsDoiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/doi/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doi: doiInput })
      });
      const data = await res.json();
      if (data.found) {
        setModalTitle(data.title);
        setModalAuthors(data.authors_count);
        setModalIndicator(data.suggested_indicator);
        alert(`DOI tekshirildi:\n\nMaqola: ${data.title}\nJurnal: ${data.journal} (${data.quartile})\nMualliflar soni: ${data.authors_count}`);
      }
    } catch {
      alert("DOI qidirishda xatolik yuz berdi");
    } finally {
      setIsDoiLoading(false);
    }
  };

  // Submit new KPI result
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher) return;

    if (!systemSettings.submissions_open) {
      alert(`Hozirda KPI hujjatlarini qabul qilish muddati yakunlangan yoki administrator tomonidan vaqtincha yopilgan.\nBelgilangan oxirgi muddat: ${systemSettings.deadline_date}`);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: currentTeacher.id,
          indicator_id: modalIndicator,
          title: modalTitle,
          doi: doiInput || undefined,
          authors_count: Number(modalAuthors),
          submitted_date: modalDate,
          claimed_ball: Number(modalClaimedBall),
          description: modalDescription.trim() || undefined,
          file_name: "tasdiqlovchi_hujjat.pdf"
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "Arizani yuborishda xatolik yuz berdi.");
        return;
      }
      setSubmissions([data, ...submissions]);
      setIsAddModalOpen(false);
      setModalTitle("");
      setDoiInput("");
      setModalDescription("");
      alert(`Arizangiz muvaffaqiyatli qabul qilindi!\nDaʻvo qilingan ball: ${data.claimed_ball} ball.\nHolati: Ekspert komissiyasi koʻrib chiqishi kutilmoqda.`);
    } catch {
      alert("Arizani yuborishda xatolik yuz berdi.");
    }
  };

  // Open Reviewer Verification Modal
  const openVerifyModal = (sub: Submission, initialStatus: "approved" | "rejected" = "approved") => {
    setSelectedSubForReview(sub);
    setVerifyActionType(initialStatus);
    setVerifyManualScore(sub.claimed_ball ?? sub.ball ?? 0);
    setVerifyRejectionReason("");
    setVerifyComment(initialStatus === "approved" ? "Hujjatlar toʻliq va mezon talablariga mos deb topildi." : "");
    setVerifyError("");
    setIsVerifyModalOpen(true);
  };

  // Submit Verification Decision (Tasdiqlash yoki Majburiy rad etish sababi bilan)
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForReview) return;

    if (verifyActionType === "rejected" && (!verifyRejectionReason.trim() || verifyRejectionReason.trim().length < 5)) {
      setVerifyError("Arizani rad etishda rad etish sababini aniq va batafsil yozish SHART (kamida 5 ta belgi)!");
      return;
    }

    setIsVerifying(true);
    setVerifyError("");

    const reviewerId = currentUser ? currentUser.id : (currentTeacher?.id || 1);
    const reviewerName = currentUser ? currentUser.name : (currentTeacher?.name || "Mudir");

    try {
      const res = await fetch(`${API_BASE}/submissions/${selectedSubForReview.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_id: reviewerId,
          reviewer_name: reviewerName,
          status: verifyActionType,
          score: verifyActionType === "approved" ? Number(verifyManualScore) : 0,
          rejection_reason: verifyActionType === "rejected" ? verifyRejectionReason.trim() : undefined,
          comment: verifyComment.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.detail || "Tekshiruv xatoligi");
        return;
      }
      setSubmissions(submissions.map(s => s.id === selectedSubForReview.id ? data.submission : s));
      setIsVerifyModalOpen(false);
      setSelectedSubForReview(null);
      alert(data.message);
    } catch {
      setVerifyError("Server bilan bogʻlanishda xatolik yuz berdi");
    } finally {
      setIsVerifying(false);
    }
  };

  // Verify submission fallback
  const handleVerify = async (subId: number, newStatus: string) => {
    const sub = submissions.find(s => s.id === subId);
    if (sub) {
      openVerifyModal(sub, newStatus as "approved" | "rejected");
    }
  };

  // Appeal Submit
  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher) return;
    try {
      const res = await fetch(`${API_BASE}/appeals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: currentTeacher.id,
          teacher_name: currentTeacher.name,
          indicator_id: appealIndicator,
          reason: appealReason
        })
      });
      const newAppeal = await res.json();
      setAppeals([newAppeal, ...appeals]);
      setAppealReason("");
      alert(`Apellyatsiya qabul qilindi: ${newAppeal.id}. Komissiya 3 ish kunida koʻrib chiqadi.`);
    } catch {
      alert("Apellyatsiyani yuborishda xatolik yuz berdi");
    }
  };

  // Filtered teachers list
  let filteredTeachers = teachers;
  if (activeSvetaforFilter !== "ALL") {
    filteredTeachers = filteredTeachers.filter(t => t.scores?.svetafor_zone === activeSvetaforFilter);
  }
  if (searchQuery.trim()) {
    filteredTeachers = filteredTeachers.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filtered indicators list
  let filteredIndicators = indicators;
  if (selectedBlockFilter !== "ALL") {
    filteredIndicators = filteredIndicators.filter(i => i.block === selectedBlockFilter);
  }

  // Filtered HEMIS Employees
  const filteredHemisEmployees = hemisEmployees.filter(e => {
    if (!hemisFilterText.trim()) return true;
    const txt = hemisFilterText.toLowerCase();
    return (
      e.full_name.toLowerCase().includes(txt) ||
      e.department.toLowerCase().includes(txt) ||
      e.position.toLowerCase().includes(txt) ||
      e.employee_id_number.includes(txt)
    );
  });

  // Pagination calculations: Teachers
  const totalTeacherPages = Math.ceil(filteredTeachers.length / teacherPerPage) || 1;
  const currentSafeTeacherPage = Math.max(1, Math.min(teacherPage, totalTeacherPages));
  const pagedTeachers = filteredTeachers.slice(
    (currentSafeTeacherPage - 1) * teacherPerPage,
    currentSafeTeacherPage * teacherPerPage
  );

  // Pagination calculations: Indicators
  const totalIndicatorsPages = Math.ceil(filteredIndicators.length / indicatorsPerPage) || 1;
  const currentSafeIndicatorsPage = Math.max(1, Math.min(indicatorsPage, totalIndicatorsPages));
  const pagedIndicators = filteredIndicators.slice(
    (currentSafeIndicatorsPage - 1) * indicatorsPerPage,
    currentSafeIndicatorsPage * indicatorsPerPage
  );

  // Pagination calculations: HEMIS Employees
  const totalHemisPages = Math.ceil(filteredHemisEmployees.length / hemisPerPage) || 1;
  const currentSafeHemisPage = Math.max(1, Math.min(hemisPage, totalHemisPages));
  const pagedHemisEmployees = filteredHemisEmployees.slice(
    (currentSafeHemisPage - 1) * hemisPerPage,
    currentSafeHemisPage * hemisPerPage
  );

  // Pagination calculations: Admin Users
  const totalAdminUsersPages = Math.ceil(adminUsers.length / adminUsersPerPage) || 1;
  const currentSafeAdminUsersPage = Math.max(1, Math.min(adminUsersPage, totalAdminUsersPages));
  const pagedAdminUsers = adminUsers.slice(
    (currentSafeAdminUsersPage - 1) * adminUsersPerPage,
    currentSafeAdminUsersPage * adminUsersPerPage
  );
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden">
        {/* Decorative background grid and glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="w-full max-w-md z-10">
          {/* Official University Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-125" />
              <img
                src="/logo-kpi.png"
                alt="OʻzMU JF KPI Tizimi Logotipi"
                className="w-24 h-24 rounded-full shadow-2xl border-2 border-blue-400/50 object-contain bg-white dark:bg-slate-900 p-0.5 relative z-10 transition-transform hover:scale-105"
              />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Oʻzbekiston Milliy Universiteti
            </h1>
            <p className="text-sm font-semibold text-blue-400 mt-0.5">
              Jizzax filiali KPI axborot tizimi
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Professor-oʻqituvchilar faoliyatini baholash va ragʻbatlantirish portali
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-700/60">
              <span className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                Tizimga xavfsiz kirish
              </span>
              <span className="text-xs font-semibold text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
                2025/2026-oʻquv yili
              </span>
            </div>

            {sessionTimeoutNotice && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-start gap-2.5 shadow-sm animate-in fade-in">
                <Clock className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                <div className="leading-relaxed">{sessionTimeoutNotice}</div>
              </div>
            )}

            {loginError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Foydalanuvchi logini (HEMIS ID yoki login)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Masalan: 3082312087 yoki admin"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Maxfiy parol
                  </label>
                  <span className="text-[10px] text-blue-400">Birlamchi parol = HEMIS ID</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="HEMIS ID yoki shaxsiy parol"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-3 px-4 bg-blue-700 hover:bg-blue-600 disabled:bg-blue-900 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Tekshirilmoqda...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Tizimga kirish</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Fill / Demo Accounts */}
            <div className="mt-6 pt-5 border-t border-slate-700/60">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
                Tezkor sinov uchun namunaviy profillar
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleFillDemo("admin", "admin123")}
                  className="p-2 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700/80 rounded-lg text-left transition-colors"
                >
                  <div className="font-bold text-blue-300">Administrator</div>
                  <div className="text-[10px] text-slate-400 font-mono">admin / admin123</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("dekan_matematika", "dekan123")}
                  className="p-2 bg-slate-900/60 hover:bg-slate-700/60 border border-indigo-500/40 rounded-lg text-left transition-colors"
                >
                  <div className="font-bold text-indigo-300 flex items-center justify-between">
                    <span>Dekan (Matematika)</span>
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 rounded">1.5 st</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">dekan_matematika</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("dekan", "dekan123")}
                  className="p-2 bg-slate-900/60 hover:bg-slate-700/60 border border-purple-500/40 rounded-lg text-left transition-colors"
                >
                  <div className="font-bold text-purple-300 flex items-center justify-between">
                    <span>Dekan (Psixologiya)</span>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded">1.25 st</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">dekan / dekan123</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("mudir", "mudir123")}
                  className="p-2 bg-slate-900/60 hover:bg-slate-700/60 border border-sky-500/40 rounded-lg text-left transition-colors"
                >
                  <div className="font-bold text-sky-300 flex items-center justify-between">
                    <span>Kafedra mudiri</span>
                    <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1 rounded">1.5 st</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">mudir / mudir123</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("oqituvchi", "oqituvchi123")}
                  className="p-2 bg-slate-900/60 hover:bg-slate-700/60 border border-emerald-500/40 rounded-lg text-left transition-colors"
                >
                  <div className="font-bold text-emerald-300 flex items-center justify-between">
                    <span>Oʻqituvchi (Dotsent)</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">1.50 st</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">oqituvchi / 123</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("rektor", "rektor123")}
                  className="p-2 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700/80 rounded-lg text-left transition-colors"
                >
                  <div className="font-bold text-amber-300">Filial rahbariyati</div>
                  <div className="text-[10px] text-slate-400 font-mono">rektor / rektor123</div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center mt-6 text-xs text-slate-400">
            Oʻzbekiston Milliy universiteti Jizzax filiali axborot xavfsizligi xizmati nazorati ostida
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED USER INTERFACE
  // =========================================================================
  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-200 ${
      theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Force Password Change Modal (Cannot be closed until password changed) */}
      {currentUser?.must_change_password && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-2xl border shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-200 ${
            theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border ${
              theme === "dark" ? "bg-amber-950/60 border-amber-800 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600"
            }`}>
              <LockKeyhole className="w-6 h-6" />
            </div>

            <div className="text-center mb-6">
              <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Birlamchi parolni almashtirish
              </h3>
              <p className={`text-xs mt-1.5 leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                Hurmatli <b>{currentUser.name}</b>, siz tizimga birinchi marta oʻzingizning HEMIS ID raqamingiz orqali kirdingiz. Xavfsizlik talablariga muvofiq, shaxsiy maʼlumotlaringiz va KPI natijalaringizni himoyalash uchun oʻzingiz biladigan yangi maxfiy parol oʻrnating.
              </p>
            </div>

            {changePasswordError && (
              <div className={`mb-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                theme === "dark" ? "bg-rose-950/60 border-rose-800 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"
              }`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{changePasswordError}</span>
              </div>
            )}

            {changePasswordSuccess && (
              <div className={`mb-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                theme === "dark" ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}>
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{changePasswordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                  Joriy birlamchi parol (HEMIS ID)
                </label>
                <input
                  type="password"
                  required
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="HEMIS ID raqamingiz"
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                  Yangi maxfiy parol (kamida 6 ta belgi)
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Yangi mustahkam parol"
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                  Yangi parolni takrorlang
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Parolni qayta tering"
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isChangingPassword || !!changePasswordSuccess}
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-950 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <span>Yangilanmoqda...</span>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Parolni yangilash va tizimga kirish</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${
                    theme === "dark" ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  Bekor qilish va hisobdan chiqish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 border-r flex flex-col z-30 shadow-sm transition-all duration-300 ${
        sidebarCollapsed ? "w-20" : "w-64"
      } ${
        theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        {/* Brand & Collapse Header */}
        <div className={`border-b flex items-center ${
          sidebarCollapsed ? "p-3 flex-col gap-2 justify-center" : "p-4 justify-between"
        } ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-blue-500/30 bg-white dark:bg-slate-800 p-0.5 overflow-hidden transition-transform hover:scale-105">
              <img
                src="/logo-kpi.png"
                alt="OʻzMU JF KPI"
                className="w-full h-full object-contain"
              />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className={`text-sm font-bold leading-tight truncate ${theme === "dark" ? "text-white" : "text-blue-950"}`}>
                  OʻzMU JBNUU
                </h1>
                <p className="text-[11px] text-slate-400 font-medium truncate">KPI axborot tizimi</p>
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Menyuni kengaytirish" : "Menyuni ixchamlash"}
            className={`p-1.5 rounded-lg transition-colors ${
              theme === "dark" ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
            }`}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2.5 flex-1 flex flex-col gap-1 overflow-y-auto">
          {/* ========================================= */}
          {/* ROLE: ADMIN NAVIGATION */}
          {/* ========================================= */}
          {activeRole === "ADMIN" && (
            <div className="flex flex-col gap-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Administrator boshqaruvi
                </div>
              )}
              <button
                onClick={() => setActivePage("dashboard")}
                title="Admin bosh sahifasi"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "dashboard"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Admin bosh sahifasi</span>}
              </button>
              <button
                onClick={() => setActivePage("structure")}
                title="Tashkiliy tuzilma (Ierarxiya)"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "structure"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Building className="w-4 h-4 text-amber-500 flex-shrink-0" />
                {!sidebarCollapsed && <span>Tashkiliy tuzilma</span>}
              </button>
              <button
                onClick={() => setActivePage("admin_hemis")}
                title="HEMIS integratsiyasi"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "admin_hemis"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Database className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {!sidebarCollapsed && <span>HEMIS integratsiyasi</span>}
              </button>
              <button
                onClick={() => setActivePage("admin_users")}
                title="Foydalanuvchilar va rollar"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "admin_users"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Foydalanuvchilar va rollar</span>}
              </button>
              <button
                onClick={() => setActivePage("admin_settings")}
                title="Tizim sozlamalari"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "admin_settings"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Tizim sozlamalari</span>}
              </button>
              <button
                onClick={() => setActivePage("admin_indicators")}
                title="Baholash mezonlari (CRUD)"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "admin_indicators"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Sliders className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                {!sidebarCollapsed && <span>Baholash mezonlari (CRUD)</span>}
              </button>
              <button
                onClick={() => setActivePage("admin_logs")}
                title="Xavfsizlik va audit jurnali"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "admin_logs"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Xavfsizlik va audit jurnali</span>}
              </button>
            </div>
          )}

          {/* ========================================= */}
          {/* ROLE: HEAD_OF_DEPT NAVIGATION */}
          {/* ========================================= */}
          {activeRole === "HEAD_OF_DEPT" && (
            <div className="flex flex-col gap-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Kafedra boshqaruvi
                </div>
              )}
              <button
                onClick={() => setActivePage("dashboard")}
                title="Kafedra boshqaruvi"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "dashboard"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Kafedra monitoringi</span>}
              </button>
              <button
                onClick={() => setActivePage("structure")}
                title="Tashkiliy ierarxiya"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "structure"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Building className="w-4 h-4 text-amber-500 flex-shrink-0" />
                {!sidebarCollapsed && <span>Tashkiliy tuzilma</span>}
              </button>
              <button
                onClick={() => setActivePage("svetafor")}
                title="Kafedra svetafori"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "svetafor"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Kafedra svetafori</span>}
              </button>
              <button
                onClick={() => setActivePage("indicators")}
                title="Baholash mezonlari (41 ta)"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "indicators"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CheckSquare className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Baholash mezonlari</span>}
              </button>
              <button
                onClick={() => setActivePage("appeals")}
                title="Apellyatsiya arizalari"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "appeals"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileQuestion className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Apellyatsiyalar</span>}
              </button>
              <button
                onClick={() => setActivePage("doc")}
                title="Rasmiy Nizom"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "doc"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Rasmiy Nizom</span>}
              </button>
            </div>
          )}

          {/* ========================================= */}
          {/* ROLE: DEAN NAVIGATION */}
          {/* ========================================= */}
          {activeRole === "DEAN" && (
            <div className="flex flex-col gap-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Dekanat portali
                </div>
              )}
              <button
                onClick={() => setActivePage("dashboard")}
                title="Fakultet KPI portali"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "dashboard"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Fakultet boshqaruvi</span>}
              </button>
              <button
                onClick={() => setActivePage("structure")}
                title="Tashkiliy ierarxiya"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "structure"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-500 flex-shrink-0" />
                {!sidebarCollapsed && <span>Kafedralar tuzilmasi</span>}
              </button>
              <button
                onClick={() => setActivePage("svetafor")}
                title="Fakultet svetafori"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "svetafor"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Fakultet svetafori</span>}
              </button>
              <button
                onClick={() => setActivePage("indicators")}
                title="Baholash mezonlari (41 ta)"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "indicators"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CheckSquare className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Baholash mezonlari</span>}
              </button>
              <button
                onClick={() => setActivePage("appeals")}
                title="Apellyatsiyalar"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "appeals"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileQuestion className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Apellyatsiyalar</span>}
              </button>
              <button
                onClick={() => setActivePage("doc")}
                title="Rasmiy Nizom"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "doc"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Rasmiy Nizom</span>}
              </button>
            </div>
          )}

          {/* ========================================= */}
          {/* ROLE: RECTORATE NAVIGATION */}
          {/* ========================================= */}
          {activeRole === "RECTORATE" && (
            <div className="flex flex-col gap-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Filial rahbariyati
                </div>
              )}
              <button
                onClick={() => setActivePage("dashboard")}
                title="Integral KPI boshqaruv portali"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "dashboard"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Integral KPI portali</span>}
              </button>
              <button
                onClick={() => setActivePage("structure")}
                title="Filial tashkiliy ierarxiyasi"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "structure"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Building className="w-4 h-4 text-amber-500 flex-shrink-0" />
                {!sidebarCollapsed && <span>Tashkiliy ierarxiya</span>}
              </button>
              <button
                onClick={() => setActivePage("svetafor")}
                title="Filial svetafor monitoringi"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "svetafor"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Filial svetafori</span>}
              </button>
              <button
                onClick={() => setActivePage("indicators")}
                title="Baholash mezonlari (41 ta)"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "indicators"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CheckSquare className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Baholash mezonlari</span>}
              </button>
              <button
                onClick={() => setActivePage("appeals")}
                title="Apellyatsiyalar hisoboti"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "appeals"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileQuestion className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Apellyatsiyalar</span>}
              </button>
              <button
                onClick={() => setActivePage("doc")}
                title="Rasmiy Nizom"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "doc"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Rasmiy Nizom</span>}
              </button>
            </div>
          )}

          {/* ========================================= */}
          {/* ROLE: TEACHER NAVIGATION */}
          {/* ========================================= */}
          {activeRole === "TEACHER" && (
            <div className="flex flex-col gap-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pedagogik kabinet
                </div>
              )}
              <button
                onClick={() => setActivePage("dashboard")}
                title="Shaxsiy kabinet"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "dashboard"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Shaxsiy kabinet</span>}
              </button>
              <button
                onClick={() => setActivePage("structure")}
                title="Filial va kafedra tuzilmasi"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "structure"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Building className="w-4 h-4 text-amber-500 flex-shrink-0" />
                {!sidebarCollapsed && <span>Tashkiliy tuzilma</span>}
              </button>
              <button
                onClick={() => setActivePage("indicators")}
                title="Baholash mezonlari (41 ta)"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "indicators"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CheckSquare className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Baholash mezonlari (41)</span>}
              </button>
              <button
                onClick={() => setActivePage("svetafor")}
                title="Svetafor reytingi"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "svetafor"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Svetafor reytingi</span>}
              </button>
              <button
                onClick={() => setActivePage("appeals")}
                title="Apellyatsiya berish"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "appeals"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileQuestion className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Apellyatsiya berish</span>}
              </button>
              <button
                onClick={() => setActivePage("doc")}
                title="Rasmiy Nizom"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "doc"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>Rasmiy Nizom</span>}
              </button>
            </div>
          )}
        </nav>

        {/* Bottom Actions: Dark Mode, Profile & Logout */}
        <div className={`p-3 border-t flex flex-col gap-2 ${
          theme === "dark" ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-slate-50"
        }`}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Yorugʻ rejimga oʻtish" : "Qorongʻi rejimga oʻtish"}
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center px-2 py-2" : "justify-between px-3 py-2"
            } rounded-lg text-xs font-semibold border transition-colors ${
              theme === "dark"
                ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              {!sidebarCollapsed && <span>{theme === "dark" ? "Yorugʻ rejim" : "Qorongʻi rejim"}</span>}
            </div>
            {!sidebarCollapsed && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                theme === "dark" ? "bg-amber-400/20 text-amber-300" : "bg-slate-200 text-slate-700"
              }`}>
                {theme === "dark" ? "TUN" : "KUN"}
              </span>
            )}
          </button>

          {/* Profile & Password Button */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            title="Mening profilim va parolni yangilash"
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center p-2" : "gap-2.5 p-2 text-left"
            } rounded-lg border transition-all ${
              theme === "dark"
                ? "bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 text-slate-200"
                : "bg-white border-slate-200/80 hover:bg-slate-100 text-slate-800 shadow-xs"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-blue-500 font-medium truncate flex items-center gap-1 mt-0.5">
                  <UserCog className="w-3 h-3" />
                  <span>Profil va parol</span>
                </div>
              </div>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Tizimdan xavfsiz chiqish"
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors`}
          >
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>Tizimdan chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? "ml-20" : "ml-64"
      }`}>
        {/* Top Header */}
        <header className={`sticky top-0 z-20 h-16 border-b px-6 flex items-center justify-between backdrop-blur-md transition-colors ${
          theme === "dark" ? "bg-slate-900/95 border-slate-800 text-slate-100" : "bg-white/95 border-slate-200 text-slate-900"
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark" ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              }`}
              title="Sidebarni yigʻish / kengaytirish"
            >
              <Menu className="w-4 h-4" />
            </button>

            <h2 className="text-sm font-bold truncate">
              {activePage === "dashboard" && activeRole === "ADMIN" && "Tizim administratori boshqaruv portali"}
              {activePage === "dashboard" && activeRole === "DEAN" && "Fakultet dekanati KPI monitoring va kafedralar tahlili"}
              {activePage === "dashboard" && activeRole === "HEAD_OF_DEPT" && "Kafedra boshqaruvi va oʻqituvchilar monitoringi"}
              {activePage === "dashboard" && activeRole === "RECTORATE" && "Filial rahbariyati — Integral KPI boshqaruv portali"}
              {activePage === "dashboard" && activeRole === "TEACHER" && "Professor-oʻqituvchilar shaxsiy faoliyatini baholash kabineti"}
              {activePage === "structure" && "Filial tashkiliy tuzilmasi, fakultetlar va kafedralar ierarxiyasi"}
              {activePage === "admin_hemis" && "HEMIS axborot tizimi integratsiyasi"}
              {activePage === "admin_settings" && "Tizim konfiguratsiyasi va qabul muddatlari"}
              {activePage === "admin_indicators" && "KPI baholash mezonlari dinamik boshqaruvi (CRUD)"}
              {activePage === "admin_users" && "Foydalanuvchilar hisoblari va biriktirilgan rollar"}
              {activePage === "admin_logs" && "Tizim auditi va xavfsizlik qaydnomasi"}
              {activePage === "indicators" && "KPI baholash mezonlari katalogi (100 ball meʼyori)"}
              {activePage === "svetafor" && "Svetafor tizimi va moliya byudjeti monitoringi"}
              {activePage === "appeals" && "Apellyatsiya arizalarini koʻrib chiqish komissiyasi"}
              {activePage === "doc" && "OʻzMU JBNUU KPI Nizomi (13 bob, 6 ilova)"}
            </h2>

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              theme === "dark" ? "bg-blue-950 text-blue-300 border border-blue-800" : "bg-blue-100 text-blue-900"
            }`}>
              {systemSettings.academic_year}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin inspector view switcher (only visible to system admin) */}
            {currentUser.role === "ADMIN" && (
              <div className={`flex items-center gap-1.5 p-1 rounded-lg border ${
                theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
              }`}>
                <span className="text-[11px] font-semibold text-slate-400 px-1.5 hidden md:inline">Koʻrinish:</span>
                <button
                  onClick={() => { setActiveRole("ADMIN"); setActivePage("dashboard"); }}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeRole === "ADMIN" ? "bg-blue-900 text-white shadow-xs" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => { setActiveRole("DEAN"); setActivePage("dashboard"); }}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeRole === "DEAN" ? "bg-blue-900 text-white shadow-xs" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Dekan
                </button>
                <button
                  onClick={() => { setActiveRole("HEAD_OF_DEPT"); setActivePage("dashboard"); }}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeRole === "HEAD_OF_DEPT" ? "bg-blue-900 text-white shadow-xs" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Mudir
                </button>
                <button
                  onClick={() => { setActiveRole("TEACHER"); setActivePage("dashboard"); }}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeRole === "TEACHER" ? "bg-blue-900 text-white shadow-xs" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Oʻqituvchi
                </button>
                <button
                  onClick={() => { setActiveRole("RECTORATE"); setActivePage("dashboard"); }}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeRole === "RECTORATE" ? "bg-blue-900 text-white shadow-xs" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Rektorat
                </button>
              </div>
            )}

            {/* Non-admin user role badge */}
            {currentUser.role !== "ADMIN" && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                theme === "dark" ? "bg-slate-800/80 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  {currentUser.role === "DEAN"
                    ? "Fakultet dekani portali"
                    : currentUser.role === "HEAD_OF_DEPT"
                    ? "Kafedra mudiri portali"
                    : currentUser.role === "RECTORATE"
                    ? "Filial rahbariyati portali"
                    : "Professor-oʻqituvchi portali"}
                </span>
                {(currentUser.department || currentUser.faculty) && (
                  <span className="hidden lg:inline text-[11px] text-slate-400 font-normal">
                    • {currentUser.role === "DEAN" ? currentUser.faculty : currentUser.department}
                  </span>
                )}
                {currentUser.fte && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {currentUser.fte} stavka
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Container */}
        <main className={`p-8 flex-1 transition-colors ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
          {/* ========================================================================= */}
          {/* ADMIN VIEW: HEMIS INTEGRATION */}
          {/* ========================================================================= */}
          {activePage === "admin_hemis" && (
            <div className="space-y-6">
              {/* HEMIS Status Banner */}
              <div className={`rounded-xl border shadow-sm p-6 ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className={`flex justify-between items-start pb-5 border-b mb-5 ${
                  theme === "dark" ? "border-slate-800" : "border-slate-100"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border ${
                      theme === "dark" ? "bg-emerald-950/60 border-emerald-800 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}>
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                          HEMIS Axborot Tizimi Integratsiyasi
                        </h3>
                        {hemisStatus?.connected ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                            theme === "dark" ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Faol ulandi
                          </span>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            theme === "dark" ? "bg-rose-950/60 text-rose-300 border-rose-800" : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}>
                            Ulanmagan
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-1 font-mono ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                        Server: {hemisStatus?.base_url || "https://student.jbnuu.uz/rest/v1"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSyncHemis}
                    disabled={isHemisSyncing}
                    className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-950 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isHemisSyncing ? "animate-spin" : ""}`} />
                    <span>{isHemisSyncing ? "Sinxronlashtirilmoqda..." : "HEMIS bilan toʻliq sinxronlash"}</span>
                  </button>
                </div>

                {hemisSyncMessage && (
                  <div className={`mb-4 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                    theme === "dark" ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  }`}>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>{hemisSyncMessage}</span>
                  </div>
                )}

                {/* Privacy Badge */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <div className="flex items-center gap-2">
                    <LockKeyhole className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>
                      <b className={theme === "dark" ? "text-white" : "text-slate-900"}>Shaxsga doir maʼlumotlar xavfsizligi kafolatlangan:</b> Pasport seriya/raqami, tugʻilgan sana, yashash manzili va ichki xeshlar bazaga saqlanmaydi.
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Token: .env orqali himoyalangan</span>
                </div>
              </div>

              {/* Deduplication & Cleanup Alert */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 shadow-sm transition-colors ${
                theme === "dark"
                  ? "bg-slate-900 border-blue-900/60 text-slate-200"
                  : "bg-blue-50/80 border-blue-200/80 text-slate-700"
              }`}>
                <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h5 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${
                    theme === "dark" ? "text-blue-300" : "text-blue-950"
                  }`}>
                    <span>Dublikatlarni tozalash, pedagogik shtat va xavfsiz avtorizatsiya mexanizmi</span>
                  </h5>
                  <div className={`text-xs leading-relaxed space-y-1 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  }`}>
                    <p>
                      • <b className={theme === "dark" ? "text-white" : "text-slate-900"}>Pedagogik shtat mezoni:</b> Agar xodim maʼmuriy lavozimda (masalan, 1.0 stavka) ishlab, kafedrada 0.5 yoki 0.25 stavka dars bersa, uning KPI dagi hisob-kitob stavkasi (K_shtat koeffitsiyenti) aynan uning <b className={theme === "dark" ? "text-blue-300" : "text-blue-900"}>pedagogik stavkasi (0.5 yoki 0.25)</b> boʻyicha olinadi. Oʻqituvchilik shartnomasi boʻlmagan sof xodimlar KPI dan butunlay chetlatiladi.
                    </p>
                    <p>
                      • <b className={theme === "dark" ? "text-white" : "text-slate-900"}>Birlamchi login va parol:</b> Har bir oʻqituvchi oʻzining <b className={theme === "dark" ? "text-blue-300" : "text-blue-900"}>HEMIS ID raqami</b> orqali login va birlamchi parol bilan tizimga kiradi. Birinchi kirganda yangi xavfsiz parol oʻrnatmagunicha tizimdan foydalanish cheklanadi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Xom HEMIS yozuvlari</span>
                    <Database className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    {hemisStats?.raw_total_records || 459} ta
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">HEMIS dagi barcha shartnoma qatorlari</div>
                </div>

                <div className={`p-4 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-rose-900/40" : "bg-white border-rose-200 bg-rose-50/20"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[11px] font-bold uppercase ${theme === "dark" ? "text-rose-400" : "text-rose-700"}`}>Boʻshaganlar (chiqarilgan)</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                  <div className={`text-2xl font-black ${theme === "dark" ? "text-rose-400" : "text-rose-700"}`}>
                    {hemisStats?.total_fired_excluded || 110} nafar
                  </div>
                  <div className={`text-[11px] mt-1 ${theme === "dark" ? "text-rose-300/80" : "text-rose-600/80"}`}>Universitetda ishlamaydi (KPI ga kirmadi)</div>
                </div>

                <div className={`p-4 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-amber-900/40" : "bg-white border-amber-200 bg-amber-50/20"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[11px] font-bold uppercase ${theme === "dark" ? "text-amber-400" : "text-amber-800"}`}>Birlashtirilgan oʻrindoshlik</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <div className={`text-2xl font-black ${theme === "dark" ? "text-amber-400" : "text-amber-800"}`}>
                    {hemisStats?.multi_contracts_merged || 7} nafar
                  </div>
                  <div className={`text-[11px] mt-1 ${theme === "dark" ? "text-amber-300/80" : "text-amber-700/80"}`}>Asosiy va oʻrindosh stavkalari jamlandi</div>
                </div>

                <div className={`p-4 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-emerald-900/40" : "bg-white border-emerald-200 bg-emerald-50/20"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[11px] font-bold uppercase ${theme === "dark" ? "text-emerald-400" : "text-emerald-800"}`}>Noyob faol oʻqituvchilar</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className={`text-2xl font-black ${theme === "dark" ? "text-emerald-400" : "text-emerald-800"}`}>
                    {hemisStats?.total_unique_active || 199} nafar
                  </div>
                  <div className={`text-[11px] mt-1 ${theme === "dark" ? "text-emerald-300/80" : "text-emerald-700/80"}`}>Hozirda faol toza professor-oʻqituvchilar</div>
                </div>
              </div>

              {/* Employees List from HEMIS */}
              <div className={`rounded-xl border shadow-sm p-6 ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      HEMIS Faol Professor-oʻqituvchilar Reyestri
                    </h4>
                    <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Dublikatlarsiz va sobiq boʻshagan xodimlarsiz filtrlangan yagona roʻyxat (jami: {filteredHemisEmployees.length} nafar)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href="http://localhost:8080/api/export/hemis-excel"
                      download
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                      title="HEMIS dan tozalangan xodimlar bazasini Excel (.xlsx) faylida yuklab olish"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
                      <span>Excel (.xlsx) yuklash</span>
                    </a>

                    <div className={`flex p-0.5 rounded-lg border text-xs ${
                      theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
                    }`}>
                      <button
                        onClick={() => {
                          setHemisEmployeeType("teacher");
                          setHemisPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                          hemisEmployeeType === "teacher"
                            ? theme === "dark" ? "bg-slate-700 text-white shadow-xs" : "bg-white text-blue-950 shadow-sm"
                            : theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-600"
                        }`}
                      >
                        Faqat oʻqituvchilar
                      </button>
                      <button
                        onClick={() => {
                          setHemisEmployeeType("all");
                          setHemisPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                          hemisEmployeeType === "all"
                            ? theme === "dark" ? "bg-slate-700 text-white shadow-xs" : "bg-white text-blue-950 shadow-sm"
                            : theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-600"
                        }`}
                      >
                        Barcha xodimlar
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={hemisFilterText}
                        onChange={(e) => {
                          setHemisFilterText(e.target.value);
                          setHemisPage(1);
                        }}
                        placeholder="F.I.Sh., kafedra yoki ID..."
                        className={`pl-8 pr-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 w-64 ${
                          theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {isHemisLoading ? (
                  <div className={`py-12 text-center text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    HEMIS API dan maʼlumotlar yuklanmoqda...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className={`border-b text-xs font-bold uppercase ${
                        theme === "dark" ? "bg-slate-900/90 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}>
                        <tr>
                          <th className="py-3 px-4">Xodim</th>
                          <th className="py-3 px-4">Kodi (ID)</th>
                          <th className="py-3 px-4">Kafedrasi</th>
                          <th className="py-3 px-4">Lavozimi</th>
                          <th className="py-3 px-4">Ilmiy darajasi / Unvoni</th>
                          <th className="py-3 px-4">Shtati (Stavka)</th>
                          <th className="py-3 px-4">Holati</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === "dark" ? "divide-slate-800" : "divide-slate-100"}`}>
                        {pagedHemisEmployees.map((emp) => (
                          <tr key={emp.id} className={`transition-colors ${theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {emp.image ? (
                                  <img
                                    src={emp.image}
                                    alt={emp.short_name}
                                    className={`w-8 h-8 rounded-full object-cover border ${theme === "dark" ? "border-slate-700" : "border-slate-200"}`}
                                  />
                                ) : (
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                    theme === "dark" ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600"
                                  }`}>
                                    {emp.full_name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <div className={`font-semibold text-xs leading-snug ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{emp.full_name}</div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[11px] text-slate-400">{emp.employment_form}</span>
                                    {emp.had_fired_contracts && (
                                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                                        theme === "dark" ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200"
                                      }`} title="Avvalgi shartnomasi yopilgan, hozirgi shartnomasi amalda">
                                        Eski shartnomasi yopilgan
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={`py-3 px-4 font-mono text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                              {emp.employee_id_number}
                            </td>
                            <td className={`py-3 px-4 text-xs max-w-xs ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                              {emp.department}
                            </td>
                            <td className={`py-3 px-4 text-xs font-medium ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                              <div>{emp.position}</div>
                              {emp.additional_positions && (
                                <div className={`text-[10px] mt-0.5 font-normal ${theme === "dark" ? "text-amber-400" : "text-amber-700"}`}>
                                  + {emp.additional_positions}
                                </div>
                              )}
                            </td>
                            <td className={`py-3 px-4 text-xs ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                              <div>{emp.degree}</div>
                              <div className="text-[10px] text-slate-400">{emp.rank}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className={`font-bold text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-900"}`}>
                                {emp.fte} stavka
                              </div>
                              {emp.active_contracts_count && emp.active_contracts_count > 1 ? (
                                <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                                  theme === "dark" ? "bg-amber-950/60 text-amber-300 border-amber-800" : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}>
                                  {emp.active_contracts_count} ta stavka jamlandi
                                </span>
                              ) : null}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                theme === "dark" ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                              }`}>
                                Faol ishlamoqda
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Bar for HEMIS */}
                    <div className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs mt-2 ${
                      theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span>
                          Jami <b>{filteredHemisEmployees.length}</b> nafardan <b>{filteredHemisEmployees.length > 0 ? (currentSafeHemisPage - 1) * hemisPerPage + 1 : 0}</b> - <b>{Math.min(currentSafeHemisPage * hemisPerPage, filteredHemisEmployees.length)}</b> koʻrsatilmoqda
                        </span>
                        <span className={theme === "dark" ? "text-slate-700" : "text-slate-300"}>|</span>
                        <div className="flex items-center gap-1.5">
                          <span>Sahifada:</span>
                          <select
                            value={hemisPerPage}
                            onChange={(e) => {
                              setHemisPerPage(Number(e.target.value));
                              setHemisPage(1);
                            }}
                            className={`border rounded px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-blue-900 ${
                              theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                            }`}
                          >
                            <option value={15}>15 ta</option>
                            <option value={25}>25 ta</option>
                            <option value={50}>50 ta</option>
                            <option value={100}>100 ta</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setHemisPage(prev => Math.max(1, prev - 1))}
                          disabled={currentSafeHemisPage <= 1}
                          className={`px-2.5 py-1.5 rounded border disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors ${
                            theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Oldingi</span>
                        </button>

                        <div className="flex items-center gap-1 px-1">
                          {Array.from({ length: totalHemisPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalHemisPages || Math.abs(p - currentSafeHemisPage) <= 1)
                            .map((p, idx, arr) => (
                              <React.Fragment key={p}>
                                {idx > 0 && arr[idx - 1] !== p - 1 && (
                                  <span className="px-1 text-slate-400">...</span>
                                )}
                                <button
                                  onClick={() => setHemisPage(p)}
                                  className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                                    currentSafeHemisPage === p
                                      ? "bg-blue-900 text-white"
                                      : theme === "dark"
                                      ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  {p}
                                </button>
                              </React.Fragment>
                            ))}
                        </div>

                        <button
                          onClick={() => setHemisPage(prev => Math.min(totalHemisPages, prev + 1))}
                          disabled={currentSafeHemisPage >= totalHemisPages}
                          className={`px-2.5 py-1.5 rounded border disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors ${
                            theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span>Keyingi</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Departments Catalog */}
              <div className={`rounded-xl border shadow-sm p-6 ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      HEMIS Kafedra va Boʻlinmalari (42 ta)
                    </h4>
                    <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Filialning rasmiy tashkiliy tuzilmasi</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
                  {hemisDepartments.map((dept) => (
                    <div
                      key={dept.id}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                        theme === "dark"
                          ? "bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-200"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div>
                        <div className={`font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{dept.name}</div>
                        <div className="text-slate-400 text-[11px] font-mono mt-0.5">Kodi: {dept.code}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        dept.structure_type === "Kafedra"
                          ? theme === "dark" ? "bg-blue-950/60 text-blue-300 border-blue-800" : "bg-blue-50 text-blue-800 border-blue-100"
                          : theme === "dark" ? "bg-slate-700 text-slate-300 border-slate-600" : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {dept.structure_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADMIN VIEW: DASHBOARD */}
          {/* ========================================================================= */}
          {activePage === "dashboard" && activeRole === "ADMIN" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-5">
                <div className={`p-5 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Jami xodimlar</span>
                    <Users className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-900"}`} />
                  </div>
                  <div className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{teachers.length} nafar</div>
                  <div className="text-xs text-slate-400 mt-1">Pedagogik va maʼmuriy tarkib</div>
                </div>

                <div className={`p-5 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Arizalar soni</span>
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{submissions.length} ta</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {submissions.filter(s => s.status === "approved").length} tasdiqlangan, {submissions.filter(s => s.status === "pending").length} kutilmoqda
                  </div>
                </div>

                <div className={`p-5 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Oylik KPI byudjeti</span>
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    {(systemSettings.budget_cap_monthly / 1000000).toFixed(0)} mln soʻm
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Nizom asosida limitlangan</div>
                </div>

                <div className={`p-5 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Qabul holati</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    {systemSettings.submissions_open ? (
                      <span className="text-emerald-500 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        Qabul ochiq
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                        Qabul yopiq
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Muddat: {systemSettings.deadline_date}</div>
                </div>
              </div>

              {/* Fast Navigation to Admin submodules */}
              <div className="grid grid-cols-4 gap-5">
                <div
                  onClick={() => setActivePage("admin_hemis")}
                  className={`p-5 rounded-xl border shadow-sm hover:shadow transition-all cursor-pointer group ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 hover:border-emerald-600 text-slate-100"
                      : "bg-white border-slate-200 hover:border-emerald-600 text-slate-900"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                    theme === "dark" ? "bg-emerald-950/60 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white" : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white"
                  }`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>HEMIS integratsiyasi</h4>
                  <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    Kafedralar va 459 nafar faol oʻqituvchilar reyestri.
                  </p>
                </div>

                <div
                  onClick={() => setActivePage("admin_settings")}
                  className={`p-5 rounded-xl border shadow-sm hover:shadow transition-all cursor-pointer group ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 hover:border-blue-700 text-slate-100"
                      : "bg-white border-slate-200 hover:border-blue-900/50 text-slate-900"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                    theme === "dark" ? "bg-blue-950/60 text-blue-400 group-hover:bg-blue-900 group-hover:text-white" : "bg-blue-50 text-blue-900 group-hover:bg-blue-900 group-hover:text-white"
                  }`}>
                    <Settings className="w-5 h-5" />
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Tizim konfiguratsiyasi</h4>
                  <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    Arizalarni qabul qilish muddati va byudjet limitini boshqarish.
                  </p>
                </div>

                <div
                  onClick={() => setActivePage("admin_users")}
                  className={`p-5 rounded-xl border shadow-sm hover:shadow transition-all cursor-pointer group ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 hover:border-purple-700 text-slate-100"
                      : "bg-white border-slate-200 hover:border-blue-900/50 text-slate-900"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                    theme === "dark" ? "bg-purple-950/60 text-purple-400 group-hover:bg-purple-900 group-hover:text-white" : "bg-purple-50 text-purple-900 group-hover:bg-purple-900 group-hover:text-white"
                  }`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Foydalanuvchilar va rollar</h4>
                  <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    Kafedra mudirlari, dotsentlar va assistentlarning rollari.
                  </p>
                </div>

                <div
                  onClick={() => setActivePage("admin_logs")}
                  className={`p-5 rounded-xl border shadow-sm hover:shadow transition-all cursor-pointer group ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-800 hover:border-amber-700 text-slate-100"
                      : "bg-white border-slate-200 hover:border-blue-900/50 text-slate-900"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                    theme === "dark" ? "bg-amber-950/60 text-amber-400 group-hover:bg-amber-900 group-hover:text-white" : "bg-amber-50 text-amber-900 group-hover:bg-amber-900 group-hover:text-white"
                  }`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Audit va xavfsizlik jurnali</h4>
                  <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    Tizimda amalga oshirilgan barcha xatti-harakatlar qaydnomasi.
                  </p>
                </div>
              </div>

              {/* Submissions Overview Table for Admin */}
              <div className={`rounded-xl border shadow-sm p-6 ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Barcha tushgan arizalar monitoringi</h3>
                    <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Ekspertlar va kafedra mudirlari tomonidan koʻrib chiqilishi holati</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    theme === "dark" ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                  }`}>
                    Jami: {submissions.length} ta
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className={`border-b text-xs font-bold uppercase ${
                      theme === "dark" ? "bg-slate-900/90 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Ariza ID</th>
                        <th className="py-3 px-4">Oʻqituvchi</th>
                        <th className="py-3 px-4">Kodi</th>
                        <th className="py-3 px-4">Natija sarlavhasi</th>
                        <th className="py-3 px-4">Sana</th>
                        <th className="py-3 px-4">Ball</th>
                        <th className="py-3 px-4">Holati</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === "dark" ? "divide-slate-800" : "divide-slate-100"}`}>
                      {submissions.map((sub) => (
                        <tr key={sub.id} className={`transition-colors ${theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}>
                          <td className="py-3 px-4 font-mono text-xs text-slate-400">#{sub.id}</td>
                          <td className={`py-3 px-4 font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{sub.teacher_name}</td>
                          <td className={`py-3 px-4 font-mono text-xs font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-900"}`}>{sub.indicator_id}</td>
                          <td className={`py-3 px-4 max-w-xs truncate ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>{sub.title}</td>
                          <td className={`py-3 px-4 text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>{sub.submitted_date}</td>
                          <td className={`py-3 px-4 font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{sub.ball} ball</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              sub.status === "approved"
                                ? theme === "dark" ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : sub.status === "pending"
                                ? theme === "dark" ? "bg-amber-950/60 text-amber-300 border-amber-800" : "bg-amber-50 text-amber-800 border-amber-200"
                                : theme === "dark" ? "bg-rose-950/60 text-rose-300 border-rose-800" : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}>
                              {sub.status === "approved" ? "Tasdiqlangan" : sub.status === "pending" ? "Kutilmoqda" : "Rad etilgan"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADMIN VIEW: SYSTEM SETTINGS */}
          {/* ========================================================================= */}
          {activePage === "admin_settings" && (
            <div className={`max-w-3xl rounded-xl border shadow-sm p-6 ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
            }`}>
              <div className={`border-b pb-4 mb-6 flex justify-between items-center ${
                theme === "dark" ? "border-slate-800" : "border-slate-100"
              }`}>
                <div>
                  <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Tizim konfiguratsiyasi</h3>
                  <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>KPI maʼlumotlarini kiritish davri va byudjet chegaralari</p>
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  theme === "dark" ? "bg-blue-950/60 text-blue-400" : "bg-blue-50 text-blue-900"
                }`}>
                  <Settings className="w-5 h-5" />
                </div>
              </div>

              {settingsSaveSuccess && (
                <div className={`mb-6 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  theme === "dark" ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800"
                }`}>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Sozlamalar muvaffaqiyatli saqlandi va tizimda qoʻllanildi.</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}>
                    Oʻquv yili
                  </label>
                  <input
                    type="text"
                    required
                    value={systemSettings.academic_year}
                    onChange={(e) => setSystemSettings({ ...systemSettings, academic_year: e.target.value })}
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                      theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                    }`}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Filial rasmiy meʼyoriy hujjatlarida aks etadigan oʻquv yili</p>
                </div>

                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  theme === "dark" ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"
                }`}>
                  <div>
                    <div className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Arizalar va hujjatlar qabuli</div>
                    <div className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Oʻchirilganda professor-oʻqituvchilar yangi faoliyat natijalarini kiritishi toʻxtatiladi
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.submissions_open}
                      onChange={(e) => setSystemSettings({ ...systemSettings, submissions_open: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900 ${
                      theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                    }`}></div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}>
                      Qabulning oxirgi muddati (Deadline)
                    </label>
                    <input
                      type="date"
                      required
                      value={systemSettings.deadline_date}
                      onChange={(e) => setSystemSettings({ ...systemSettings, deadline_date: e.target.value })}
                      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}>
                      Oylik ragʻbatlantirish byudjet limiti (soʻmda)
                    </label>
                    <input
                      type="number"
                      required
                      step="1000000"
                      value={systemSettings.budget_cap_monthly}
                      onChange={(e) => setSystemSettings({ ...systemSettings, budget_cap_monthly: Number(e.target.value) })}
                      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingSettings ? "Saqlanmoqda..." : "Sozlamalarni saqlash"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADMIN VIEW: INDICATOR MANAGEMENT (CRUD) */}
          {/* ========================================================================= */}
          {activePage === "admin_indicators" && (
            <div className="space-y-6">
              {/* Header and Action */}
              <div className={`rounded-xl border shadow-sm p-6 ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className={`flex justify-between items-start pb-4 border-b mb-4 ${
                  theme === "dark" ? "border-slate-800" : "border-slate-100"
                }`}>
                  <div>
                    <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      KPI Baholash Mezonlari Dinamik Boshqaruvi (CRUD)
                    </h3>
                    <p className={`text-xs mt-0.5 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      OTM Ilmiy kengashi nizomiga muvofiq mezonlarni tahrirlash, yangi indikator kiritish va arxivlash
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingIndicator(null);
                      setIndFormId("");
                      setIndFormName("");
                      setIndFormBlock("ILM");
                      setIndFormMaxBall(10);
                      setIndFormValidity("1 oʻquv yili");
                      setIndFormDept("Ilmiy-tadqiqotlar boʻlimi");
                      setIndFormError("");
                      setIsAddIndicatorModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yangi baholash mezoni qoʻshish</span>
                  </button>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 text-xs">
                  <span className={`font-semibold mr-2 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Bloklar boʻyicha:</span>
                  {[
                    { id: "ALL", label: "Barcha mezonlar" },
                    { id: "OQV", label: "Oʻquv-uslubiy (1.x)" },
                    { id: "ILM", label: "Ilmiy-tadqiqot (2.x)" },
                    { id: "XAL", label: "Xalqaro hamkorlik (3.x)" },
                    { id: "MAN", label: "Maʼnaviy-maʼrifiy (4.x)" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedBlockFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        selectedBlockFilter === tab.id
                          ? "bg-blue-900 text-white shadow-sm"
                          : theme === "dark"
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicators Table */}
              <div className={`rounded-xl border shadow-sm p-6 ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className={`border-b text-xs font-bold uppercase ${
                      theme === "dark" ? "bg-slate-900/90 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Kodi</th>
                        <th className="py-3 px-4">Bloki</th>
                        <th className="py-3 px-4">Mezon nomi va tavsifi</th>
                        <th className="py-3 px-4">Maksimal ball</th>
                        <th className="py-3 px-4">Masʼul boʻlim</th>
                        <th className="py-3 px-4">Holati</th>
                        <th className="py-3 px-4 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === "dark" ? "divide-slate-800" : "divide-slate-100"}`}>
                      {indicators
                        .filter(i => selectedBlockFilter === "ALL" || i.block === selectedBlockFilter)
                        .slice((indicatorsPage - 1) * indicatorsPerPage, indicatorsPage * indicatorsPerPage)
                        .map((ind) => (
                          <tr key={ind.id} className={`transition-colors ${theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}>
                            <td className={`py-3.5 px-4 font-mono font-bold text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-900"}`}>
                              {ind.id}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                ind.block === "ILM"
                                  ? theme === "dark" ? "bg-purple-950/60 text-purple-300 border-purple-800" : "bg-purple-50 text-purple-800 border-purple-200"
                                  : ind.block === "OQV"
                                  ? theme === "dark" ? "bg-blue-950/60 text-blue-300 border-blue-800" : "bg-blue-50 text-blue-800 border-blue-100"
                                  : ind.block === "XAL"
                                  ? theme === "dark" ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : theme === "dark" ? "bg-amber-950/60 text-amber-300 border-amber-800" : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}>
                                {ind.block}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-md">
                              <div className={`font-semibold text-xs leading-snug ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{ind.name}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Yaroqlilik: {ind.validity}</div>
                            </td>
                            <td className={`py-3.5 px-4 font-bold text-xs ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                              {ind.max_ball} ball
                            </td>
                            <td className={`py-3.5 px-4 text-xs ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                              {ind.dept}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                ind.is_active !== false
                                  ? theme === "dark" ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : theme === "dark" ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}>
                                {ind.is_active !== false ? "Faol" : "Arxivlangan"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingIndicator(ind);
                                    setIndFormId(ind.id);
                                    setIndFormName(ind.name);
                                    setIndFormBlock(ind.block);
                                    setIndFormMaxBall(ind.max_ball);
                                    setIndFormValidity(ind.validity);
                                    setIndFormDept(ind.dept);
                                    setIndFormError("");
                                    setIsAddIndicatorModalOpen(true);
                                  }}
                                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                    theme === "dark" ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  Tahrirlash
                                </button>
                                <button
                                  onClick={() => handleDeleteIndicator(ind.id)}
                                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                                    theme === "dark" ? "bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-800" : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                                  }`}
                                >
                                  Arxivlash
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {/* Pagination Bar for Indicators */}
                  {(() => {
                    const blockFiltered = indicators.filter(i => selectedBlockFilter === "ALL" || i.block === selectedBlockFilter);
                    const totalPages = Math.ceil(blockFiltered.length / indicatorsPerPage) || 1;
                    const safePage = Math.max(1, Math.min(indicatorsPage, totalPages));
                    return (
                      <div className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs mt-2 ${
                        theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}>
                        <div className="flex items-center gap-2">
                          <span>
                            Jami <b>{blockFiltered.length}</b> mezondan <b>{blockFiltered.length > 0 ? (safePage - 1) * indicatorsPerPage + 1 : 0}</b> - <b>{Math.min(safePage * indicatorsPerPage, blockFiltered.length)}</b> koʻrsatilmoqda
                          </span>
                          <span className={theme === "dark" ? "text-slate-700" : "text-slate-300"}>|</span>
                          <div className="flex items-center gap-1.5">
                            <span>Sahifada:</span>
                            <select
                              value={indicatorsPerPage}
                              onChange={(e) => {
                                setIndicatorsPerPage(Number(e.target.value));
                                setIndicatorsPage(1);
                              }}
                              className={`border rounded px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-blue-900 ${
                                theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                              }`}
                            >
                              <option value={10}>10 ta</option>
                              <option value={20}>20 ta</option>
                              <option value={40}>40 ta</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setIndicatorsPage(prev => Math.max(1, prev - 1))}
                            disabled={safePage <= 1}
                            className={`px-2.5 py-1.5 rounded border disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors ${
                              theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Oldingi</span>
                          </button>

                          <div className="flex items-center gap-1 px-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                              <button
                                key={p}
                                onClick={() => setIndicatorsPage(p)}
                                className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                                  safePage === p
                                    ? "bg-blue-900 text-white"
                                    : theme === "dark"
                                    ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => setIndicatorsPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={safePage >= totalPages}
                            className={`px-2.5 py-1.5 rounded border disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors ${
                              theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <span>Keyingi</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADMIN VIEW: USER & ROLE MANAGEMENT */}
          {/* ========================================================================= */}
          {activePage === "admin_users" && (
            <div className="space-y-6">
              {/* Notification Banner */}
              {userActionMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{userActionMessage}</span>
                </div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold uppercase text-slate-500">Jami hisoblar</span>
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    {adminUsersStats.total || adminUsers.length} ta
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Barcha faol tizim foydalanuvchilari</div>
                </div>

                <div className={`p-4 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[11px] font-bold uppercase ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}>Oʻqituvchilar</span>
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className={`text-2xl font-black ${theme === "dark" ? "text-blue-400" : "text-blue-900"}`}>
                    {adminUsersStats.teacher} nafar
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">TEACHER roli biriktirilgan</div>
                </div>

                <div className={`p-4 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[11px] font-bold uppercase ${theme === "dark" ? "text-sky-400" : "text-sky-700"}`}>Kafedra mudirlari</span>
                    <Building className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className={`text-2xl font-black ${theme === "dark" ? "text-sky-400" : "text-sky-900"}`}>
                    {adminUsersStats.head_of_dept} nafar
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">HEAD_OF_DEPT tasdiqlovchi roli</div>
                </div>

                <div className={`p-4 rounded-xl border shadow-sm ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[11px] font-bold uppercase ${theme === "dark" ? "text-purple-400" : "text-purple-700"}`}>Rahbariyat & Admin</span>
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className={`text-2xl font-black ${theme === "dark" ? "text-purple-400" : "text-purple-900"}`}>
                    {adminUsersStats.rectorate + adminUsersStats.admin} nafar
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">RECTORATE va ADMIN rollari</div>
                </div>
              </div>

              {/* Users Registry Card */}
              <div className={`rounded-xl border shadow-sm p-6 ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className={`flex justify-between items-center pb-4 border-b mb-5 ${
                  theme === "dark" ? "border-slate-800" : "border-slate-100"
                }`}>
                  <div>
                    <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Foydalanuvchilar va rollar boshqaruvi</h3>
                    <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Rollar taqsimoti, parollarni tiklash va xodimlar hisoblarini boshqarish
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminUsersSearchText}
                        onChange={(e) => {
                          setAdminUsersSearchText(e.target.value);
                          fetch(`${API_BASE}/admin/users?q=${encodeURIComponent(e.target.value)}&role=${adminUsersFilterRole}`)
                            .then(r => r.json())
                            .then(d => { if (d.items) setAdminUsers(d.items); });
                        }}
                        placeholder="F.I.Sh., login yoki kafedra..."
                        className={`pl-8 pr-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 w-60 ${
                          theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Role Tabs */}
                <div className="flex items-center gap-2 mb-4 text-xs">
                  <span className={`font-semibold mr-2 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Roli boʻyicha filter:</span>
                  {[
                    { id: "ALL", label: "Barchasi" },
                    { id: "TEACHER", label: "Oʻqituvchilar" },
                    { id: "HEAD_OF_DEPT", label: "Kafedra mudirlari" },
                    { id: "RECTORATE", label: "Rektorat" },
                    { id: "ADMIN", label: "Administratorlar" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setAdminUsersFilterRole(tab.id);
                        fetch(`${API_BASE}/admin/users?q=${encodeURIComponent(adminUsersSearchText)}&role=${tab.id}`)
                          .then(r => r.json())
                          .then(d => { if (d.items) setAdminUsers(d.items); });
                      }}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        adminUsersFilterRole === tab.id
                          ? "bg-blue-900 text-white shadow-sm"
                          : theme === "dark"
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className={`border-b text-xs font-bold uppercase ${
                      theme === "dark" ? "bg-slate-900/90 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Login (HEMIS ID)</th>
                        <th className="py-3 px-4">F.I.Sh.</th>
                        <th className="py-3 px-4">Kafedrasi va lavozimi</th>
                        <th className="py-3 px-4">Pedagogik shtati</th>
                        <th className="py-3 px-4">Biriktirilgan roli</th>
                        <th className="py-3 px-4">Holati</th>
                        <th className="py-3 px-4 text-right">Boshqaruv amallari</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === "dark" ? "divide-slate-800" : "divide-slate-100"}`}>
                      {pagedAdminUsers.map((u) => (
                        <tr key={u.username} className={`transition-colors ${theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}>
                          <td className={`py-3 px-4 font-mono text-xs font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-900"}`}>
                            {u.username}
                          </td>
                          <td className="py-3 px-4">
                            <div className={`font-semibold text-xs leading-snug ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{u.name}</div>
                            {u.must_change_password ? (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${
                                theme === "dark" ? "bg-amber-950/60 text-amber-300 border-amber-800" : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                Birlamchi parolda
                              </span>
                            ) : (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${
                                theme === "dark" ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}>
                                Paroli yangilangan
                              </span>
                            )}
                          </td>
                          <td className={`py-3 px-4 text-xs max-w-xs ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                            <div className={`font-medium ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>{u.position || "—"}</div>
                            <div className="text-[11px] text-slate-400">{u.department || "—"}</div>
                          </td>
                          <td className={`py-3 px-4 font-bold text-xs ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                            {u.fte} stavka
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateUserRole(u.username, e.target.value)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer shadow-sm ${
                                theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"
                              }`}
                            >
                              <option value="TEACHER">TEACHER (Oʻqituvchi)</option>
                              <option value="HEAD_OF_DEPT">HEAD_OF_DEPT (Kafedra mudiri)</option>
                              <option value="RECTORATE">RECTORATE (Rektorat/Ekspert)</option>
                              <option value="ADMIN">ADMIN (Bosh administrator)</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              u.is_active !== false
                                ? theme === "dark" ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : theme === "dark" ? "bg-rose-950/60 text-rose-300 border-rose-800" : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}>
                              {u.is_active !== false ? "Faol" : "Bloklangan"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleResetUserPassword(u.username)}
                                title="Parolni birlamchi HEMIS ID raqamiga qaytarish"
                                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                                  theme === "dark" ? "bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-800" : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                                }`}
                              >
                                Parolni tiklash
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(u.username)}
                                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                                  u.is_active !== false
                                    ? theme === "dark" ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700" : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                                    : theme === "dark" ? "bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-800" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                                }`}
                              >
                                {u.is_active !== false ? "Bloklash" : "Faollashtirish"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Bar for Admin Users */}
                  <div className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs mt-2 ${
                    theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>
                        Jami <b>{adminUsers.length}</b> nafardan <b>{adminUsers.length > 0 ? (currentSafeAdminUsersPage - 1) * adminUsersPerPage + 1 : 0}</b> - <b>{Math.min(currentSafeAdminUsersPage * adminUsersPerPage, adminUsers.length)}</b> koʻrsatilmoqda
                      </span>
                      <span className={theme === "dark" ? "text-slate-700" : "text-slate-300"}>|</span>
                      <div className="flex items-center gap-1.5">
                        <span>Sahifada:</span>
                        <select
                          value={adminUsersPerPage}
                          onChange={(e) => {
                            setAdminUsersPerPage(Number(e.target.value));
                            setAdminUsersPage(1);
                          }}
                          className={`border rounded px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-blue-900 ${
                            theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                          }`}
                        >
                          <option value={15}>15 ta</option>
                          <option value={30}>30 ta</option>
                          <option value={50}>50 ta</option>
                          <option value={100}>100 ta</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setAdminUsersPage(prev => Math.max(1, prev - 1))}
                        disabled={currentSafeAdminUsersPage <= 1}
                        className={`px-2.5 py-1.5 rounded border disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors ${
                          theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Oldingi</span>
                      </button>

                      <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: totalAdminUsersPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === totalAdminUsersPages || Math.abs(p - currentSafeAdminUsersPage) <= 1)
                          .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                              {idx > 0 && arr[idx - 1] !== p - 1 && (
                                <span className="px-1 text-slate-400">...</span>
                              )}
                              <button
                                onClick={() => setAdminUsersPage(p)}
                                className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                                  currentSafeAdminUsersPage === p
                                    ? "bg-blue-900 text-white"
                                    : theme === "dark"
                                    ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          ))}
                      </div>

                      <button
                        onClick={() => setAdminUsersPage(prev => Math.min(totalAdminUsersPages, prev + 1))}
                        disabled={currentSafeAdminUsersPage >= totalAdminUsersPages}
                        className={`px-2.5 py-1.5 rounded border disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors ${
                          theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span>Keyingi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Indicator Add/Edit Modal */}
          {isAddIndicatorModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className={`rounded-2xl border shadow-2xl max-w-lg w-full p-6 animate-in fade-in duration-150 ${
                theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className={`flex justify-between items-center pb-3 border-b mb-4 ${
                  theme === "dark" ? "border-slate-800" : "border-slate-100"
                }`}>
                  <h4 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    {editingIndicator ? "Baholash Mezonini Tahrirlash" : "Yangi Baholash Mezoni Kiritish"}
                  </h4>
                  <button
                    onClick={() => { setIsAddIndicatorModalOpen(false); setEditingIndicator(null); }}
                    className={`p-1 rounded-lg ${theme === "dark" ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {indFormError && (
                  <div className={`mb-4 p-3 rounded-lg text-xs font-medium border ${
                    theme === "dark" ? "bg-rose-950/60 border-rose-800 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}>
                    {indFormError}
                  </div>
                )}

                <form onSubmit={handleSaveIndicator} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                        Mezon kodi (ID)
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!!editingIndicator}
                        value={indFormId}
                        onChange={(e) => setIndFormId(e.target.value)}
                        placeholder="Masalan: 2.7 yoki 1.9"
                        className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:opacity-60 ${
                          theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 disabled:bg-slate-800/40" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                        Mansub bloki
                      </label>
                      <select
                        value={indFormBlock}
                        onChange={(e) => setIndFormBlock(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                          theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      >
                        <option value="ILM">ILM (Ilmiy-tadqiqot)</option>
                        <option value="OQV">OQV (Oʻquv-uslubiy)</option>
                        <option value="XAL">XAL (Xalqaro hamkorlik)</option>
                        <option value="MAN">MAN (Maʼnaviy-maʼrifiy)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                      Mezonning toʻliq rasmiy nomi
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={indFormName}
                      onChange={(e) => setIndFormName(e.target.value)}
                      placeholder="Mezonning aniq meʼyoriy matnini kiriting..."
                      className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                        Maksimal ball
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={indFormMaxBall}
                        onChange={(e) => setIndFormMaxBall(Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                          theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                        Yaroqlilik davri
                      </label>
                      <input
                        type="text"
                        value={indFormValidity}
                        onChange={(e) => setIndFormValidity(e.target.value)}
                        placeholder="Masalan: 1 oʻquv yili"
                        className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                          theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                      Masʼul ekspertiza boʻlimi
                    </label>
                    <input
                      type="text"
                      required
                      value={indFormDept}
                      onChange={(e) => setIndFormDept(e.target.value)}
                      placeholder="Masalan: Ilmiy-tadqiqotlar boʻlimi"
                      className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>

                  <div className={`pt-3 flex justify-end gap-2 border-t ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
                    <button
                      type="button"
                      onClick={() => { setIsAddIndicatorModalOpen(false); setEditingIndicator(null); }}
                      className={`px-4 py-2 border rounded-lg text-xs font-semibold transition-colors ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "border-slate-300 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                    >
                      {editingIndicator ? "Oʻzgarishlarni saqlash" : "Mezonni saqlash"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* USER PROFILE & PASSWORD CHANGE MODAL */}
          {isProfileModalOpen && currentUser && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className={`rounded-2xl border shadow-2xl max-w-lg w-full p-6 animate-in fade-in duration-150 ${
                theme === "dark" ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                      <UserCog className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold leading-tight">Shaxsiy profil va xavfsizlik</h4>
                      <p className="text-xs text-slate-400">Xodim maʼlumotlari va maxfiy parolni boshqarish</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setProfPasswordError("");
                      setProfPasswordSuccess("");
                      setProfCurrentPassword("");
                      setProfNewPassword("");
                      setProfConfirmPassword("");
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Employee Info Card */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 mb-5">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                    <div className="w-12 h-12 rounded-xl bg-blue-900 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{currentUser.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        HEMIS ID (Login): <b className="text-blue-600 dark:text-blue-400">{currentUser.username}</b>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Kafedrasi:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.department || "Kafedra koʻrsatilmagan"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Lavozimi:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.position || "Professor-oʻqituvchi"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Ilmiy darajasi:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.degree || "Darajasiz"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Pedagogik stavka:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.fte || 1.0} stavka</span>
                    </div>
                  </div>
                </div>

                {/* Password Change Form */}
                <div className="border-t border-slate-200/60 dark:border-slate-800 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Maxfiy parolni yangilash
                    </h5>
                  </div>

                  {profPasswordError && (
                    <div className="mb-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{profPasswordError}</span>
                    </div>
                  )}

                  {profPasswordSuccess && (
                    <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                      <span>{profPasswordSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfilePassword} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Joriy maxfiy parol
                      </label>
                      <input
                        type="password"
                        required
                        value={profCurrentPassword}
                        onChange={(e) => setProfCurrentPassword(e.target.value)}
                        placeholder="Hozirgi parolingizni kiriting"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Yangi parol
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowProfNewPassword(!showProfNewPassword)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {showProfNewPassword ? "Yashirish" : "Koʻrish"}
                          </button>
                        </div>
                        <input
                          type={showProfNewPassword ? "text" : "password"}
                          required
                          value={profNewPassword}
                          onChange={(e) => setProfNewPassword(e.target.value)}
                          placeholder="Kamida 6 belgi"
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tasdiqlash
                        </label>
                        <input
                          type="password"
                          required
                          value={profConfirmPassword}
                          onChange={(e) => setProfConfirmPassword(e.target.value)}
                          placeholder="Parolni qayta tering"
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileModalOpen(false);
                          setProfPasswordError("");
                          setProfPasswordSuccess("");
                        }}
                        className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        Yopish
                      </button>
                      <button
                        type="submit"
                        disabled={isProfPasswordSaving}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{isProfPasswordSaving ? "Saqlanmoqda..." : "Yangi parolni saqlash"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADMIN VIEW: AUDIT LOGS */}
          {/* ========================================================================= */}
          {activePage === "admin_logs" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Audit va xavfsizlik jurnali</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tizimda sodir boʻlgan barcha muhim harakatlar qaydnomasi</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/50 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Qayd ID</th>
                      <th className="py-3 px-4">Vaqti</th>
                      <th className="py-3 px-4">Masʼul foydalanuvchi</th>
                      <th className="py-3 px-4">Bajarilgan amal tavsifi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {adminLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-slate-400 dark:text-slate-500">#{log.id}</td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">{log.time}</td>
                        <td className="py-3 px-4 font-semibold text-blue-900 dark:text-blue-400">@{log.user}</td>
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{log.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GENERAL VIEWS: TEACHER / HEAD OF DEPT / RECTORATE DASHBOARD */}
          {/* ========================================================================= */}
          {activePage === "dashboard" && activeRole !== "ADMIN" && (
            <div>
              {/* Svetafor Banner */}
              <div className="grid grid-cols-3 gap-5 mb-7">
                <div
                  onClick={() => setActiveSvetaforFilter(activeSvetaforFilter === "green" ? "ALL" : "green")}
                  className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm transition-all cursor-pointer ${
                    activeSvetaforFilter === "green"
                      ? "ring-2 ring-emerald-500 border-slate-200 dark:border-slate-700"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  } border-l-4 border-l-emerald-600`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Yashil toifa (71 – 100 ball)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                    {greenTeachers.length} nafar ({greenPct}%)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">70% dan 100% gacha oylik ustama toʻlanadi</div>
                </div>

                <div
                  onClick={() => setActiveSvetaforFilter(activeSvetaforFilter === "yellow" ? "ALL" : "yellow")}
                  className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm transition-all cursor-pointer ${
                    activeSvetaforFilter === "yellow"
                      ? "ring-2 ring-amber-500 border-slate-200 dark:border-slate-700"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  } border-l-4 border-l-amber-500`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Sariq toifa (40 – 70 ball)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                    {yellowTeachers.length} nafar ({yellowPct}%)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">40% ustama yoki bir martalik mukofot</div>
                </div>

                <div
                  onClick={() => setActiveSvetaforFilter(activeSvetaforFilter === "red" ? "ALL" : "red")}
                  className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm transition-all cursor-pointer ${
                    activeSvetaforFilter === "red"
                      ? "ring-2 ring-rose-500 border-slate-200 dark:border-slate-700"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  } border-l-4 border-l-rose-500`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">Qizil toifa (40 balldan past)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                    {redTeachers.length} nafar ({redPct}%)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ustama belgilanmaydi (tanqidiy tahlil)</div>
                </div>
              </div>

              {/* TEACHER ROLE VIEW */}
              {activeRole === "TEACHER" && currentTeacher && (
                <div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-7">
                    <div className="flex justify-between items-start pb-5 border-b border-slate-100 dark:border-slate-800 mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{currentTeacher.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                            {currentTeacher.department}
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {currentTeacher.position}
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Shtat: <b>{currentTeacher.fte}</b>
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Traektoriya: <b>{currentTeacher.track}</b>
                          </span>
                          {currentTeacher.is_first_year && (
                            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                              Moslashuv davridagi yosh mutaxassis
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-none">
                            {currentTeacher.scores.normalized_score}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">100 ball meʼyoridan</div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          currentTeacher.scores.svetafor_zone === "green"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : currentTeacher.scores.svetafor_zone === "yellow"
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        }`}>
                          {currentTeacher.scores.svetafor_label}
                        </div>
                      </div>
                    </div>

                    {/* Tier bar */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 mb-5 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <span>Toʻplangan ball: <b>{currentTeacher.scores.normalized_score} ball</b></span>
                        <span>Belgilangan ustama: <b>{currentTeacher.scores.bonus_label}</b></span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            currentTeacher.scores.svetafor_zone === "green" ? "bg-emerald-500" : currentTeacher.scores.svetafor_zone === "yellow" ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, currentTeacher.scores.normalized_score)}%` }}
                        />
                      </div>
                    </div>

                    {/* 4 Blocks */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">I. Oʻquv-metodik</div>
                        <div className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">{currentTeacher.scores.oqv} <span className="text-xs font-medium text-slate-400 dark:text-slate-500">/ 30 ball</span></div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-900 dark:bg-blue-600 rounded-full" style={{ width: `${(currentTeacher.scores.oqv / 30) * 100}%` }} />
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">II. Ilmiy-tadqiqot</div>
                        <div className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">{currentTeacher.scores.ilm} <span className="text-xs font-medium text-slate-400 dark:text-slate-500">/ 40 ball</span></div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-900 dark:bg-blue-600 rounded-full" style={{ width: `${(currentTeacher.scores.ilm / 40) * 100}%` }} />
                        </div>
                        {currentTeacher.scores.flex_applied > 0 && (
                          <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 mt-2">
                            Flex: Maʼnaviyat blokiga +{currentTeacher.scores.flex_applied} ball oʻtkazildi
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">III. Xalqaro hamkorlik</div>
                        <div className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">{currentTeacher.scores.xal} <span className="text-xs font-medium text-slate-400 dark:text-slate-500">/ 20 ball</span></div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-900 dark:bg-blue-600 rounded-full" style={{ width: `${(currentTeacher.scores.xal / 20) * 100}%` }} />
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">IV. Maʼnaviy va bandlik</div>
                        <div className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">{currentTeacher.scores.man} <span className="text-xs font-medium text-slate-400 dark:text-slate-500">/ 10 ball</span></div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-900 dark:bg-blue-600 rounded-full" style={{ width: `${(currentTeacher.scores.man / 10) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submissions Open / Closed Notice */}
                  {!systemSettings.submissions_open && (
                    <div className="mb-5 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-500" />
                      <div>
                        <b>Hujjatlar qabuli vaqtincha toʻxtatilgan:</b> Tizim konfiguratsiyasiga binoan joriy baholash davri uchun qabul muddati ({systemSettings.deadline_date}) yakunlangan yoki yopilgan. Faqat avval topshirilgan arizalar holatini koʻrishingiz mumkin.
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Yuklangan faoliyat natijalari va verifikatsiya holati</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Oʻzingiz daʻvo qilgan ballar hamda ekspert komissiyasi tomonidan tasdiqlangan baholar</p>
                    </div>

                    <button
                      onClick={() => {
                        if (!systemSettings.submissions_open) {
                          alert(`Hujjatlar qabuli yopiq. Oxirgi muddat: ${systemSettings.deadline_date}`);
                          return;
                        }
                        const firstInd = indicators[0] || { id: "1.1", max_ball: 6 };
                        setModalIndicator(firstInd.id);
                        setModalClaimedBall(firstInd.max_ball);
                        setModalTitle("");
                        setModalDescription("");
                        setIsAddModalOpen(true);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 ${
                        systemSettings.submissions_open
                          ? "bg-blue-900 hover:bg-blue-800 text-white cursor-pointer"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                      }`}
                      title={systemSettings.submissions_open ? "Yangi KPI natijasini kiritish" : "Qabul yopilgan"}
                    >
                      <span>+ Yangi natija kiritish</span>
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Kodi</th>
                          <th className="py-3 px-4">Hujjat va natija nomi</th>
                          <th className="py-3 px-4">Sana</th>
                          <th className="py-3 px-4">Oʻqituvchi daʻvosi</th>
                          <th className="py-3 px-4">Tasdiqlangan ball</th>
                          <th className="py-3 px-4">Holati va xulosa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {submissions.filter(s => s.teacher_id === currentTeacher.id).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                              Hozircha yuklangan KPI natijalari mavjud emas. Yuqoridagi "+ Yangi natija kiritish" tugmasi orqali ariza topshiring.
                            </td>
                          </tr>
                        ) : (
                          submissions.filter(s => s.teacher_id === currentTeacher.id).map(sub => (
                            <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                                {sub.indicator_id}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{sub.title}</div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                                  <span>{sub.file_name}</span>
                                  {sub.authors_count > 1 && (
                                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      {sub.authors_count} nafar muallif
                                    </span>
                                  )}
                                </div>
                                {sub.description && (
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                                    "{sub.description}"
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">{sub.submitted_date}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                                {sub.claimed_ball ?? sub.ball} ball
                              </td>
                              <td className="py-3.5 px-4">
                                {sub.status === "approved" ? (
                                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                                    {sub.ball} ball
                                  </span>
                                ) : sub.status === "rejected" ? (
                                  <span className="font-black text-rose-600 dark:text-rose-400">
                                    0 ball
                                  </span>
                                ) : (
                                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                                    Kutilmoqda
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 max-w-xs">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  sub.status === "approved"
                                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                    : sub.status === "pending"
                                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                }`}>
                                  {sub.status === "approved" ? "Tasdiqlangan" : sub.status === "pending" ? "Koʻrib chiqilmoqda" : "Rad etilgan"}
                                </span>

                                {sub.status === "approved" && (
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    Masʼul: <b>{sub.reviewer_name || "Ekspert komissiyasi"}</b>
                                    {sub.reviewer_comment && <div className="italic">"{sub.reviewer_comment}"</div>}
                                  </div>
                                )}

                                {sub.status === "rejected" && (
                                  <div className="mt-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-700 dark:text-rose-300">
                                    <div className="font-bold">Rad etish sababi:</div>
                                    <div className="mt-0.5 leading-tight">{sub.rejection_reason || "Hujjat talablarga mos emas"}</div>
                                    <button
                                      onClick={() => {
                                        setActivePage("appeals");
                                        setAppealIndicator(sub.indicator_id);
                                        setAppealReason(`«${sub.title}» boʻyicha rad etilgan qarorga eʼtiroz: `);
                                      }}
                                      className="text-blue-600 dark:text-blue-400 font-semibold underline mt-1.5 inline-block hover:text-blue-800"
                                    >
                                      Apellyatsiya arizasi berish →
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* HEAD OF DEPT ROLE VIEW */}
              {activeRole === "HEAD_OF_DEPT" && (
                <div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-7">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                            Kafedra boshqaruvi
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {currentUser?.faculty || "Fakultet"}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {currentUser?.department || "Amaliy matematika"} kafedrasi
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          Kafedra mudiri: <b className="text-slate-700 dark:text-slate-300">{currentUser?.name || "Kafedra mudiri"}</b> ({currentUser?.fte || 1.5} stavka)
                        </p>
                      </div>
                      <div className="px-3.5 py-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-300 border border-sky-200 dark:border-sky-900/50 text-xs font-semibold flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-sky-700 dark:text-sky-400 flex-shrink-0" />
                        <span>Manfaatlar toʻqnashuvi nazorati: Mudir oʻz arizasini baholashi taqiqlangan</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                      Kafedra aʼzolarining tasdiqlash kutilayotgan arizalari (Ekspert tekshiruvi)
                    </h4>
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                          <tr>
                            <th className="py-3 px-4">Oʻqituvchi</th>
                            <th className="py-3 px-4">Mezon</th>
                            <th className="py-3 px-4">Natija nomi</th>
                            <th className="py-3 px-4">Daʻvo bali</th>
                            <th className="py-3 px-4">Asoslovchi hujjat</th>
                            <th className="py-3 px-4">Ekspertiza amallari</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {submissions.filter(s => s.status === "pending" && s.teacher_id !== currentTeacher?.id).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                                Hozirda tasdiqlash kutilayotgan arizalar mavjud emas
                              </td>
                            </tr>
                          ) : (
                            submissions.filter(s => s.status === "pending" && s.teacher_id !== currentTeacher?.id).map(sub => (
                              <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{sub.teacher_name}</td>
                                <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">{sub.indicator_id}</td>
                                <td className="py-3.5 px-4">
                                  <div className="text-slate-800 dark:text-slate-200 font-medium">{sub.title}</div>
                                  {sub.description && (
                                    <div className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">"{sub.description}"</div>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-blue-900 dark:text-blue-400">{sub.claimed_ball ?? sub.ball} ball</td>
                                <td className="py-3.5 px-4">
                                  <button
                                    onClick={() => alert(`PDF hujjat tekshirildi: ${sub.file_name}`)}
                                    className="text-xs text-blue-700 dark:text-blue-400 font-semibold underline flex items-center gap-1 hover:text-blue-900"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{sub.file_name}</span>
                                  </button>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => openVerifyModal(sub, "approved")}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                                      title="Arizani tekshirib, bahosini qoʻlda tasdiqlash"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Tasdiqlash & Baholash</span>
                                    </button>
                                    <button
                                      onClick={() => openVerifyModal(sub, "rejected")}
                                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                                      title="Rad etish (sababi majburiy)"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Rad etish</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Kafedra professor-oʻqituvchilarining faoliyat reytingi ({teachers.filter(t => !currentUser?.department || t.department.toLowerCase().includes(currentUser.department.toLowerCase()) || currentUser.department.toLowerCase().includes(t.department.toLowerCase())).length} nafar xodim)
                      </h4>
                      <div className="text-xs text-slate-500">
                        Formula: <b>Umumiy ball / Shtat stavkasi = Normallashtirilgan yakuniy ball</b>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                          <tr>
                            <th className="py-3 px-4">F.I.Sh.</th>
                            <th className="py-3 px-4">Lavozimi</th>
                            <th className="py-3 px-4">Shtat stavkasi</th>
                            <th className="py-3 px-4">Oʻquv (30)</th>
                            <th className="py-3 px-4">Ilmiy (40)</th>
                            <th className="py-3 px-4">Xalqaro (20)</th>
                            <th className="py-3 px-4">Maʼnaviy (10)</th>
                            <th className="py-3 px-4">Yakuniy ball</th>
                            <th className="py-3 px-4">Svetafor toifasi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {teachers
                            .filter(t => !currentUser?.department || t.department.toLowerCase().includes(currentUser.department.toLowerCase()) || currentUser.department.toLowerCase().includes(t.department.toLowerCase()))
                            .map(t => (
                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{t.name}</td>
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{t.position}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  t.fte >= 1.5
                                    ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                    : t.fte >= 1.0
                                    ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                }`}>
                                  {t.fte} stavka
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">{t.scores.oqv}</td>
                              <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">{t.scores.ilm}</td>
                              <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">{t.scores.xal}</td>
                              <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">{t.scores.man}</td>
                              <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">
                                {t.scores.normalized_score}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  t.scores.svetafor_zone === "green"
                                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                    : t.scores.svetafor_zone === "yellow"
                                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                }`}>
                                  {t.scores.svetafor_label}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-blue-900 dark:text-blue-400">{t.scores.bonus_label}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* DEAN ROLE VIEW */}
              {activeRole === "DEAN" && (
                <div className="space-y-6">
                  {/* Faculty Dean Banner */}
                  <div className={`p-6 rounded-2xl border transition-all ${
                    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                            Fakultet dekanati
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            Oʻzbekiston Milliy universiteti Jizzax filiali
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                          {currentUser?.faculty || "Fakultet dekanati"}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          Dekan: <b className="text-slate-800 dark:text-slate-200">{currentUser?.name || "Dekan"}</b> ({currentUser?.fte || 1.25} stavka)
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setActivePage("structure")}
                          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                        >
                          <Building className="w-4 h-4" />
                          <span>Tashkiliy ierarxiya daraxti</span>
                        </button>
                      </div>
                    </div>

                    {/* Faculty Overview Quick Stats */}
                    {(() => {
                      const facultyDepts = structureHierarchy?.faculties.find(f =>
                        currentUser?.faculty ? f.name.toLowerCase().includes(currentUser.faculty.toLowerCase()) : false
                      )?.departments || [];
                      const facultyTeachers = teachers.filter(t =>
                        !currentUser?.faculty || (t.department && facultyDepts.some(d => t.department.toLowerCase().includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(t.department.toLowerCase())))
                      );
                      const fte15Teachers = facultyTeachers.filter(t => t.fte >= 1.5);
                      const avgFacScore = facultyTeachers.length > 0
                        ? Math.round((facultyTeachers.reduce((acc, t) => acc + (t.scores?.normalized_score || 0), 0) / facultyTeachers.length) * 10) / 10
                        : 0;

                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                            <div className="text-xs text-slate-400 font-medium">Kafedralar</div>
                            <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                              {facultyDepts.length || 4} ta
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                            <div className="text-xs text-slate-400 font-medium">Fakultet xodimlari</div>
                            <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                              {facultyTeachers.length} nafar
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">1.50 stavkali pedagoglar</div>
                            <div className="text-xl font-black text-purple-700 dark:text-purple-300 mt-0.5">
                              {fte15Teachers.length} nafar
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Fakultet oʻrtacha bali</div>
                            <div className="text-xl font-black text-blue-800 dark:text-blue-300 mt-0.5">
                              {avgFacScore} ball
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Faculty Teachers Table with FTE Filter */}
                  <div className={`p-6 rounded-2xl border transition-all ${
                    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Fakultet pedagog xodimlari va ularning stavkalari
                        </h4>
                        <p className="text-xs text-slate-400">
                          Formula: Har bir oʻqituvchining yigʻgan balli shtat stavkasiga nisbatan meʼyorlashtiriladi
                        </p>
                      </div>

                      {/* FTE Filter Buttons */}
                      <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                        <button
                          onClick={() => setFteFilter("ALL")}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                            fteFilter === "ALL" ? "bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-300 shadow-xs" : "text-slate-500"
                          }`}
                        >
                          Barchasi
                        </button>
                        <button
                          onClick={() => setFteFilter("1.5")}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                            fteFilter === "1.5" ? "bg-purple-600 text-white shadow-xs" : "text-slate-500"
                          }`}
                        >
                          1.50 stavka
                        </button>
                        <button
                          onClick={() => setFteFilter("1.0")}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                            fteFilter === "1.0" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500"
                          }`}
                        >
                          1.00 stavka
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                          <tr>
                            <th className="py-3 px-4">F.I.Sh.</th>
                            <th className="py-3 px-4">Kafedrasi</th>
                            <th className="py-3 px-4">Lavozimi</th>
                            <th className="py-3 px-4">Shtat stavkasi</th>
                            <th className="py-3 px-4">Yakuniy ball</th>
                            <th className="py-3 px-4">Svetafor toifasi</th>
                            <th className="py-3 px-4">Belgilangan ustama</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {teachers
                            .filter(t => {
                              if (fteFilter === "1.5") return t.fte >= 1.5;
                              if (fteFilter === "1.0") return t.fte === 1.0;
                              return true;
                            })
                            .map(t => (
                              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{t.name}</td>
                                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">{t.department}</td>
                                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{t.position}</td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    t.fte >= 1.5
                                      ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                      : t.fte >= 1.0
                                      ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                  }`}>
                                    {t.fte} stavka
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">
                                  {t.scores?.normalized_score || 0}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    t.scores?.svetafor_zone === "green"
                                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                      : t.scores?.svetafor_zone === "yellow"
                                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                      : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                  }`}>
                                    {t.scores?.svetafor_label || "—"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-blue-900 dark:text-blue-400">
                                  {t.scores?.bonus_label || "0%"}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* RECTORATE ROLE VIEW */}
              {activeRole === "RECTORATE" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Filial umumiy KPI reytingi</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Barcha fakultetlar va kafedralar boʻyicha integratsiyalashgan jadval</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="F.I.Sh. yoki kafedrani qidirish..."
                          className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 w-64"
                        />
                      </div>
                      <a
                        href="http://localhost:8080/api/export/kpi-excel"
                        download
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                        title="KPI reyting natijalarini toʻliq formatlangan Excel (.xlsx) faylida yuklab olish"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                        <span>Excel (.xlsx) yuklab olish</span>
                      </a>
                      <a
                        href="http://localhost:8080/api/download/nizom"
                        className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Rasmiy qaror (Word)</span>
                      </a>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Oʻrni</th>
                          <th className="py-3 px-4">F.I.Sh.</th>
                          <th className="py-3 px-4">Kafedrasi</th>
                          <th className="py-3 px-4">Lavozimi</th>
                          <th className="py-3 px-4">Shtat</th>
                          <th className="py-3 px-4">Ball</th>
                          <th className="py-3 px-4">Svetafor toifasi</th>
                          <th className="py-3 px-4">Belgilangan ustama</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {pagedTeachers.map((t, idx) => (
                          <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-400 dark:text-slate-500">
                              #{(currentSafeTeacherPage - 1) * teacherPerPage + idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                              {t.name} {t.is_head_of_dept && <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-normal border border-blue-100 dark:border-blue-900/50">Mudir</span>}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{t.department}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{t.position}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{t.fte}</td>
                            <td className="py-3.5 px-4 font-black text-blue-950 dark:text-blue-300">{t.scores.normalized_score}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                t.scores.svetafor_zone === "green"
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  : t.scores.svetafor_zone === "yellow"
                                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              }`}>
                                {t.scores.svetafor_label}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{t.scores.bonus_label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Bar for Teachers */}
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>
                          Jami <b>{filteredTeachers.length}</b> nafardan <b>{filteredTeachers.length > 0 ? (currentSafeTeacherPage - 1) * teacherPerPage + 1 : 0}</b> - <b>{Math.min(currentSafeTeacherPage * teacherPerPage, filteredTeachers.length)}</b> koʻrsatilmoqda
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <div className="flex items-center gap-1.5">
                          <span>Sahifada:</span>
                          <select
                            value={teacherPerPage}
                            onChange={(e) => {
                              setTeacherPerPage(Number(e.target.value));
                              setTeacherPage(1);
                            }}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-900"
                          >
                            <option value={10}>10 ta</option>
                            <option value={25}>25 ta</option>
                            <option value={50}>50 ta</option>
                            <option value={100}>100 ta</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setTeacherPage(prev => Math.max(1, prev - 1))}
                          disabled={currentSafeTeacherPage <= 1}
                          className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Oldingi</span>
                        </button>

                        <div className="flex items-center gap-1 px-1">
                          {Array.from({ length: totalTeacherPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalTeacherPages || Math.abs(p - currentSafeTeacherPage) <= 1)
                            .map((p, idx, arr) => (
                              <React.Fragment key={p}>
                                {idx > 0 && arr[idx - 1] !== p - 1 && (
                                  <span className="px-1 text-slate-400 dark:text-slate-500">...</span>
                                )}
                                <button
                                  onClick={() => setTeacherPage(p)}
                                  className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                                    currentSafeTeacherPage === p
                                      ? "bg-blue-900 dark:bg-blue-600 text-white"
                                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  }`}
                                >
                                  {p}
                                </button>
                              </React.Fragment>
                            ))}
                        </div>

                        <button
                          onClick={() => setTeacherPage(prev => Math.min(totalTeacherPages, prev + 1))}
                          disabled={currentSafeTeacherPage >= totalTeacherPages}
                          className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors"
                        >
                          <span>Keyingi</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGE: ORGANIZATIONAL STRUCTURE HIERARCHY */}
          {/* ========================================================================= */}
          {activePage === "structure" && (
            <StructureHierarchyView
              theme={theme}
              userRole={activeRole}
              userFaculty={currentUser?.faculty}
              userDepartment={currentUser?.department}
              hierarchyData={structureHierarchy}
              onSelectDepartment={(deptName) => {
                setActivePage("dashboard");
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* PAGE: INDICATORS CATALOG */}
          {/* ========================================================================= */}
          {activePage === "indicators" && (
            <div>
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedBlockFilter("ALL")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    selectedBlockFilter === "ALL"
                      ? "bg-blue-900 dark:bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  Barcha mezonlar (41 ta)
                </button>
                <button
                  onClick={() => setSelectedBlockFilter("oqv")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    selectedBlockFilter === "oqv"
                      ? "bg-blue-900 dark:bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  I. Oʻquv-metodik (30 ball)
                </button>
                <button
                  onClick={() => setSelectedBlockFilter("ilm")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    selectedBlockFilter === "ilm"
                      ? "bg-blue-900 dark:bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  II. Ilmiy-innovatsion (40 ball)
                </button>
                <button
                  onClick={() => setSelectedBlockFilter("xal")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    selectedBlockFilter === "xal"
                      ? "bg-blue-900 dark:bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  III. Xalqaro hamkorlik (20 ball)
                </button>
                <button
                  onClick={() => setSelectedBlockFilter("man")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    selectedBlockFilter === "man"
                      ? "bg-blue-900 dark:bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  IV. Maʼnaviy va bandlik (10 ball)
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4 w-20">Kodi</th>
                      <th className="py-3 px-4">Faoliyat turi va koʻrsatkich mazmuni</th>
                      <th className="py-3 px-4 w-36">Amal qilish muddati</th>
                      <th className="py-3 px-4 w-28">Maksimal ball</th>
                      <th className="py-3 px-4 w-60">Masʼul tasdiqlovchi boʻlim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredIndicators.map(ind => (
                      <tr key={ind.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{ind.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{ind.name}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">{ind.validity}</td>
                        <td className="py-3.5 px-4 font-black text-blue-900 dark:text-blue-400">{ind.max_ball} ball</td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">{ind.dept}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGE: SVETAFOR MONITORING */}
          {/* ========================================================================= */}
          {activePage === "svetafor" && (
            <div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pedagoglar jami</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalTeachersCount} nafar</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Asosiy shtat va oʻrindoshlar</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Yashil toifa (70-100%)</div>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{greenTeachers.length} nafar</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{greenPct}% umumiy jamoaga nisbatan</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Sariq toifa (40%)</div>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-400">{yellowTeachers.length} nafar</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{yellowPct}% umumiy jamoaga nisbatan</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">Qizil toifa (0%)</div>
                  <div className="text-2xl font-black text-rose-700 dark:text-rose-400">{redTeachers.length} nafar</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{redPct}% umumiy jamoaga nisbatan</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Kafedralar boʻyicha taqsimot va oʻrtacha ballar</h4>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Kafedra nomi</th>
                      <th className="py-3 px-4">Xodimlar soni</th>
                      <th className="py-3 px-4">Oʻrtacha ball</th>
                      <th className="py-3 px-4">Yashil toifa</th>
                      <th className="py-3 px-4">Sariq toifa</th>
                      <th className="py-3 px-4">Qizil toifa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">Dasturiy injiniring kafedrasi</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">3 nafar</td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">72.0 ball</td>
                      <td className="py-3.5 px-4 text-emerald-700 dark:text-emerald-400 font-bold">1 nafar</td>
                      <td className="py-3.5 px-4 text-amber-700 dark:text-amber-400 font-bold">2 nafar</td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500">0</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">Amaliy matematika va informatika kafedrasi</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">1 nafar</td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">82.0 ball</td>
                      <td className="py-3.5 px-4 text-emerald-700 dark:text-emerald-400 font-bold">1 nafar</td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500">0</td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500">0</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">Xorijiy tillar kafedrasi</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">1 nafar</td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">77.0 ball</td>
                      <td className="py-3.5 px-4 text-emerald-700 dark:text-emerald-400 font-bold">1 nafar</td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500">0</td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500">0</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">Iqtisodiyot kafedrasi</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">1 nafar</td>
                      <td className="py-3.5 px-4 font-black text-rose-700 dark:text-rose-400">32.0 ball</td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500">0</td>
                      <td className="py-3.5 px-4 text-slate-400 dark:text-slate-500">0</td>
                      <td className="py-3.5 px-4 text-rose-700 dark:text-rose-400 font-bold">1 nafar</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGE: APPEALS */}
          {/* ========================================================================= */}
          {activePage === "appeals" && (
            <div>
              <div className={`border rounded-xl p-4 text-xs font-medium mb-6 ${
                theme === "dark" ? "bg-slate-900 border-blue-900/60 text-blue-200" : "bg-blue-50 border-blue-200 text-blue-900"
              }`}>
                <b>Eslatma:</b> Nizomning XI bobi 11.1-bandiga muvofiq, dastlabki reyting natijalari eʼlon qilingan kundan boshlab 3 (uch) ish kuni davomida elektron asoslantirilgan ariza topshirilishi mumkin.
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-6">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Apellyatsiya arizasini topshirish</h4>
                <form onSubmit={handleAppealSubmit}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Eʼtiroz bildirilayotgan mezon *</label>
                      <select
                        value={appealIndicator}
                        onChange={(e) => setAppealIndicator(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value="2.3">2.3. Scopus va Web of Science (Q1, Q2) – 8 ball</option>
                        <option value="1.1">1.1. Nashr etilgan darslik – 6 ball</option>
                        <option value="3.3">3.3. Xorijiy til sertifikati (C1/B2) – 3 ball</option>
                        <option value="4.1">4.1. Bitiruvchi shogirdlarni ishga joylashtirish (YAMMT) – 4 ball</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qoʻshimcha tasdiqlovchi hujjat (PDF)</label>
                      <input
                        type="file"
                        accept=".pdf"
                        className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Eʼtirozning asosli tavsifi *</label>
                    <textarea
                      rows={3}
                      value={appealReason}
                      onChange={(e) => setAppealReason(e.target.value)}
                      placeholder="Masalan: Scopus Q1 jurnalidagi maqola DOI raqami tasdiqlangan boʻlsa-da, ekspert komissiyasi tomonidan koʻrib chiqilmagan..."
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Apellyatsiya arizasini yuborish
                  </button>
                </form>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Roʻyxatga olingan apellyatsiyalar holati</h4>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Ariza kodi</th>
                      <th className="py-3 px-4">Oʻqituvchi</th>
                      <th className="py-3 px-4">Mezon</th>
                      <th className="py-3 px-4">Eʼtiroz matni</th>
                      <th className="py-3 px-4">Topshirilgan sana</th>
                      <th className="py-3 px-4">Komissiya qarori</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {appeals.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-900 dark:text-blue-400">{a.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{a.teacher_name}</td>
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{a.indicator_id}</td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 text-xs max-w-sm">{a.reason}</td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">{a.submitted_date}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                            {a.status}: {a.decision}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGE: OFFICIAL NIZOM */}
          {/* ========================================================================= */}
          {activePage === "doc" && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 max-w-4xl mx-auto">
              <div className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src="/logo-kpi.png"
                    alt="OʻzMU JF Logotipi"
                    className="w-14 h-14 rounded-full object-contain ring-2 ring-blue-500/20 shadow-sm flex-shrink-0 bg-white dark:bg-slate-800 p-0.5"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">OʻzMU JBNUU Rasmiy Nizomi (2026)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">13 bob, 6 ilova, TerDU va TDSHU tajribalari sintezi asosida</p>
                  </div>
                </div>
                <a
                  href="http://localhost:8080/api/download/nizom"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Hujjatni yuklab olish (Word)</span>
                </a>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none text-sm space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase">I Bob. Umumiy qoidalar</h4>
                <p>
                  1.1. Mazkur Nizom Oʻzbekiston Respublikasi Vazirlar Mahkamasining 2020-yil 31-dekabrdagi 824-son qarori hamda Oʻzbekiston Milliy universiteti Kengashining tegishli qarorlariga asosan ishlab chiqilgan.
                </p>
                <p>
                  1.2. KPI (Asosiy samaradorlik koʻrsatkichlari) tizimining maqsadi — professor-oʻqituvchilarning ilmiy-tadqiqot, oʻquv-metodik, xalqaro hamkorlik hamda maʼnaviy-maʼrifiy yoʻnalishlardagi faolligini oshirish va natijaga yoʻnaltirilgan oylik moddiy ragʻbatlantirish mexanizmini joriy etishdan iborat.
                </p>

                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase mt-6">II Bob. Baholash bloklari va meʼyoriy nisbatlar</h4>
                <p>
                  2.1. Umumiy baholash 100 ballik meʼyoriy koʻrsatkich asosida amalga oshiriladi:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><b>I. Oʻquv-uslubiy faoliyat:</b> maksimal 30 ball;</li>
                  <li><b>II. Ilmiy-tadqiqot va innovatsiya faoliyati:</b> maksimal 40 ball;</li>
                  <li><b>III. Xalqaro hamkorlik faoliyati:</b> maksimal 20 ball;</li>
                  <li><b>IV. Maʼnaviy-maʼrifiy va bitiruvchilar bandligi:</b> maksimal 10 ball.</li>
                </ul>

                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase mt-6">V Bob. Manfaatlar toʻqnashuvining oldini olish</h4>
                <p>
                  5.1. Nizom talablariga muvofiq, oʻzining KPI arizasini mustaqil tasdiqlash taqiqlanadi (Anti Self-Approval). Kafedra mudirlarining natijalari bevosita fakultet dekani yoki Ilmiy boʻlim tomonidan verifikatsiya qilinadi.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD KPI ENTRY (O'QITUVCHI TOMONIDAN NATIJA YUKLASH VA O'ZIGA BALL QO'YISH) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Yangi KPI faoliyat natijasini kiritish</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mezonni tanlang, oʻzingiz daʻvo qilayotgan ballni koʻrsating va asoslovchi hujjatni biriktiring</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* DOI Lookup Box (Scopus/WoS uchun) */}
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                <label className="block text-xs font-bold text-blue-950 dark:text-blue-300 mb-1">
                  DOI orqali avtomatik toʻldirish (Scopus / Web of Science maqolalari uchun)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={doiInput}
                    onChange={(e) => setDoiInput(e.target.value)}
                    placeholder="Masalan: 10.1016/j.eswa.2025.123456"
                    className="flex-1 p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                  <button
                    type="button"
                    onClick={handleDoiLookup}
                    disabled={isDoiLoading}
                    className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                  >
                    {isDoiLoading ? "Qidirilmoqda..." : "Tekshirish"}
                  </button>
                </div>
              </div>

              {/* Blok Tanlash Filtrlari */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Baholash yoʻnalishi (Blok)
                </label>
                <div className="grid grid-cols-5 gap-1.5 text-xs font-semibold">
                  {[
                    { id: "ALL", label: "Barchasi" },
                    { id: "oqv", label: "I. Oʻquv" },
                    { id: "ilm", label: "II. Ilmiy" },
                    { id: "xal", label: "III. Xalqaro" },
                    { id: "man", label: "IV. Maʼnaviy" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setModalBlockFilter(tab.id)}
                      className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                        modalBlockFilter === tab.id
                          ? "bg-blue-900 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mezonni Tanlash */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Baholash mezoni *
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Tanlangan mezon maksimal bali: <b>{indicators.find(i => i.id === modalIndicator)?.max_ball || 0} ball</b>
                  </span>
                </div>
                <select
                  value={modalIndicator}
                  onChange={(e) => {
                    setModalIndicator(e.target.value);
                    const ind = indicators.find(i => i.id === e.target.value);
                    if (ind) {
                      setModalClaimedBall(ind.max_ball);
                    }
                  }}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                >
                  {indicators
                    .filter(i => modalBlockFilter === "ALL" || i.block.toLowerCase() === modalBlockFilter.toLowerCase())
                    .map(ind => (
                      <option key={ind.id} value={ind.id}>
                        {ind.id}. {ind.name} (maks. {ind.max_ball} ball) — {ind.dept}
                      </option>
                    ))}
                </select>
              </div>

              {/* Faoliyat Nomi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Faoliyat natijasi nomi *
                </label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="Maqola, darslik, til sertifikati yoki loyiha nomini toʻliq kiriting..."
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              {/* O'qituvchi o'ziga da'vo qilayotgan ball & Hammualliflar soni */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-blue-950 dark:text-blue-300">
                      Daʻvo qilinayotgan ball *
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      (maks. {indicators.find(i => i.id === modalIndicator)?.max_ball || 10})
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={(indicators.find(i => i.id === modalIndicator)?.max_ball || 10) * 2}
                    required
                    value={modalClaimedBall}
                    onChange={(e) => setModalClaimedBall(Number(e.target.value))}
                    className="w-full p-2 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-black text-blue-950 dark:text-blue-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Default: mezon toʻliq bali. Agar qisman boʻlsa, ballni tahrirlashingiz mumkin.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hammualliflar soni *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={modalAuthors}
                    onChange={(e) => setModalAuthors(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Yakka muallif boʻlsa: 1 nafar
                  </div>
                </div>
              </div>

              {/* Sana & Qo'shimcha Izoh */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Topshirilgan sana *</label>
                  <input
                    type="date"
                    required
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tasdiqlovchi hujjat (PDF) *</label>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-100 dark:file:bg-blue-950/80 file:text-blue-900 dark:file:text-blue-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ekspert uchun qoʻshimcha izoh yoki havola (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  placeholder="Hujjat haqida qoʻshimcha maʼlumot, jurnal veb-sayti havolasi yoki nashr betlari..."
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Arizani yuborish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REVIEWER VERIFICATION MODAL (TEKSHIRISH, QO'LDA BAHOLASH VA RAD ETISH SABABI) */}
      {/* ========================================================================= */}
      {isVerifyModalOpen && selectedSubForReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Ariza ekspertizasi va verifikatsiyasi (#{selectedSubForReview.id})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hujjatni koʻzdan kechiring, bahoni qoʻlda tasdiqlang yoki asosli sabab bilan rad eting
                </p>
              </div>
              <button
                onClick={() => {
                  setIsVerifyModalOpen(false);
                  setSelectedSubForReview(null);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Ariza ma'lumotlari xulosasi */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 mb-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Oʻqituvchi:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedSubForReview.teacher_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Mezon kodi:</span>
                <span className="font-mono font-bold text-blue-900 dark:text-blue-400">{selectedSubForReview.indicator_id}</span>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 mb-0.5">Faoliyat natijasi nomi:</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">{selectedSubForReview.title}</div>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Oʻqituvchi daʻvo qilgan ball:</span>
                <span className="font-bold text-blue-950 dark:text-blue-300 text-sm">
                  {selectedSubForReview.claimed_ball ?? selectedSubForReview.ball} ball
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 dark:text-slate-400">Asoslovchi PDF:</span>
                <button
                  type="button"
                  onClick={() => alert(`PDF hujjat ekspert tomonidan ochildi va tekshirildi: ${selectedSubForReview.file_name}`)}
                  className="text-xs text-blue-700 dark:text-blue-400 font-semibold underline flex items-center gap-1 hover:text-blue-900"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{selectedSubForReview.file_name}</span>
                </button>
              </div>
              {selectedSubForReview.description && (
                <div className="pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 italic">
                  Muallif izohi: "{selectedSubForReview.description}"
                </div>
              )}
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              {/* Ekspert qarorini tanlash (Tasdiqlash / Rad etish) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ekspert komissiyasi qarori *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyActionType("approved");
                      setVerifyError("");
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      verifyActionType === "approved"
                        ? "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Tasdiqlash (Qoʻlda baho qoʻyish)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVerifyActionType("rejected");
                      setVerifyError("");
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      verifyActionType === "rejected"
                        ? "bg-rose-50 dark:bg-rose-950/70 border-rose-500 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/30"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Rad etish (Sababi shart)</span>
                  </button>
                </div>
              </div>

              {/* QAROR 1: TASDIQLASH HOLATI */}
              {verifyActionType === "approved" && (
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200">
                        Tasdiqlanayotgan yakuniy ball (qoʻlda belgilash) *
                      </label>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                        Daʻvo: {selectedSubForReview.claimed_ball ?? selectedSubForReview.ball} ball
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      value={verifyManualScore}
                      onChange={(e) => setVerifyManualScore(Number(e.target.value))}
                      className="w-full p-2.5 border border-emerald-300 dark:border-emerald-700 rounded-lg text-sm font-black text-emerald-950 dark:text-emerald-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Mezon talablariga toʻliq mos boʻlsa oʻqituvchi daʻvo qilgan ballni qoldiring yoki asosli ravishda boshqa qiymat kiriting.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ekspert xulosasi / tavsifi
                    </label>
                    <input
                      type="text"
                      value={verifyComment}
                      onChange={(e) => setVerifyComment(e.target.value)}
                      placeholder="Masalan: Maqola Scopus Q1 bazasida tekshirildi, OʻzMU JF afiliatsiyasi tasdiqlandi"
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* QAROR 2: RAD ETISH HOLATI (RAD ETISH SABABI MAJBURIY!) */}
              {verifyActionType === "rejected" && (
                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Rad etish sababi (Oʻqituvchiga koʻrinishi shart) *</span>
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={verifyRejectionReason}
                    onChange={(e) => setVerifyRejectionReason(e.target.value)}
                    placeholder="Masalan: Taqdim etilgan PDF hujjatda mualliflar roʻyxatida OʻzMU JBNUU afiliatsiyasi koʻrsatilmagan yoki ilmiy ish belgilangan davrga tegishli emas..."
                    className="w-full p-2.5 border border-rose-300 dark:border-rose-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-600"
                  />

                  <div className="text-[11px] text-rose-700 dark:text-rose-300 leading-tight">
                    <b>Muhim qoida:</b> Ariza rad etilganda unga <b>0 ball</b> beriladi. Siz kiritgan rad etish sababi oʻqituvchi profilida qizil ogohlantirishda toʻliq koʻrinadi va agar u rozi boʻlmasa, apellyatsiya arizasiga asos boʻladi.
                  </div>
                </div>
              )}

              {verifyError && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifyModalOpen(false);
                    setSelectedSubForReview(null);
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60 ${
                    verifyActionType === "approved"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isVerifying ? (
                    <span>Saqlanmoqda...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{verifyActionType === "approved" ? "Qarorni tasdiqlash va ballni qoʻyish" : "Rad etish qarorini qayd etish"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
