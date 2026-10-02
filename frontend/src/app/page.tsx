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
  Shield,
  Save,
  Check,
  Building,
  KeyRound,
  AlertCircle,
  Info,
  HelpCircle,
  QrCode,
  Database,
  RefreshCw,
  Briefcase,
  GraduationCap,
  Award,
  LockKeyhole,
  Sliders,
  Plus,
  X,
  ArrowLeft,
  ChevronLeft,
  FileSpreadsheet,
  Sun,
  Moon,
  Menu,
  Eye,
  EyeOff,
  UserCog,
  AlertTriangle,
  Upload,
  Calculator,
  Paperclip,
  Pencil,
  Trash2,
  BookOpen,
  LayoutGrid,
  List
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
  image?: string;
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
  submission_id?: number;
  teacher_id: number;
  teacher_name: string;
  indicator_id: string;
  title?: string;
  claimed_ball?: number;
  reviewed_ball?: number;
  initial_reviewer?: string;
  initial_rejection_reason?: string;
  appeal_reason?: string;
  reason: string;
  evidence_file?: string;
  submitted_date: string;
  status: string;
  decision?: string;
  commission_member?: string;
  commission_comment?: string;
  decision_date?: string;
  awarded_ball?: number;
  created_at?: string;
}

interface EvaluatorRecord {
  id: number;
  user_id?: number;
  username: string;
  name: string;
  assigned_category: string;
  role_type: string;
  deadline_date?: string;
  is_active: boolean;
  assigned_by?: string;
  created_at?: string;
}

interface EvaluationPeriodInfo {
  academic_year: string;
  submissions_open: boolean;
  submission_deadline: string;
  review_deadline: string;
  appeal_deadline: string;
  current_stage: string;
  budget_cap_monthly: number;
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
  hemis_id?: number | string;
  image?: string;
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
  submission_deadline?: string;
  review_deadline?: string;
  appeal_deadline?: string;
  current_stage?: string;
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

// HEMIS Teacher Workload Data Structures
interface TeacherWorkloadItem {
  id: number;
  employee_id: number;
  employee_name: string;
  department_name: string;
  subject_name: string;
  education_type_code: string;
  education_type_name: string;
  total_hours: number;
}

interface TeacherWorkloadSummary {
  total_items: number;
  total_teachers: number;
  total_hours: number;
  bachelor_hours: number;
  master_hours: number;
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isAlertOnly?: boolean;
}

// Fan oʻquv-uslubiy hujjatlari (Sillabus, Ishchi dastur, Baholash mezonlari)
interface CourseSyllabusDoc {
  id: number;
  teacher_id?: number;
  teacher_name: string;
  subject_name: string;
  department_name?: string;
  academic_year: string;
  doc_type: "SYLLABUS" | "WORK_PROGRAM" | "LECTURE_NOTES" | "PRACTICAL_GUIDE" | "LAB_GUIDE" | "SEMINAR_GUIDE" | "INDEPENDENT_STUDY_GUIDE" | "ASSESSMENT_CRITERIA" | "OTHER";
  title: string;
  file_url: string;
  file_name: string;
  status: "SUBMITTED" | "MUDIR_APPROVED" | "MUDIR_REJECTED" | "APPROVED" | "DEAN_REJECTED";
  mudir_status: "PENDING" | "APPROVED" | "REJECTED";
  mudir_comment?: string;
  mudir_updated_at?: string;
  dean_status: "PENDING" | "APPROVED" | "REJECTED";
  dean_comment?: string;
  dean_updated_at?: string;
  verification_token?: string;
  created_at?: string;
}

// Darslik, Oʻquv qoʻllanma, Monografiya Kengashlar Zanjiri
interface PublicationRecommendation {
  id: number;
  teacher_id?: number;
  teacher_name: string;
  subject_name: string;
  department_name?: string;
  academic_year: string;
  pub_type: "DARSLIK" | "OʻQUV QOʻLLANMA" | "USLUBIY QOʻLLANMA" | "MONOGRAFIYA";
  title: string;
  authors: string;
  co_authors?: string;
  manuscript_file: string;
  internal_review_file: string;
  internal_reviewer_name?: string;
  external_review_file: string;
  external_reviewer_name?: string;
  curriculum_file: string;
  antiplagiarism_file: string;
  antiplagiarism_score: number;
  workload_extract_file?: string;
  kafedra_status: "PENDING" | "APPROVED" | "REJECTED";
  kafedra_protocol_num?: string;
  kafedra_protocol_date?: string;
  kafedra_protocol_file?: string;
  kafedra_comment?: string;
  fakultet_status: "PENDING" | "APPROVED" | "REJECTED";
  fakultet_protocol_num?: string;
  fakultet_protocol_date?: string;
  fakultet_protocol_file?: string;
  fakultet_comment?: string;
  methodical_status: "PENDING" | "APPROVED" | "REJECTED";
  methodical_protocol_num?: string;
  methodical_protocol_date?: string;
  methodical_protocol_file?: string;
  methodical_comment?: string;
  council_status: "PENDING" | "APPROVED" | "REJECTED";
  council_protocol_num?: string;
  council_protocol_date?: string;
  council_protocol_file?: string;
  council_comment?: string;
  mygov_app_num?: string;
  ministry_grif_num?: string;
  ministry_certificate_file?: string;
  overall_status: "AT_KAFEDRA" | "AT_FAKULTET" | "AT_METHODICAL" | "AT_COUNCIL" | "COUNCIL_RECOMMENDED" | "SUBMITTED_TO_MYGOV" | "MINISTRY_APPROVED" | "KAFEDRA_REJECTED" | "FAKULTET_REJECTED" | "METHODICAL_REJECTED" | "COUNCIL_REJECTED";
  verification_token?: string;
  created_at?: string;
}

// HEMIS O'quv rejalari va Fan resurslari interfeyslari
interface HemisCurriculum {
  id: number;
  name: string;
  specialty_code: string;
  specialty_name: string;
  department_name: string;
  department_code: string;
  education_year: string;
  education_type: string;
  education_form: string;
  marking_system: string;
  semester_count: number;
  education_period: number;
  is_active: number;
}

interface HemisCurriculumSubject {
  id: number;
  curriculum_id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  subject_type: string;
  subject_block: string;
  semester_name: string;
  semester_code: string;
  total_acload: number;
  credit: number;
  lecture_hours: number;
  practical_hours: number;
  seminar_hours: number;
  lab_hours: number;
  independent_hours: number;
  department_name: string;
  resource_count: number;
}

interface HemisSubjectResource {
  id: number;
  title: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  training_type: string;
  employee_id: number;
  employee_name: string;
  resource_type: string;
  file_name: string;
  file_size: number;
  file_url: string;
  updated_at_ts: number;
}

interface HemisSubjectTeacher {
  id: number;
  curriculum_id: number;
  semester_code: string;
  education_year: string;
  department_id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  employee_id: number;
  employee_name: string;
  training_type: string;
  group_id?: number;
  students_count: number;
}

interface HemisAcademicStats {
  curriculums_count: number;
  curriculum_subjects_count: number;
  subject_resources_count: number;
  subject_teachers_count: number;
  scientific_activities_count?: number;
  doctorate_students_count?: number;
}

interface HemisScientificActivity {
  id: number;
  employee_id: number;
  employee_name: string;
  scientific_platform: string;
  profile_link: string;
  h_index: number;
  publication_work_count: number;
  citation_count: number;
  education_year: string;
  is_checked: number;
}

interface HemisDoctorateStudent {
  id: number;
  full_name: string;
  short_name: string;
  student_id_number: string;
  dissertation_theme: string;
  department_name: string;
  specialty_code: string;
  specialty_name: string;
  science_branch: string;
  doctoral_type: string;
  doctorate_status: string;
  level: string;
  image?: string;
}

interface UniversalPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  itemLabel?: string;
  theme: "light" | "dark";
}

function UniversalPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  perPageOptions = [10, 25, 50],
  itemLabel = "yozuv",
  theme
}: UniversalPaginationProps) {
  if (totalItems === 0) return null;

  const isDark = theme === "dark";
  const startItem = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 1;
  const endItem = itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : totalItems;

  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
      isDark 
        ? "bg-slate-900 border-slate-800 text-slate-300" 
        : "bg-slate-50 border-slate-200 text-slate-600"
    }`}>
      {/* Chap tomon: Qaydlar soni va har sahifadagi miqdor */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="font-medium">
          Jami <b className={isDark ? "text-white" : "text-slate-900"}>{totalItems}</b> ta {itemLabel}dan{" "}
          <b className={isDark ? "text-blue-400" : "text-blue-700"}>{startItem}–{endItem}</b> koʻrsatilmoqda
        </span>
        {onItemsPerPageChange && itemsPerPage && (
          <>
            <span className={isDark ? "text-slate-700" : "text-slate-300"}>|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Har sahifada:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  onItemsPerPageChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-600"
                    : "bg-white border-slate-300 text-slate-800 hover:border-slate-400 shadow-xs"
                }`}
              >
                {perPageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} tadan
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* O'ng tomon: Sahifalash tugmalari */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Oldingi tugmasi */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all ${
              currentPage <= 1
                ? isDark
                  ? "bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                  : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                : isDark
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 shadow-xs cursor-pointer"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs cursor-pointer"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Oldingi</span>
          </button>

          {/* Sahifa raqamlari */}
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className={`w-8 h-8 flex items-center justify-center font-bold ${
                    isDark ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  ...
                </span>
              );
            }
            const isCurr = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(Number(p))}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  isCurr
                    ? isDark
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400"
                      : "bg-blue-900 text-white shadow-md shadow-blue-900/20"
                    : isDark
                    ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-600"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs"
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Keyingi tugmasi */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all ${
              currentPage >= totalPages
                ? isDark
                  ? "bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                  : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
                : isDark
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 shadow-xs cursor-pointer"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs cursor-pointer"
            }`}
          >
            <span className="hidden sm:inline">Keyingi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

interface NavbarCountdownTimerProps {
  settings: SystemSettings;
  theme: string;
  onOpenSettings?: () => void;
}

function NavbarCountdownTimer({ settings, theme, onOpenSettings }: NavbarCountdownTimerProps) {
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

      // DD.MM.YYYY (masalan 15.06.2026 yoki 25.10.2026)
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
        // Intellektual ketma-ketlik: Hali o'tmagan eng birinchi bosqich muddatini ko'rsatadi
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
          // Barcha sanalar o'tgan bo'lsa, eng oxirgi belgilangan sanani olamiz
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
      <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
        theme === "dark" ? "bg-slate-800/60 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
      }`}>
        <Clock className="w-3.5 h-3.5" />
        <span>Muddat...</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds, isExpired, stageName, targetDateStr, isClosed } = timeLeft;

  let pulseDotColor = "bg-blue-500";
  let badgeBorder = theme === "dark" ? "border-blue-800/80 bg-blue-950/40 text-blue-300" : "border-blue-200 bg-blue-50 text-blue-900";

  if (isClosed) {
    pulseDotColor = "bg-slate-400";
    badgeBorder = theme === "dark" ? "border-slate-700 bg-slate-800/60 text-slate-400" : "border-slate-200 bg-slate-100 text-slate-600";
  } else if (isExpired) {
    pulseDotColor = "bg-rose-500";
    badgeBorder = theme === "dark" ? "border-rose-900/80 bg-rose-950/50 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-800";
  } else if (days < 1) {
    pulseDotColor = "bg-rose-500";
    badgeBorder = theme === "dark" ? "border-rose-800 bg-rose-950/60 text-rose-300 ring-1 ring-rose-500/50" : "border-rose-300 bg-rose-50 text-rose-900 ring-1 ring-rose-300";
  } else if (days <= 3) {
    pulseDotColor = "bg-amber-400";
    badgeBorder = theme === "dark" ? "border-amber-800/80 bg-amber-950/40 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-900";
  } else {
    pulseDotColor = "bg-emerald-500";
    badgeBorder = theme === "dark" ? "border-emerald-800/80 bg-emerald-950/40 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      onClick={onOpenSettings}
      title={onOpenSettings ? "Baholash reglamenti va muddatlarni sozlash (Administrator)" : `Tizim muddati: ${targetDateStr || "Belgilanmagan"}`}
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
}

export default function KpiEnterpriseApp() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Role and Navigation
  const [activeRole, setActiveRole] = useState<"ADMIN" | "DEAN" | "HEAD_OF_DEPT" | "TEACHER" | "RECTORATE">("ADMIN");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [activePage, setActivePage] = useState<
    "dashboard" | "structure" | "indicators" | "svetafor" | "appeals" | "doc" | "admin_settings" | "admin_users" | "admin_logs" | "admin_hemis" | "admin_indicators" | "profile" | "subjects"
  >("dashboard");

  // Teacher Subjects & Workload Page State
  const [subjectSearchQuery, setSubjectSearchQuery] = useState<string>("");
  const [subjectEduTypeFilter, setSubjectEduTypeFilter] = useState<"ALL" | "11" | "12">("ALL");
  const [subjectSortBy, setSubjectSortBy] = useState<"hours_desc" | "hours_asc" | "name">("hours_desc");
  const [subjectViewMode, setSubjectViewMode] = useState<"cards" | "table">("cards");
  const [selectedSubjectTeacherName, setSelectedSubjectTeacherName] = useState<string>("");

  // Alohida ixtisoslashgan modallar (Foydalanuvchiga juda qulay va sodda bo'lishi uchun)
  const [courseDocsModalOpen, setCourseDocsModalOpen] = useState(false);
  const [publicationModalOpen, setPublicationModalOpen] = useState(false);
  const [hemisSubjectModalOpen, setHemisSubjectModalOpen] = useState(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [selectedWorkflowSubject, setSelectedWorkflowSubject] = useState<{
    subject_name: string;
    department_name: string;
    education_type_name?: string;
    teacher_name: string;
    total_hours: number;
  } | null>(null);
  const [workflowSubTab, setWorkflowSubTab] = useState<"docs" | "publications" | "hemis_resources">("docs");

  // 3. HEMIS Fan resurslari va O'quv reja integratsiyasi statelari
  const [hemisAcademicStats, setHemisAcademicStats] = useState<HemisAcademicStats | null>(null);
  const [hemisCurriculums, setHemisCurriculums] = useState<HemisCurriculum[]>([]);
  const [hemisCurriculumFilter, setHemisCurriculumFilter] = useState<string>("");
  const [isHemisAcademicSyncing, setIsHemisAcademicSyncing] = useState<boolean>(false);
  const [isFullAcademicSyncing, setIsFullAcademicSyncing] = useState<boolean>(false);
  const [hemisScientificActivities, setHemisScientificActivities] = useState<HemisScientificActivity[]>([]);
  const [hemisDoctorateStudents, setHemisDoctorateStudents] = useState<HemisDoctorateStudent[]>([]);
  const [hemisAcademicActiveTab, setHemisAcademicActiveTab] = useState<"curriculums" | "scientific" | "doctorates">("curriculums");
  const [activeSubjectHemisResources, setActiveSubjectHemisResources] = useState<HemisSubjectResource[]>([]);
  const [activeSubjectCurriculumSubject, setActiveSubjectCurriculumSubject] = useState<HemisCurriculumSubject | null>(null);
  const [isSubjectHemisResourcesLoading, setIsSubjectHemisResourcesLoading] = useState<boolean>(false);
  const [hemisResourceSearch, setHemisResourceSearch] = useState<string>("");
  const [hemisResourceFilterType, setHemisResourceFilterType] = useState<string>("ALL");

  // 1. Fan o'quv-uslubiy hujjatlari
  const [courseDocsList, setCourseDocsList] = useState<CourseSyllabusDoc[]>([]);
  const [isCourseDocsLoading, setIsCourseDocsLoading] = useState(false);
  const [isCourseDocUploading, setIsCourseDocUploading] = useState(false);
  const [newCourseDocType, setNewCourseDocType] = useState<"SYLLABUS" | "WORK_PROGRAM" | "LECTURE_NOTES" | "PRACTICAL_GUIDE" | "LAB_GUIDE" | "SEMINAR_GUIDE" | "INDEPENDENT_STUDY_GUIDE" | "ASSESSMENT_CRITERIA" | "OTHER">("SYLLABUS");
  const [newCourseDocTitle, setNewCourseDocTitle] = useState("");
  const [newCourseDocFile, setNewCourseDocFile] = useState<File | null>(null);
  const [isAddCourseDocFormOpen, setIsAddCourseDocFormOpen] = useState(false);

  // O'qituvchining ushbu fanni o'tish turlari (Ma'ruza, Amaliy, Laboratoriya, Seminar)
  const [teacherTrainingRoles, setTeacherTrainingRoles] = useState<{
    hasLecture: boolean;
    hasPractical: boolean;
    hasLab: boolean;
    hasSeminar: boolean;
  }>({
    hasLecture: true,
    hasPractical: false,
    hasLab: false,
    hasSeminar: false
  });

  // Mudir / Dekan ko'rib chiqish modali
  const [courseDocReviewModalOpen, setCourseDocReviewModalOpen] = useState(false);
  const [activeDocForReview, setActiveDocForReview] = useState<CourseSyllabusDoc | null>(null);
  const [courseDocReviewRole, setCourseDocReviewRole] = useState<"mudir" | "dean">("mudir");
  const [courseDocReviewStatus, setCourseDocReviewStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [courseDocReviewComment, setCourseDocReviewComment] = useState("");
  const [isCourseDocReviewing, setIsCourseDocReviewing] = useState(false);

  // 2. Darslik, O'quv qo'llanma, Monografiya Kengashlar Zanjiri
  const [publicationsList, setPublicationsList] = useState<PublicationRecommendation[]>([]);
  const [isPubsLoading, setIsPubsLoading] = useState(false);
  const [isPubSubmitting, setIsPubSubmitting] = useState(false);
  const [pubModalFormOpen, setPubModalFormOpen] = useState(false);

  // Yangi nashr formasi
  const [newPubType, setNewPubType] = useState<"DARSLIK" | "OʻQUV QOʻLLANMA" | "USLUBIY QOʻLLANMA" | "MONOGRAFIYA">("OʻQUV QOʻLLANMA");
  const [newPubTitle, setNewPubTitle] = useState("");
  const [newPubAuthors, setNewPubAuthors] = useState("");
  const [newPubCoAuthors, setNewPubCoAuthors] = useState("");
  const [newPubInternalReviewer, setNewPubInternalReviewer] = useState("");
  const [newPubExternalReviewer, setNewPubExternalReviewer] = useState("");
  const [newPubAntiplagiatScore, setNewPubAntiplagiatScore] = useState<number>(85.0);

  // Nashr fayllari
  const [fileManuscript, setFileManuscript] = useState<File | null>(null);
  const [fileInternalReview, setFileInternalReview] = useState<File | null>(null);
  const [fileExternalReview, setFileExternalReview] = useState<File | null>(null);
  const [fileCurriculum, setFileCurriculum] = useState<File | null>(null);
  const [fileAntiplagiat, setFileAntiplagiat] = useState<File | null>(null);
  const [fileWorkloadExtract, setFileWorkloadExtract] = useState<File | null>(null);

  // Kengash bayonnomasi yuklash / tasdiqlash modali (Kafedra, Fakultet, O'UK, Filial Kengashi)
  const [reviewStageModalOpen, setReviewStageModalOpen] = useState(false);
  const [activePubForReview, setActivePubForReview] = useState<PublicationRecommendation | null>(null);
  const [reviewStageName, setReviewStageName] = useState<"kafedra" | "fakultet" | "methodical" | "council">("kafedra");
  const [reviewProtocolNum, setReviewProtocolNum] = useState("");
  const [reviewProtocolDate, setReviewProtocolDate] = useState("");
  const [reviewProtocolFile, setReviewProtocolFile] = useState<File | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewDecision, setReviewDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [isStageReviewing, setIsStageReviewing] = useState(false);

  // my.gov.uz & Vazirlik Grifi arizasi modali
  const [myGovModalOpen, setMyGovModalOpen] = useState(false);
  const [activePubForMyGov, setActivePubForMyGov] = useState<PublicationRecommendation | null>(null);
  const [myGovAppNum, setMyGovAppNum] = useState("");
  const [ministryGrifNum, setMinistryGrifNum] = useState("");
  const [ministryCertFile, setMinistryCertFile] = useState<File | null>(null);
  const [isMyGovSaving, setIsMyGovSaving] = useState(false);

  // QR kod va ko'chirma chop etish / tekshirish modali
  const [qrVerifyModalOpen, setQrVerifyModalOpen] = useState(false);
  const [verifyItemData, setVerifyItemData] = useState<{ type: "doc" | "pub"; data: any } | null>(null);

  // Editing Submission State (Baholanmagan arizani tahrirlash uchun)
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
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
  const [evaluators, setEvaluators] = useState<EvaluatorRecord[]>([]);

  // HEMIS Teacher Workloads state
  const [teacherWorkloads, setTeacherWorkloads] = useState<TeacherWorkloadItem[]>([]);
  const [workloadsSummary, setWorkloadsSummary] = useState<TeacherWorkloadSummary | null>(null);
  const [isWorkloadsLoading, setIsWorkloadsLoading] = useState<boolean>(false);
  const [selectedWorkloadTeacher, setSelectedWorkloadTeacher] = useState<{
    name: string;
    id?: number;
    department?: string;
  } | null>(null);

  // Baholovchilar / Ekspertlar tayinlash modal statelari
  const [isAddEvaluatorModalOpen, setIsAddEvaluatorModalOpen] = useState(false);
  const [evalFormUsername, setEvalFormUsername] = useState("");
  const [evalFormName, setEvalFormName] = useState("");
  const [evalFormCategory, setEvalFormCategory] = useState("2. Ilmiy va innovatsion faoliyat");
  const [evalFormRole, setEvalFormRole] = useState("EXPERT");
  const [evalFormDeadline, setEvalFormDeadline] = useState("2026-06-25");
  const [isEvaluatorSaving, setIsEvaluatorSaving] = useState(false);

  // O'qituvchi arizadan to'g'ridan-to'g'ri apellyatsiya berish modal statelari
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [selectedSubForAppeal, setSelectedSubForAppeal] = useState<Submission | null>(null);
  const [appealFormReason, setAppealFormReason] = useState("");
  const [appealFormEvidence, setAppealFormEvidence] = useState("");
  const [isAppealSubmitting, setIsAppealSubmitting] = useState(false);

  // Komissiya apellyatsiyani ko'rib chiqish modal statelari
  const [isReviewAppealModalOpen, setIsReviewAppealModalOpen] = useState(false);
  const [selectedAppealForReview, setSelectedAppealForReview] = useState<Appeal | null>(null);
  const [appealReviewStatus, setAppealReviewStatus] = useState<"ACCEPTED" | "PARTIALLY_ACCEPTED" | "REJECTED">("ACCEPTED");
  const [appealReviewBall, setAppealReviewBall] = useState<number>(0);
  const [appealReviewComment, setAppealReviewComment] = useState("");
  const [isAppealReviewing, setIsAppealReviewing] = useState(false);

  // Admin Data states
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    academic_year: "2025/2026-oʻquv yili",
    submissions_open: true,
    deadline_date: "2026-10-25",
    submission_deadline: "2026-10-25",
    review_deadline: "2026-11-05",
    appeal_deadline: "2026-11-15",
    current_stage: "ALL_OPEN",
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

  // Kafedra va o'qituvchini dinamik tanlash statelari
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  // Modal State for New KPI entry
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [doiInput, setDoiInput] = useState("");
  const [modalBlockFilter, setModalBlockFilter] = useState<string>("ALL");
  const [modalIndicatorSearch, setModalIndicatorSearch] = useState<string>("");
  const [modalIndicator, setModalIndicator] = useState("1.1");
  const [modalTitle, setModalTitle] = useState("");
  const [modalAuthors, setModalAuthors] = useState(1);
  const [modalDate, setModalDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [modalClaimedBall, setModalClaimedBall] = useState<number>(6.0);
  const [modalDescription, setModalDescription] = useState<string>("");
  const [isDoiLoading, setIsDoiLoading] = useState(false);
  const [modalUploadedFile, setModalUploadedFile] = useState<File | null>(null);
  const [modalUploadedFileName, setModalUploadedFileName] = useState<string>("");
  const [isSubmittingNewKpi, setIsSubmittingNewKpi] = useState<boolean>(false);
  const [modalNotification, setModalNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Global Confirmation & Alert Modal State
  const [confirmModal, setConfirmModal] = useState<ConfirmDialogState | null>(null);

  const showConfirm = (opts: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info" | "success";
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => {
    setConfirmModal({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText || "Tasdiqlash",
      cancelText: opts.cancelText || "Bekor qilish",
      type: opts.type || "warning",
      onConfirm: opts.onConfirm,
      onCancel: opts.onCancel,
      isAlertOnly: false
    });
  };

  const showAlert = (opts: {
    title: string;
    message: string;
    confirmText?: string;
    type?: "danger" | "warning" | "info" | "success";
    onConfirm?: () => void;
  }) => {
    setConfirmModal({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText || "Tushunarli",
      type: opts.type || "info",
      onConfirm: () => {
        if (opts.onConfirm) opts.onConfirm();
        setConfirmModal(null);
      },
      isAlertOnly: true
    });
  };

  const promptLogout = () => {
    showConfirm({
      title: "Tizimdan chiqishni tasdiqlaysizmi?",
      message: "Haqiqatan ham shaxsiy kabinetingizdan chiqmoqchimisiz? Tizimga qayta kirish uchun maxfiy parolingizni kiritishingiz lozim boʻladi.",
      confirmText: "Chiqish",
      cancelText: "Qolish",
      type: "danger",
      onConfirm: () => handleLogout()
    });
  };

  const promptSyncHemis = () => {
    showConfirm({
      title: "HEMIS bilan toʻliq sinxronlash",
      message: "HEMIS axborot tizimidan barcha pedagoglar qayta yuklanadi. Boʻshagan xodimlar avtomatik chiqariladi, oʻrindoshliklar birlashtiriladi. Saqlangan parollar va kiritilgan arizalar saqlanib qoladi.",
      confirmText: "Sinxronlashni boshlash",
      cancelText: "Bekor qilish",
      type: "info",
      onConfirm: async () => {
        await handleSyncHemis();
      }
    });
  };

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
  const [showForceCurrentPassword, setShowForceCurrentPassword] = useState<boolean>(false);
  const [showForceNewPassword, setShowForceNewPassword] = useState<boolean>(false);
  const [showForceConfirmPassword, setShowForceConfirmPassword] = useState<boolean>(false);
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
  const [mySubsPage, setMySubsPage] = useState<number>(1);
  const [mySubsPerPage, setMySubsPerPage] = useState<number>(6);
  const [reviewSubsPage, setReviewSubsPage] = useState<number>(1);
  const [reviewSubsPerPage, setReviewSubsPerPage] = useState<number>(6);
  const [appealsPage, setAppealsPage] = useState<number>(1);
  const [appealsPerPage, setAppealsPerPage] = useState<number>(8);
  const [adminLogsPage, setAdminLogsPage] = useState<number>(1);
  const [adminLogsPerPage, setAdminLogsPerPage] = useState<number>(12);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sidebar Collapse & Mobile Menu State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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
  const [showProfCurrentPassword, setShowProfCurrentPassword] = useState<boolean>(false);
  const [showProfNewPassword, setShowProfNewPassword] = useState<boolean>(false);
  const [showProfConfirmPassword, setShowProfConfirmPassword] = useState<boolean>(false);

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

    setIsMounted(true);

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
        // Faqat ADMIN ga boshqa rollarni inspeksiya qilish ruxsati bor.
        // Oddiy foydalanuvchilar (TEACHER, HEAD_OF_DEPT, DEAN, RECTORATE) uchun rol qatʼiy oʻziniki boʻladi!
        if (parsed.role === "ADMIN") {
          const savedRole = localStorage.getItem("kpi_active_role");
          setActiveRole((savedRole as any) || "ADMIN");
        } else {
          setActiveRole(parsed.role);
          localStorage.setItem("kpi_active_role", parsed.role);
        }

        const savedPage = localStorage.getItem("kpi_active_page");
        if (savedPage) {
          setActivePage(savedPage as any);
        }
      } catch {
        localStorage.removeItem("kpi_session_user");
      }
    }
    fetchInitialData();
  }, []);

  // Save activePage on changes (faqat dastlabki hydrationdan so'ng saqlaymiz!)
  useEffect(() => {
    if (isMounted && activePage) {
      localStorage.setItem("kpi_active_page", activePage);
    }
  }, [activePage, isMounted]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activePage, activeRole]);

  useEffect(() => {
    // Xavfsizlik nazorati: Agar foydalanuvchi ADMIN boʻlmasa, uning roli qatʼiy oʻziniki boʻlishi shart!
    if (currentUser && currentUser.role !== "ADMIN" && activeRole !== currentUser.role) {
      setActiveRole(currentUser.role);
      localStorage.setItem("kpi_active_role", currentUser.role);
      return;
    }
    if (activeRole) {
      localStorage.setItem("kpi_active_role", activeRole);
    }
  }, [activeRole, currentUser?.role]);

  // Toggle Theme handler
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("kpi_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  // Toggle Sidebar Collapse (Mobile drawer or Desktop collapse)
  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileMenuOpen(prev => !prev);
    } else {
      const next = !sidebarCollapsed;
      setSidebarCollapsed(next);
      localStorage.setItem("kpi_sidebar_collapsed", next ? "true" : "false");
    }
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
  }, [currentUser?.id]);

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
      const [tRes, iRes, sRes, aRes, hRes, eRes, pRes] = await Promise.all([
        fetch(`${API_BASE}/teachers`).then(r => r.json()),
        fetch(`${API_BASE}/indicators`).then(r => r.json()),
        fetch(`${API_BASE}/submissions`).then(r => r.json()),
        fetch(`${API_BASE}/appeals`).then(r => r.json()),
        fetch(`${API_BASE}/structure/hierarchy`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/evaluators`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/evaluation-period`).then(r => r.json()).catch(() => null)
      ]);
      setTeachers(tRes);
      if (Array.isArray(tRes)) {
        setCurrentUser(prevUser => {
          if (!prevUser) return null;
          const matched = tRes.find((t: Teacher) => 
            t.id === prevUser.id || 
            (t.name && prevUser.name && t.name.trim().toLowerCase() === prevUser.name.trim().toLowerCase())
          );
          if (matched) {
            let changed = false;
            const updated = { ...prevUser };
            if (matched.image && matched.image !== prevUser.image) {
              updated.image = matched.image;
              changed = true;
            }
            if (matched.faculty && (!prevUser.faculty || prevUser.faculty === "Filial fakultetlari" || prevUser.faculty !== matched.faculty)) {
              updated.faculty = matched.faculty;
              changed = true;
            }
            if (changed) {
              localStorage.setItem("kpi_session_user", JSON.stringify(updated));
              return updated;
            }
          }
          return prevUser;
        });
      }
      setIndicators(iRes);
      setSubmissions(sRes);
      setAppeals(aRes);
      if (hRes) setStructureHierarchy(hRes);
      if (Array.isArray(eRes)) setEvaluators(eRes);
      if (pRes) setSystemSettings(pRes);
      fetchWorkloads();
    } catch (err) {
      console.error("FastAPI serverga ulanishda xatolik:", err);
    }
  };

  const fetchWorkloads = async () => {
    setIsWorkloadsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hemis/workloads`);
      if (res.ok) {
        const data = await res.json();
        setTeacherWorkloads(data.items || []);
        setWorkloadsSummary(data.summary || null);
      }
    } catch (err) {
      console.error("Workloads yuklashda xatolik:", err);
    } finally {
      setIsWorkloadsLoading(false);
    }
  };

  const handleSyncWorkloads = async () => {
    setIsWorkloadsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hemis/sync-workloads`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setWorkloadsSummary(data.summary || null);
        fetchWorkloads();
        showAlert({
          title: "Muvaffaqiyatli",
          message: data.message || "HEMIS oʻquv yuklamalari muvaffaqiyatli sinxronlashtirildi!",
          type: "success"
        });
      } else {
        showAlert({ title: "Xatolik", message: data.detail || "Yuklamalarni sinxronlashda xatolik", type: "danger" });
      }
    } catch {
      showAlert({ title: "Xatolik", message: "Serverga ulanishda xatolik yuz berdi", type: "danger" });
    } finally {
      setIsWorkloadsLoading(false);
    }
  };

  const getTeacherWorkloadData = (teacherNameOrId: string | number) => {
    if (!teacherWorkloads || teacherWorkloads.length === 0) return null;
    const isId = typeof teacherNameOrId === "number" || (/^\d+$/.test(String(teacherNameOrId)) && Number(teacherNameOrId) > 0);
    const filtered = teacherWorkloads.filter(w => {
      if (isId && w.employee_id === Number(teacherNameOrId)) return true;
      const target = String(teacherNameOrId).trim().toLowerCase();
      const emp = w.employee_name.trim().toLowerCase();
      return emp === target || emp.includes(target) || target.includes(emp);
    });
    if (filtered.length === 0) return null;
    const totalHours = filtered.reduce((acc, curr) => acc + (curr.total_hours || 0), 0);
    const bachelorHours = filtered.filter(f => f.education_type_name === "Bakalavr" || f.education_type_code === "11").reduce((acc, curr) => acc + (curr.total_hours || 0), 0);
    const masterHours = filtered.filter(f => f.education_type_name === "Magistr" || f.education_type_code === "12").reduce((acc, curr) => acc + (curr.total_hours || 0), 0);
    return {
      employeeId: filtered[0].employee_id,
      teacherName: filtered[0].employee_name,
      departmentName: filtered[0].department_name,
      totalHours,
      bachelorHours,
      masterHours,
      subjectsCount: filtered.length,
      subjects: filtered
    };
  };

  // -----------------------------------------------------------------
  // FAN HUJJATLARI VA NASHRLAR KENGASHLAR ZANJIRI API FUNKSIYALARI
  // -----------------------------------------------------------------
  const uploadSingleFile = async (file: File): Promise<string> => {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`"${file.name}" fayl hajmi 10 MB dan oshmasligi kerak!`);
    }
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Faylni yuklashda xatolik yuz berdi");
    }
    const data = await res.json();
    return data.url;
  };

  const fetchCourseDocs = async (subjName?: string, tName?: string) => {
    setIsCourseDocsLoading(true);
    try {
      const p = new URLSearchParams();
      if (subjName) p.append("subject_name", subjName);
      if (tName) p.append("teacher_name", tName);
      const res = await fetch(`${API_BASE}/course-docs?${p.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCourseDocsList(data.data || []);
      }
    } catch (err) {
      console.error("Fan hujjatlarini yuklashda xatolik:", err);
    } finally {
      setIsCourseDocsLoading(false);
    }
  };

  const fetchPublications = async (subjName?: string, tName?: string) => {
    setIsPubsLoading(true);
    try {
      const p = new URLSearchParams();
      if (subjName) p.append("subject_name", subjName);
      if (tName) p.append("teacher_name", tName);
      const res = await fetch(`${API_BASE}/publications?${p.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPublicationsList(data.data || []);
      }
    } catch (err) {
      console.error("Nashrlar tavsiyanomasini yuklashda xatolik:", err);
    } finally {
      setIsPubsLoading(false);
    }
  };

  const fetchSubjectHemisDetails = async (subjName?: string, tName?: string, forceRefresh: boolean = false) => {
    setIsSubjectHemisResourcesLoading(true);
    try {
      const p = new URLSearchParams();
      if (subjName) {
        const cleanName = subjName.split("(")[0].trim();
        p.append("subject_name", cleanName);
      }
      if (forceRefresh) {
        p.append("force_refresh", "true");
      }
      const res = await fetch(`${API_BASE}/hemis/subject-resources?${p.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setActiveSubjectHemisResources(data.items || []);
      }
      if (subjName) {
        const cleanName = subjName.split("(")[0].trim();
        const csRes = await fetch(`${API_BASE}/hemis/curriculum-subjects?subject_name=${encodeURIComponent(cleanName)}`);
        if (csRes.ok) {
          const csData = await csRes.json();
          if (csData.items && csData.items.length > 0) {
            setActiveSubjectCurriculumSubject(csData.items[0]);
          } else {
            setActiveSubjectCurriculumSubject(null);
          }
        }
      }
    } catch (err) {
      console.error("HEMIS fan resurslarini olishda xatolik:", err);
    } finally {
      setIsSubjectHemisResourcesLoading(false);
    }
  };

  const fetchHemisAcademicData = async () => {
    try {
      const [statsRes, currsRes, scienceRes, docsRes, fullStatusRes] = await Promise.all([
        fetch(`${API_BASE}/hemis/academic-stats`).then(r => r.json()),
        fetch(`${API_BASE}/hemis/curriculums`).then(r => r.json()),
        fetch(`${API_BASE}/hemis/scientific-activity`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${API_BASE}/hemis/doctorate-students`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`${API_BASE}/hemis/sync-full-status`).then(r => r.json()).catch(() => ({ is_syncing: false }))
      ]);
      if (statsRes.success) {
        setHemisAcademicStats(statsRes.stats);
      }
      if (currsRes.success) {
        setHemisCurriculums(currsRes.items || []);
      }
      if (scienceRes.success) {
        setHemisScientificActivities(scienceRes.items || []);
      }
      if (docsRes.success) {
        setHemisDoctorateStudents(docsRes.items || []);
      }
      if (fullStatusRes.is_syncing !== undefined) {
        setIsFullAcademicSyncing(fullStatusRes.is_syncing);
      }
    } catch (err) {
      console.error("HEMIS o'quv rejalari ma'lumotlarini yuklashda xatolik:", err);
    }
  };

  const handleSyncHemisAcademic = async () => {
    setIsHemisAcademicSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/hemis/sync-academic`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setHemisAcademicStats(data.stats);
        await fetchHemisAcademicData();
        showAlert({
          title: "Sinxronlash yakunlandi",
          message: data.message || "HEMIS oʻquv rejalari va resurslari yangilandi!",
          type: "success"
        });
      } else {
        showAlert({
          title: "Xatolik",
          message: data.detail || "Sinxronlashda xatolik yuz berdi",
          type: "danger"
        });
      }
    } catch (err: any) {
      showAlert({
        title: "Tarmoq xatosi",
        message: err.message || "HEMIS serveri bilan bogʻlanishda xatolik",
        type: "danger"
      });
    } finally {
      setIsHemisAcademicSyncing(false);
    }
  };

  const handleTriggerFullAcademicSync = async () => {
    setIsFullAcademicSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/hemis/sync-full-academic`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showAlert({
          title: "Toʻliq sinxronizatsiya boshlandi",
          message: "HEMIS dan barcha 7200+ fan va 14500+ dars biriktiruvlari fonda yuklanmoqda. Natijalar avtomatik keshlanadi.",
          type: "info"
        });
        // 5 soniyadan keyin statistikani qayta yuklaymiz
        setTimeout(() => {
          fetchHemisAcademicData();
        }, 5000);
      }
    } catch (err: any) {
      showAlert({
        title: "Xatolik",
        message: err.message || "HEMIS fon sinxronizatsiyasini ishga tushirishda xatolik",
        type: "danger"
      });
      setIsFullAcademicSyncing(false);
    }
  };

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case "SYLLABUS": return "Fan sillabusi / Ishchi fan dasturi";
      case "WORK_PROGRAM": return "Ishchi oʻquv dasturi";
      case "LECTURE_NOTES": return "Maʼruzalar matni va taqdimotlar";
      case "PRACTICAL_GUIDE": return "Amaliy mashgʻulotlar uslubiy koʻrsatmasi";
      case "LAB_GUIDE": return "Laboratoriya ishlari uslubiy koʻrsatmasi";
      case "SEMINAR_GUIDE": return "Seminar mashgʻulotlari uslubiy koʻrsatmasi";
      case "INDEPENDENT_STUDY_GUIDE": return "Mustaqil taʼlim uslubiy koʻrsatmasi";
      case "ASSESSMENT_CRITERIA": return "Baholash mezonlari va nazorat savollari";
      default: return "Boshqa oʻquv-uslubiy material";
    }
  };

  const handleCloseSubjectCabinet = () => {
    setCourseDocsModalOpen(false);
    setWorkflowModalOpen(false);
    setPublicationModalOpen(false);
    setHemisSubjectModalOpen(false);
    setSelectedWorkflowSubject(null);
  };

  const handleOpenCourseDocs = (sub: any, teacherName: string) => {
    setSelectedWorkflowSubject({
      subject_name: sub.subject_name,
      department_name: sub.department_name,
      education_type_name: sub.education_type_name,
      teacher_name: teacherName,
      total_hours: sub.total_hours
    });
    setWorkflowSubTab("docs");
    const sName = (sub.subject_name || "").toLowerCase();
    const isOnlyAmaliy = sName.includes("amaliyot") || (sName.includes("amaliy") && !sName.includes("nazariy"));
    setTeacherTrainingRoles({
      hasLecture: !isOnlyAmaliy,
      hasPractical: true,
      hasLab: false,
      hasSeminar: false
    });
    setIsAddCourseDocFormOpen(false);
    fetchCourseDocs(sub.subject_name, teacherName);
    fetchSubjectHemisDetails(sub.subject_name, teacherName);
    fetchPublications(sub.subject_name, teacherName);
    setCourseDocsModalOpen(true);
  };

  const handleOpenPublicationWorkflow = (sub: any, teacherName: string) => {
    setSelectedWorkflowSubject({
      subject_name: sub.subject_name,
      department_name: sub.department_name,
      education_type_name: sub.education_type_name,
      teacher_name: teacherName,
      total_hours: sub.total_hours
    });
    setWorkflowSubTab("publications");
    setPubModalFormOpen(false);
    fetchCourseDocs(sub.subject_name, teacherName);
    fetchSubjectHemisDetails(sub.subject_name, teacherName);
    fetchPublications(sub.subject_name, teacherName);
    setCourseDocsModalOpen(true);
  };

  const handleOpenHemisSubjectResources = (sub: any, teacherName: string) => {
    setSelectedWorkflowSubject({
      subject_name: sub.subject_name,
      department_name: sub.department_name,
      education_type_name: sub.education_type_name,
      teacher_name: teacherName,
      total_hours: sub.total_hours
    });
    setWorkflowSubTab("hemis_resources");
    fetchCourseDocs(sub.subject_name, teacherName);
    fetchSubjectHemisDetails(sub.subject_name, teacherName);
    fetchPublications(sub.subject_name, teacherName);
    setCourseDocsModalOpen(true);
  };

  const handleOpenSubjectWorkflow = (sub: any, teacherName: string) => {
    handleOpenCourseDocs(sub, teacherName);
  };

  const handleUploadCourseDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseDocFile) {
      showAlert({ title: "Diqqat", message: "Iltimos, hujjat faylini tanlang (PDF/DOCX, 10MB gacha)", type: "warning" });
      return;
    }
    if (!newCourseDocTitle.trim()) {
      showAlert({ title: "Diqqat", message: "Hujjat sarlavhasi / mavzusini kiriting", type: "warning" });
      return;
    }
    setIsCourseDocUploading(true);
    try {
      const fileUrl = await uploadSingleFile(newCourseDocFile);
      const payload = {
        teacher_name: selectedWorkflowSubject?.teacher_name || currentUser?.name || "",
        subject_name: selectedWorkflowSubject?.subject_name || "",
        department_name: selectedWorkflowSubject?.department_name || currentUser?.department || "",
        academic_year: systemSettings?.academic_year || "2024-2025",
        doc_type: newCourseDocType,
        title: newCourseDocTitle.trim(),
        file_url: fileUrl,
        file_name: newCourseDocFile.name
      };
      const res = await fetch(`${API_BASE}/course-docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showAlert({
          title: "Muvaffaqiyatli",
          message: "Fan hujjati muvaffaqiyatli yuklandi va kafedra mudiriga koʻrib chiqish uchun uzatildi!",
          type: "success"
        });
        setNewCourseDocTitle("");
        setNewCourseDocFile(null);
        setIsAddCourseDocFormOpen(false);
        fetchCourseDocs(selectedWorkflowSubject?.subject_name, selectedWorkflowSubject?.teacher_name);
      } else {
        const err = await res.json().catch(() => ({}));
        showAlert({ title: "Xatolik", message: err.detail || "Hujjatni saqlashda xatolik", type: "danger" });
      }
    } catch (err: any) {
      showAlert({ title: "Yuklashda xatolik", message: err.message || "Fayl yuklanmadi", type: "danger" });
    } finally {
      setIsCourseDocUploading(false);
    }
  };

  const handleReviewCourseDocSubmit = async () => {
    if (!activeDocForReview) return;
    setIsCourseDocReviewing(true);
    try {
      const res = await fetch(`${API_BASE}/course-docs/${activeDocForReview.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: courseDocReviewRole,
          status: courseDocReviewStatus,
          comment: courseDocReviewComment
        })
      });
      if (res.ok) {
        showAlert({
          title: "Koʻrib chiqildi",
          message: courseDocReviewStatus === "APPROVED" 
            ? `${courseDocReviewRole === "mudir" ? "Kafedra mudiri" : "Dekan"} tomonidan hujjat maʼqullandi!` 
            : "Hujjat qaytarildi!",
          type: "success"
        });
        setCourseDocReviewModalOpen(false);
        setActiveDocForReview(null);
        setCourseDocReviewComment("");
        fetchCourseDocs(selectedWorkflowSubject?.subject_name, selectedWorkflowSubject?.teacher_name);
      } else {
        const err = await res.json().catch(() => ({}));
        showAlert({ title: "Xatolik", message: err.detail || "Koʻrib chiqishda xatolik", type: "danger" });
      }
    } catch {
      showAlert({ title: "Xatolik", message: "Server bilan bogʻlanishda xatolik", type: "danger" });
    } finally {
      setIsCourseDocReviewing(false);
    }
  };

  const handleDeleteCourseDocConfirm = (doc: CourseSyllabusDoc) => {
    showConfirm({
      title: "Hujjatni oʻchirish",
      message: `Haqiqatan ham "${doc.title}" hujjatini oʻchirmoqchimisiz?`,
      confirmText: "Ha, oʻchirish",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/course-docs/${doc.id}`, { method: "DELETE" });
          if (res.ok) {
            showAlert({ title: "Oʻchirildi", message: "Hujjat muvaffaqiyatli oʻchirildi", type: "success" });
            fetchCourseDocs(selectedWorkflowSubject?.subject_name, selectedWorkflowSubject?.teacher_name);
          }
        } catch {
          showAlert({ title: "Xatolik", message: "Oʻchirishda xatolik", type: "danger" });
        }
      }
    });
  };

  const handleCreatePublicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPubTitle.trim()) {
      showAlert({ title: "Diqqat", message: "Nashr toʻliq nomini kiriting", type: "warning" });
      return;
    }
    if (!newPubAuthors.trim()) {
      showAlert({ title: "Diqqat", message: "Muallif(lar) F.I.SH.ni kiriting", type: "warning" });
      return;
    }
    if (!fileManuscript || !fileInternalReview || !fileExternalReview || !fileCurriculum || !fileAntiplagiat) {
      showAlert({
        title: "Majburiy fayllar yetishmayapti",
        message: "Qoʻlyozma (PDF), Ichki taqriz (PDF), Tashqi taqriz (PDF), Fan dasturi (PDF) va Antiplagiat hisoboti (PDF) barchasi yuklanishi shart! (Har biri 10 MB dan oshmasligi lozim).",
        type: "warning"
      });
      return;
    }
    if (isNaN(newPubAntiplagiatScore) || newPubAntiplagiatScore < 0 || newPubAntiplagiatScore > 100) {
      showAlert({ title: "Diqqat", message: "Antiplagiat oʻzlashtirilmaganlik (originallik) foizi 0 va 100 oraligʻida boʻlishi kerak!", type: "warning" });
      return;
    }

    setIsPubSubmitting(true);
    try {
      const [manuscriptUrl, internalRevUrl, externalRevUrl, currUrl, antiUrl, workloadUrl] = await Promise.all([
        uploadSingleFile(fileManuscript),
        uploadSingleFile(fileInternalReview),
        uploadSingleFile(fileExternalReview),
        uploadSingleFile(fileCurriculum),
        uploadSingleFile(fileAntiplagiat),
        fileWorkloadExtract ? uploadSingleFile(fileWorkloadExtract) : Promise.resolve("")
      ]);

      const payload = {
        teacher_name: selectedWorkflowSubject?.teacher_name || currentUser?.name || "",
        subject_name: selectedWorkflowSubject?.subject_name || "",
        department_name: selectedWorkflowSubject?.department_name || currentUser?.department || "",
        academic_year: systemSettings?.academic_year || "2024-2025",
        pub_type: newPubType,
        title: newPubTitle.trim(),
        authors: newPubAuthors.trim(),
        co_authors: newPubCoAuthors.trim(),
        manuscript_file: manuscriptUrl,
        internal_review_file: internalRevUrl,
        internal_reviewer_name: newPubInternalReviewer.trim(),
        external_review_file: externalRevUrl,
        external_reviewer_name: newPubExternalReviewer.trim(),
        curriculum_file: currUrl,
        antiplagiarism_file: antiUrl,
        antiplagiarism_score: Number(newPubAntiplagiatScore),
        workload_extract_file: workloadUrl
      };

      const res = await fetch(`${API_BASE}/publications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showAlert({
          title: "Tavsiyanoma roʻyxatdan oʻtdi",
          message: "Adabiyot tavsiyanomasi qabul qilindi va 1-bosqich: Kafedra yigʻilishiga yoʻnaltirildi!",
          type: "success"
        });
        setPubModalFormOpen(false);
        setNewPubTitle("");
        setNewPubAuthors("");
        setNewPubCoAuthors("");
        setNewPubInternalReviewer("");
        setNewPubExternalReviewer("");
        setFileManuscript(null);
        setFileInternalReview(null);
        setFileExternalReview(null);
        setFileCurriculum(null);
        setFileAntiplagiat(null);
        setFileWorkloadExtract(null);
        fetchPublications(selectedWorkflowSubject?.subject_name, selectedWorkflowSubject?.teacher_name);
      } else {
        const err = await res.json().catch(() => ({}));
        showAlert({ title: "Xatolik", message: err.detail || "Nashr arizasini saqlashda xatolik", type: "danger" });
      }
    } catch (err: any) {
      showAlert({ title: "Fayllarni yuklashda xatolik", message: err.message || "Xatolik yuz berdi", type: "danger" });
    } finally {
      setIsPubSubmitting(false);
    }
  };

  const handleReviewStageSubmit = async () => {
    if (!activePubForReview) return;
    setIsStageReviewing(true);
    try {
      let protocolFileUrl = "";
      if (reviewProtocolFile) {
        protocolFileUrl = await uploadSingleFile(reviewProtocolFile);
      }
      const res = await fetch(`${API_BASE}/publications/${activePubForReview.id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: reviewStageName,
          status: reviewDecision,
          protocol_num: reviewProtocolNum,
          protocol_date: reviewProtocolDate,
          protocol_file: protocolFileUrl,
          comment: reviewComment
        })
      });
      if (res.ok) {
        showAlert({
          title: "Kengash qarori qayd etildi",
          message: reviewDecision === "APPROVED" 
            ? "Bosqich muvaffaqiyatli tasdiqlandi va keyingi bosqichga uzatildi!" 
            : "Adabiyot qaytarildi!",
          type: "success"
        });
        setReviewStageModalOpen(false);
        setActivePubForReview(null);
        setReviewProtocolNum("");
        setReviewProtocolDate("");
        setReviewProtocolFile(null);
        setReviewComment("");
        fetchPublications(selectedWorkflowSubject?.subject_name, selectedWorkflowSubject?.teacher_name);
      } else {
        const err = await res.json().catch(() => ({}));
        showAlert({ title: "Xatolik", message: err.detail || "Bosqichni tasdiqlashda xatolik", type: "danger" });
      }
    } catch (err: any) {
      showAlert({ title: "Xatolik", message: err.message || "Xatolik yuz berdi", type: "danger" });
    } finally {
      setIsStageReviewing(false);
    }
  };

  const handleSaveMyGovSubmit = async () => {
    if (!activePubForMyGov) return;
    if (!myGovAppNum.trim()) {
      showAlert({ title: "Diqqat", message: "my.gov.uz ariza raqamini kiriting", type: "warning" });
      return;
    }
    setIsMyGovSaving(true);
    try {
      let certUrl = "";
      if (ministryCertFile) {
        certUrl = await uploadSingleFile(ministryCertFile);
      }
      const res = await fetch(`${API_BASE}/publications/${activePubForMyGov.id}/mygov`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mygov_app_num: myGovAppNum.trim(),
          ministry_grif_num: ministryGrifNum.trim(),
          ministry_certificate_file: certUrl
        })
      });
      if (res.ok) {
        showAlert({
          title: "Saqlandi",
          message: "my.gov.uz va Vazirlik Grifi arizasi maʼlumotlari tizimda saqlandi!",
          type: "success"
        });
        setMyGovModalOpen(false);
        setActivePubForMyGov(null);
        setMyGovAppNum("");
        setMinistryGrifNum("");
        setMinistryCertFile(null);
        fetchPublications(selectedWorkflowSubject?.subject_name, selectedWorkflowSubject?.teacher_name);
      }
    } catch (err: any) {
      showAlert({ title: "Xatolik", message: err.message || "Saqlashda xatolik", type: "danger" });
    } finally {
      setIsMyGovSaving(false);
    }
  };

  const handleDeletePublicationConfirm = (pub: PublicationRecommendation) => {
    showConfirm({
      title: "Nashr arizasini oʻchirish",
      message: `Haqiqatan ham "${pub.title}" adabiyotining barcha kengash yozuvlarini oʻchirmoqchimisiz?`,
      confirmText: "Ha, oʻchirish",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/publications/${pub.id}`, { method: "DELETE" });
          if (res.ok) {
            showAlert({ title: "Oʻchirildi", message: "Nashr arizasi muvaffaqiyatli oʻchirildi", type: "success" });
            fetchPublications(selectedWorkflowSubject?.subject_name, selectedWorkflowSubject?.teacher_name);
          }
        } catch {
          showAlert({ title: "Xatolik", message: "Oʻchirishda xatolik", type: "danger" });
        }
      }
    });
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
      showAlert({
        title: "Xatolik yuz berdi",
        message: err.message || "Foydalanuvchi rolini oʻzgartirish jarayonida kutilmagan xatolik yuz berdi.",
        type: "danger"
      });
    }
  };

  const handleResetUserPassword = (username: string) => {
    showConfirm({
      title: "Parolni tiklashni tasdiqlaysizmi?",
      message: `@${username} xodimining maxfiy paroli birlamchi HEMIS ID raqamiga tiklanadi va tizimga kirishda majburiy yangi parol soʻraladi.`,
      confirmText: "Ha, tiklansin",
      cancelText: "Bekor qilish",
      type: "warning",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/admin/users/${username}/reset-password`, {
            method: "POST"
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || "Parolni tiklashda xatolik");
          setUserActionMessage(`@${username} xodimining paroli birlamchi HEMIS ID ga tiklandi`);
          fetchAdminData();
          setTimeout(() => setUserActionMessage(""), 5000);
          showAlert({
            title: "Parol tiklandi",
            message: `@${username} xodimining paroli dastlabki HEMIS ID raqamiga muvaffaqiyatli tiklandi.`,
            type: "success"
          });
        } catch (err: any) {
          showAlert({ title: "Xatolik", message: err.message || "Parolni tiklashda xatolik yuz berdi", type: "danger" });
        }
      }
    });
  };

  const handleToggleUserStatus = (username: string) => {
    const targetUser = adminUsers.find(u => u.username === username);
    const willBlock = targetUser ? targetUser.is_active : true;
    showConfirm({
      title: willBlock ? "Hisobni bloklashni tasdiqlaysizmi?" : "Hisobni faollashtirishni tasdiqlaysizmi?",
      message: willBlock
        ? `@${username} hisobi vaqtincha bloklanadi va u tizimga kira olmaydi.`
        : `@${username} hisobi qayta faollashtiriladi va tizimga kirish huquqi tiklanadi.`,
      confirmText: willBlock ? "Bloklash" : "Faollashtirish",
      cancelText: "Bekor qilish",
      type: willBlock ? "danger" : "success",
      onConfirm: async () => {
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
          showAlert({ title: "Xatolik", message: err.message || "Xatolik yuz berdi", type: "danger" });
        }
      }
    });
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

  const handleDeleteIndicator = (indId: string) => {
    showConfirm({
      title: "Mezonni arxivlash",
      message: `'${indId}' mezonini haqiqatan ham arxivlamoqchimisiz? Tarixiy arizalar va ularga qoʻyilgan ballar saqlanadi, lekin ushbu mezon boʻyicha yangi arizalar qabul qilinmaydi.`,
      confirmText: "Arxivlash",
      cancelText: "Bekor qilish",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/indicators/${indId}`, {
            method: "DELETE"
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || "Arxivlashda xatolik");
          fetchInitialData();
          fetchAdminData();
          showAlert({
            title: "Mezon arxivlandi",
            message: `'${indId}' mezoni muvaffaqiyatli arxivlandi.`,
            type: "success"
          });
        } catch (err: any) {
          showAlert({ title: "Xatolik", message: err.message || "Xatolik yuz berdi", type: "danger" });
        }
      }
    });
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

  // -------------------------------------------------------------
  // BAHOLOVCHILAR VA MUDDATLAR (EVALUATORS & PERIOD) AMALLARI
  // -------------------------------------------------------------
  const handleAddEvaluator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalFormName.trim()) {
      showAlert({ title: "Xatolik", message: "Baholovchi F.I.Sh. yoki nomini kiriting!", type: "warning" });
      return;
    }
    setIsEvaluatorSaving(true);
    try {
      const res = await fetch(`${API_BASE}/evaluators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: evalFormUsername.trim() || evalFormName.toLowerCase().replace(/\s+/g, "_"),
          name: evalFormName.trim(),
          assigned_category: evalFormCategory,
          role_type: evalFormRole,
          deadline_date: evalFormDeadline,
          is_active: true,
          assigned_by: currentUser?.name || "ADMIN"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Baholovchini saqlashda xatolik");
      
      setEvaluators(prev => [...prev, data]);
      setIsAddEvaluatorModalOpen(false);
      setEvalFormName("");
      setEvalFormUsername("");
      showAlert({
        title: "Baholovchi tayinlandi",
        message: `${data.name} muvaffaqiyatli '${data.assigned_category}' boʻyicha masʼul etib tayinlandi.`,
        type: "success"
      });
    } catch (err: any) {
      showAlert({ title: "Xatolik", message: err.message || "Xatolik yuz berdi", type: "danger" });
    } finally {
      setIsEvaluatorSaving(false);
    }
  };

  const handleDeleteEvaluator = (evalId: number, evalName: string) => {
    showConfirm({
      title: "Baholovchini chiqarish",
      message: `${evalName}ni baholovchilar roʻyxatidan chiqarishni tasdiqlaysizmi?`,
      confirmText: "Chiqarish",
      cancelText: "Bekor qilish",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/evaluators/${evalId}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Oʻchirishda xatolik");
          setEvaluators(prev => prev.filter(e => e.id !== evalId));
          showAlert({ title: "Oʻchirildi", message: "Baholovchi muvaffaqiyatli roʻyxatdan chiqarildi.", type: "success" });
        } catch (err: any) {
          showAlert({ title: "Xatolik", message: err.message || "Xatolik yuz berdi", type: "danger" });
        }
      }
    });
  };

  const handleSaveEvaluationPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch(`${API_BASE}/evaluation-period`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academic_year: systemSettings.academic_year,
          submissions_open: systemSettings.submissions_open,
          submission_deadline: systemSettings.submission_deadline,
          review_deadline: systemSettings.review_deadline,
          appeal_deadline: systemSettings.appeal_deadline,
          current_stage: systemSettings.current_stage,
          budget_cap_monthly: Number(systemSettings.budget_cap_monthly)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Muddatlarni saqlashda xatolik");
      setSystemSettings(data);
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
      showAlert({
        title: "Reglament saqlandi",
        message: "Baholash bosqichlari va muddatlari muvaffaqiyatli yangilandi.",
        type: "success"
      });
    } catch (err: any) {
      showAlert({ title: "Xatolik", message: err.message || "Xatolik yuz berdi", type: "danger" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // -------------------------------------------------------------
  // APELIYATSIYA (APPEALS) MODAL AMALLARI
  // -------------------------------------------------------------
  const handleOpenAppealModal = (sub: Submission) => {
    setSelectedSubForAppeal(sub);
    setAppealFormReason(`«${sub.title}» arizasi boʻyicha rad etilgan qarorga eʼtiroz: `);
    setAppealFormEvidence("");
    setIsAppealModalOpen(true);
  };

  const handleSubmitSubAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForAppeal) return;
    if (!appealFormReason.trim() || appealFormReason.trim().length < 10) {
      showAlert({ title: "Xatolik", message: "Apellyatsiya sababini batafsilroq yozing (kamida 10 belgi)!", type: "warning" });
      return;
    }
    setIsAppealSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/appeals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: selectedSubForAppeal.id,
          teacher_id: selectedSubForAppeal.teacher_id,
          teacher_name: selectedSubForAppeal.teacher_name,
          indicator_id: selectedSubForAppeal.indicator_id,
          title: selectedSubForAppeal.title,
          claimed_ball: selectedSubForAppeal.claimed_ball,
          reviewed_ball: selectedSubForAppeal.ball,
          initial_reviewer: selectedSubForAppeal.reviewer_name || "Kafedra mudiri",
          initial_rejection_reason: selectedSubForAppeal.rejection_reason || selectedSubForAppeal.reviewer_comment,
          reason: appealFormReason.trim(),
          evidence_file: appealFormEvidence.trim() || selectedSubForAppeal.file_name
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Apellyatsiya yuborishda xatolik");

      setAppeals(prev => [data, ...prev]);
      setIsAppealModalOpen(false);
      setSelectedSubForAppeal(null);
      showAlert({
        title: "Apellyatsiya qabul qilindi",
        message: `Ariza muvaffaqiyatli qabul qilindi (#${data.id}). Apellyatsiya komissiyasi tomonidan koʻrib chiqiladi.`,
        type: "success"
      });
      setActivePage("appeals");
    } catch (err: any) {
      showAlert({ title: "Xatolik", message: err.message || "Xatolik yuz berdi", type: "danger" });
    } finally {
      setIsAppealSubmitting(false);
    }
  };

  const handleOpenReviewAppealModal = (appeal: Appeal) => {
    setSelectedAppealForReview(appeal);
    setAppealReviewStatus("ACCEPTED");
    setAppealReviewBall(appeal.claimed_ball || 0);
    setAppealReviewComment("");
    setIsReviewAppealModalOpen(true);
  };

  const handleSubmitAppealReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppealForReview) return;
    if (!appealReviewComment.trim()) {
      showAlert({ title: "Xatolik", message: "Komissiya xulosasi va qaror asosini kiritish majburiy!", type: "warning" });
      return;
    }
    setIsAppealReviewing(true);
    try {
      const res = await fetch(`${API_BASE}/appeals/${selectedAppealForReview.id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: appealReviewStatus,
          commission_member: currentUser?.name || "Apellyatsiya Komissiyasi",
          commission_comment: appealReviewComment.trim(),
          awarded_ball: appealReviewStatus === "REJECTED" ? 0 : Number(appealReviewBall)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Qarorni saqlashda xatolik");

      setAppeals(prev => prev.map(a => a.id === data.id ? data : a));
      setIsReviewAppealModalOpen(false);
      setSelectedAppealForReview(null);
      fetchInitialData();
      showAlert({
        title: "Qaror qabul qilindi",
        message: `Apellyatsiya boʻyicha qaror (${data.status}) tasdiqlandi va arizachining reytingiga tatbiq etildi.`,
        type: "success"
      });
    } catch (err: any) {
      showAlert({ title: "Xatolik", message: err.message || "Xatolik yuz berdi", type: "danger" });
    } finally {
      setIsAppealReviewing(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "ADMIN" || activeRole === "ADMIN") {
      fetchAdminData();
    }
  }, [currentUser?.role, activeRole]);

  useEffect(() => {
    if (activePage === "admin_hemis") {
      fetchHemisData();
      fetchHemisAcademicData();
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
      localStorage.setItem("kpi_active_role", user.role);
      
      // Agar oʻqituvchi yoki kafedra mudiri boʻlsa, filtrlarni oʻziga moslab mustahkamlaymiz
      if (user.role === "TEACHER") {
        setSelectedTeacherId(user.id);
        setSelectedDeptFilter(user.department || "ALL");
      } else if (user.role === "HEAD_OF_DEPT") {
        setSelectedDeptFilter(user.department || "ALL");
      }

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
        showAlert({ title: "Xatolik", message: "Sozlamalarni saqlashda xatolik yuz berdi", type: "danger" });
      }
    } catch {
      showAlert({ title: "Xatolik", message: "Serverga ulanishda xatolik yuz berdi", type: "danger" });
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
        showAlert({
          title: "Sinxronizatsiya muvaffaqiyatli",
          message: data.message || "HEMIS pedagog xodimlar bazasi toʻliq yangilandi.",
          type: "success"
        });
      } else {
        showAlert({ title: "Xatolik", message: data.detail || "Sinxronizatsiyada xatolik yuz berdi", type: "danger" });
      }
    } catch {
      showAlert({ title: "Xatolik", message: "HEMIS sinxronizatsiya soʻrovi bajarilmadi. Server holatini tekshiring.", type: "danger" });
    } finally {
      setIsHemisSyncing(false);
    }
  };

  // Barcha mavjud kafedralar ro'yxati
  const allDepartmentNames = Array.from(new Set(teachers.map(t => t.department))).filter(Boolean);

  // Tanlangan kafedra bo'yicha filtrlangan o'qituvchilar
  const filteredTeachersByDept = teachers.filter(t => {
    if (!selectedDeptFilter || selectedDeptFilter === "ALL") return true;
    return t.department.toLowerCase().includes(selectedDeptFilter.toLowerCase()) ||
           selectedDeptFilter.toLowerCase().includes(t.department.toLowerCase());
  });

  // Tanlangan yoki joriy oʻqituvchini aniqlash (Rollar boʻyicha qatʼiy chegaralangan)
  const currentTeacher = (() => {
    // 1. Agar TEACHER roli boʻlsa, u FAQAT OʻZINING hisobi boʻlishi shart!
    if (activeRole === "TEACHER" && currentUser) {
      const match = teachers.find(t => 
        t.id === currentUser.id || 
        (t.name && currentUser.name && t.name.toLowerCase().trim() === currentUser.name.toLowerCase().trim())
      );
      if (match) return match;
      return {
        id: currentUser.id,
        name: currentUser.name,
        department: currentUser.department || "Kafedra koʻrsatilmagan",
        faculty: currentUser.faculty || "Fakultet",
        position: currentUser.position || "Professor-oʻqituvchi",
        degree: currentUser.degree || "Darajasiz",
        fte: currentUser.fte || 1.0,
        track: "Taʼlim",
        is_first_year: false,
        scores: {
          normalized_score: 0,
          svetafor_zone: "red" as const,
          svetafor_label: "Baholanmagan",
          bonus_label: "Belgilanmagan",
          oqv: 0, ilm: 0, xal: 0, man: 0, jarima: 0, flex_applied: 0, raw_total: 0
        }
      };
    }

    // 2. Admin yoki Rektorat inspeksiyasi uchun
    if (selectedTeacherId) {
      const match = teachers.find(t => t.id === selectedTeacherId);
      if (match) return match;
    }
    if (filteredTeachersByDept.length > 0) return filteredTeachersByDept[0];
    return teachers[0] || null;
  })();

  // Svetafor stats
  const totalTeachersCount = teachers.length;
  const greenTeachers = teachers.filter(t => t.scores?.svetafor_zone === "green");
  const yellowTeachers = teachers.filter(t => t.scores?.svetafor_zone === "yellow");
  const redTeachers = teachers.filter(t => t.scores?.svetafor_zone === "red");

  const greenPct = totalTeachersCount > 0 ? Math.round((greenTeachers.length / totalTeachersCount) * 100) : 0;
  const yellowPct = totalTeachersCount > 0 ? Math.round((yellowTeachers.length / totalTeachersCount) * 100) : 0;
  const redPct = totalTeachersCount > 0 ? Math.round((redTeachers.length / totalTeachersCount) * 100) : 0;

  // DOI orqali ilmiy maqolani avtomatik topish
  const handleDoiLookup = async () => {
    if (!doiInput.trim()) {
      setModalNotification({ type: "error", message: "Iltimos, avval maqolaning DOI raqamini kiriting." });
      return;
    }
    setIsDoiLoading(true);
    setModalNotification(null);
    try {
      const res = await fetch(`${API_BASE}/doi/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doi: doiInput.trim() })
      });
      const data = await res.json();
      if (data.found) {
        setModalTitle(data.title);
        setModalAuthors(data.authors_count || 1);
        if (data.suggested_indicator) {
          setModalIndicator(data.suggested_indicator);
          const ind = indicators.find(i => i.id === data.suggested_indicator);
          if (ind) {
            setModalClaimedBall(Number((ind.max_ball / Math.max(1, data.authors_count || 1)).toFixed(1)));
          }
        }
        setModalNotification({
          type: "success",
          message: `Maqola topildi: "${data.title}" | Jurnal: ${data.journal || "Scopus/WoS"} (${data.quartile || ""}) | Mualliflar: ${data.authors_count}`
        });
      } else {
        setModalNotification({
          type: "error",
          message: "Kiritilgan DOI boʻyicha Crossref/Scopus dan maqola topilmadi. Maʼlumotlarni qoʻlda kiriting."
        });
      }
    } catch {
      setModalNotification({ type: "error", message: "DOI qidiruv serveri bilan aloqa oʻrnatilmadi." });
    } finally {
      setIsDoiLoading(false);
    }
  };

  // Submit new KPI result
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher) return;

    if (!systemSettings.submissions_open) {
      setModalNotification({
        type: "error",
        message: `Hozirda KPI hujjatlarini qabul qilish muddati yakunlangan yoki yopilgan. Oxirgi muddat: ${systemSettings.deadline_date}`
      });
      return;
    }

    if (!modalTitle.trim()) {
      setModalNotification({ type: "error", message: "Iltimos, faoliyat natijasi yoki hujjat nomini toʻliq kiriting." });
      return;
    }

    if (!modalClaimedBall || modalClaimedBall <= 0) {
      setModalNotification({ type: "error", message: "Daʻvo qilinayotgan ball 0 dan yuqori boʻlishi lozim." });
      return;
    }

    setIsSubmittingNewKpi(true);
    setModalNotification(null);
    try {
      let finalFileName = modalUploadedFileName || "tasdiqlovchi_hujjat.pdf";

      // Agar haqiqiy fayl tanlangan bo'lsa, uni serverga yuklaymiz
      if (modalUploadedFile) {
        try {
          const formData = new FormData();
          formData.append("file", modalUploadedFile);
          const upRes = await fetch(`${API_BASE}/upload`, {
            method: "POST",
            body: formData
          });
          const upData = await upRes.json();
          if (upRes.ok && upData.filename) {
            finalFileName = upData.filename;
          }
        } catch (uploadErr) {
          console.warn("Fayl yuklashda xatolik:", uploadErr);
        }
      }

      let res;
      if (editingSubmission) {
        res = await fetch(`${API_BASE}/submissions/${editingSubmission.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            indicator_id: modalIndicator,
            title: modalTitle.trim(),
            doi: doiInput.trim() || undefined,
            authors_count: Number(modalAuthors) || 1,
            claimed_ball: Number(modalClaimedBall),
            description: modalDescription.trim() || undefined,
            file_name: finalFileName
          })
        });
      } else {
        res = await fetch(`${API_BASE}/submissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teacher_id: currentTeacher.id,
            indicator_id: modalIndicator,
            title: modalTitle.trim(),
            doi: doiInput.trim() || undefined,
            authors_count: Number(modalAuthors) || 1,
            submitted_date: modalDate || new Date().toISOString().split("T")[0],
            claimed_ball: Number(modalClaimedBall),
            description: modalDescription.trim() || undefined,
            file_name: finalFileName
          })
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setModalNotification({ type: "error", message: data.detail || "Amalni bajarishda xatolik yuz berdi." });
        return;
      }

      if (editingSubmission) {
        setSubmissions(submissions.map(s => s.id === data.id ? data : s));
        setModalNotification({
          type: "success",
          message: `Faoliyat natijasi muvaffaqiyatli tahrirlandi! Daʻvo qilingan ball: ${data.claimed_ball} ball.`
        });
      } else {
        setSubmissions([data, ...submissions]);
        setModalNotification({
          type: "success",
          message: `Arizangiz muvaffaqiyatli qabul qilindi! Daʻvo qilingan ball: ${data.claimed_ball} ball.`
        });
      }

      setTimeout(() => {
        setIsAddModalOpen(false);
        setEditingSubmission(null);
        setModalNotification(null);
        setModalTitle("");
        setDoiInput("");
        setModalDescription("");
        setModalUploadedFile(null);
        setModalUploadedFileName("");
      }, 1500);
    } catch {
      setModalNotification({ type: "error", message: "Arizani yuborishda xatolik yuz berdi. Iltimos, qayta urinib koʻring." });
    } finally {
      setIsSubmittingNewKpi(false);
    }
  };

  // Baholanmagan arizani tahrirlash modalini ochish
  const openEditModal = (sub: Submission) => {
    setEditingSubmission(sub);
    setModalIndicator(sub.indicator_id);
    setModalTitle(sub.title);
    setDoiInput(sub.doi || "");
    setModalAuthors(sub.authors_count || 1);
    setModalDate(sub.submitted_date || new Date().toISOString().split("T")[0]);
    setModalClaimedBall(sub.claimed_ball ?? sub.ball ?? 0);
    setModalDescription(sub.description || "");
    setModalUploadedFile(null);
    setModalUploadedFileName(sub.file_name || "");
    setModalNotification(null);
    setIsAddModalOpen(true);
  };

  // Baholanmagan arizani o'chirish
  const handleDeleteSubmission = (sub: Submission) => {
    showConfirm({
      title: "Arizani oʻchirishni tasdiqlaysizmi?",
      message: `«${sub.title}» sarlavhali faoliyat natijasi tizimdan butunlay oʻchiriladi. Bu amalni qaytarib boʻlmaydi.`,
      confirmText: "Ha, oʻchirilsin",
      cancelText: "Bekor qilish",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/submissions/${sub.id}`, {
            method: "DELETE"
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || "Arizani oʻchirishda xatolik yuz berdi");
          setSubmissions(prev => prev.filter(s => s.id !== sub.id));
          showAlert({
            title: "Muvaffaqiyatli oʻchirildi",
            message: `Ariza tizimdan butunlay oʻchirildi (#${sub.id}).`,
            type: "success"
          });
        } catch (err: any) {
          showAlert({
            title: "Xatolik",
            message: err.message || "Arizani oʻchirishda xatolik yuz berdi",
            type: "danger"
          });
        }
      }
    });
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
      showAlert({
        title: "Qaror qayd etildi",
        message: data.message || "Arizaning holati muvaffaqiyatli saqlandi.",
        type: "success"
      });
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
      showAlert({
        title: "Apellyatsiya qabul qilindi",
        message: `Apellyatsiya arizangiz #${newAppeal.id} raqami bilan qabul qilindi. Maxsus komissiya 3 ish kunida koʻrib chiqadi.`,
        type: "success"
      });
    } catch {
      showAlert({
        title: "Xatolik",
        message: "Apellyatsiyani yuborishda xatolik yuz berdi. Iltimos qayta urinib koʻring.",
        type: "danger"
      });
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

  // Pagination calculations: My Submissions (O'qituvchining o'z arizalari)
  const mySubmissionsList = currentTeacher 
    ? submissions.filter(s => s.teacher_id === currentTeacher.id) 
    : [];
  const totalMySubsPages = Math.ceil(mySubmissionsList.length / mySubsPerPage) || 1;
  const currentSafeMySubsPage = Math.max(1, Math.min(mySubsPage, totalMySubsPages));
  const pagedMySubmissions = mySubmissionsList.slice(
    (currentSafeMySubsPage - 1) * mySubsPerPage,
    currentSafeMySubsPage * mySubsPerPage
  );

  // Pagination calculations: Review Submissions (Mudir/Dekan/Admin verifikatsiyasi)
  const mudirDept = currentUser?.department || "";
  const reviewSubmissionsList = submissions.filter(s => 
    s.status === "pending" && 
    s.teacher_id !== currentUser?.id && 
    (!mudirDept || (s.dept && (s.dept.toLowerCase().includes(mudirDept.toLowerCase()) || mudirDept.toLowerCase().includes(s.dept.toLowerCase()))))
  );
  const totalReviewSubsPages = Math.ceil(reviewSubmissionsList.length / reviewSubsPerPage) || 1;
  const currentSafeReviewSubsPage = Math.max(1, Math.min(reviewSubsPage, totalReviewSubsPages));
  const pagedReviewSubmissions = reviewSubmissionsList.slice(
    (currentSafeReviewSubsPage - 1) * reviewSubsPerPage,
    currentSafeReviewSubsPage * reviewSubsPerPage
  );

  // Pagination calculations: Appeals (Apellyatsiyalar - Rollar kesimida izolyatsiya)
  const roleFilteredAppeals = appeals.filter(a => {
    // 1. ADMIN va RECTORATE: Filial bo'yicha barcha apellyatsiyalarni ko'radi
    if (activeRole === "ADMIN" || activeRole === "RECTORATE") {
      return true;
    }

    // 2. DEAN (Fakultet dekani): O'z fakultetidagi barcha kafedralar o'qituvchilari yoki shaxsiy arizalari
    if (activeRole === "DEAN") {
      if (a.teacher_id === currentUser?.id) return true;
      if (currentUser?.name && a.teacher_name && a.teacher_name.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
      const teacherObj = teachers.find(t => t.id === a.teacher_id || (t.name && a.teacher_name && t.name.toLowerCase() === a.teacher_name.toLowerCase()));
      if (teacherObj && currentUser?.faculty && teacherObj.department) {
        const facName = currentUser.faculty.toLowerCase();
        const facultyDepts = structureHierarchy?.faculties
          ?.find(f => f.name.toLowerCase().includes(facName) || facName.includes(f.name.toLowerCase()))
          ?.departments.map(d => d.name.toLowerCase()) || [];
        if (facultyDepts.some(d => teacherObj.department.toLowerCase().includes(d))) return true;
      }
      return false;
    }

    // 3. HEAD_OF_DEPT (Kafedra mudiri): O'z kafedrasi xodimlari arizalari va o'zining shaxsiy arizalari
    if (activeRole === "HEAD_OF_DEPT") {
      if (a.teacher_id === currentUser?.id) return true;
      if (currentUser?.name && a.teacher_name && a.teacher_name.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
      const teacherObj = teachers.find(t => t.id === a.teacher_id || (t.name && a.teacher_name && t.name.toLowerCase() === a.teacher_name.toLowerCase()));
      if (teacherObj && currentUser?.department) {
        const myDept = currentUser.department.toLowerCase();
        const tDept = (teacherObj.department || "").toLowerCase();
        if (tDept.includes(myDept) || myDept.includes(tDept)) return true;
      }
      return false;
    }

    // 4. TEACHER (O'qituvchi): FAQAT VA FAQAT O'ZIGA TEGISHLI APELLATSIYALARNI KO'RADI!
    const isMyId = a.teacher_id === currentUser?.id;
    const isMyName = Boolean(
      currentUser?.name && a.teacher_name &&
      a.teacher_name.toLowerCase().replace(/^(dots\.|prof\.)\s*/, '').trim() === currentUser.name.toLowerCase().replace(/^(dots\.|prof\.)\s*/, '').trim()
    );
    return isMyId || isMyName;
  });

  const totalAppealsPages = Math.ceil(roleFilteredAppeals.length / appealsPerPage) || 1;
  const currentSafeAppealsPage = Math.max(1, Math.min(appealsPage, totalAppealsPages));
  const pagedAppeals = roleFilteredAppeals.slice(
    (currentSafeAppealsPage - 1) * appealsPerPage,
    currentSafeAppealsPage * appealsPerPage
  );

  // Pagination calculations: Admin Logs (Audit qaydnomasi)
  const totalAdminLogsPages = Math.ceil(adminLogs.length / adminLogsPerPage) || 1;
  const currentSafeAdminLogsPage = Math.max(1, Math.min(adminLogsPage, totalAdminLogsPages));
  const pagedAdminLogs = adminLogs.slice(
    (currentSafeAdminLogsPage - 1) * adminLogsPerPage,
    currentSafeAdminLogsPage * adminLogsPerPage
  );

  // Pagination calculations: Indicators Catalog (Mezonlar katalogi)
  const totalCatalogIndicatorsPages = Math.ceil(filteredIndicators.length / indicatorsPerPage) || 1;
  const currentSafeCatalogIndicatorsPage = Math.max(1, Math.min(indicatorsPage, totalCatalogIndicatorsPages));
  const pagedCatalogIndicators = filteredIndicators.slice(
    (currentSafeCatalogIndicatorsPage - 1) * indicatorsPerPage,
    currentSafeCatalogIndicatorsPage * indicatorsPerPage
  );

  // =========================================================================
  // SSR Hydration xavfsizligi: Server va mijoz dastlabki renderini 100% bir xil saqlash
  // =========================================================================
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        <div className="text-center z-10 animate-in fade-in duration-300">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-125" />
            <img
              src="/logo-kpi.png"
              alt="OʻzMU JF KPI Tizimi"
              className="w-20 h-20 rounded-full shadow-2xl border-2 border-blue-400/50 object-contain bg-slate-900 p-0.5 relative z-10"
            />
          </div>
          <div className="flex items-center justify-center gap-2.5 mt-3 text-blue-400 text-xs font-semibold">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>KPI axborot tizimi yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

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
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="HEMIS ID yoki shaxsiy parol"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                    title={showLoginPassword ? "Parolni yashirish" : "Parolni koʻrish"}
                    aria-label={showLoginPassword ? "Parolni yashirish" : "Parolni koʻrish"}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
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
                <div className="relative">
                  <input
                    type={showForceCurrentPassword ? "text" : "password"}
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="HEMIS ID raqamingiz"
                    className={`w-full pl-3 pr-9 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                      theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForceCurrentPassword(!showForceCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    title={showForceCurrentPassword ? "Yashirish" : "Koʻrish"}
                  >
                    {showForceCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                  Yangi maxfiy parol (kamida 6 ta belgi)
                </label>
                <div className="relative">
                  <input
                    type={showForceNewPassword ? "text" : "password"}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Yangi mustahkam parol"
                    className={`w-full pl-3 pr-9 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                      theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForceNewPassword(!showForceNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    title={showForceNewPassword ? "Yashirish" : "Koʻrish"}
                  >
                    {showForceNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                  Yangi parolni takrorlang
                </label>
                <div className="relative">
                  <input
                    type={showForceConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Parolni qayta tering"
                    className={`w-full pl-3 pr-9 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                      theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForceConfirmPassword(!showForceConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    title={showForceConfirmPassword ? "Yashirish" : "Koʻrish"}
                  >
                    {showForceConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
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

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 border-r flex flex-col z-40 shadow-xl lg:shadow-sm transition-all duration-300 ${
        mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
      } ${
        sidebarCollapsed ? "lg:w-20" : "lg:w-64"
      } ${
        theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        {/* Brand & Collapse Header */}
        <div className={`border-b flex items-center ${
          sidebarCollapsed ? "p-3 lg:flex-col lg:gap-2 lg:justify-center p-4 justify-between" : "p-4 justify-between"
        } ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-blue-500/30 bg-white dark:bg-slate-800 p-0.5 overflow-hidden transition-transform hover:scale-105">
              <img
                src="/logo-kpi.png"
                alt="OʻzMU JF KPI"
                className="w-full h-full object-contain"
              />
            </div>
            {(!sidebarCollapsed || mobileMenuOpen) && (
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
            title={mobileMenuOpen ? "Menyuni yopish" : sidebarCollapsed ? "Menyuni kengaytirish" : "Menyuni ixchamlash"}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === "dark" ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="lg:hidden">
              <X className="w-4 h-4" />
            </span>
            <span className="hidden lg:inline">
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </span>
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
                onClick={() => {
                  setActivePage("dashboard");
                  setMobileMenuOpen(false);
                }}
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
                onClick={() => {
                  setActivePage("subjects");
                  setMobileMenuOpen(false);
                }}
                title="Kafedra fanlari va oʻquv yuklamalari"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "justify-between px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "subjects"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BookOpen className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  {!sidebarCollapsed && <span className="truncate">Fanlar va yuklama</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                    activePage === "subjects"
                      ? "bg-blue-800 text-emerald-300"
                      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  }`}>
                    HEMIS
                  </span>
                )}
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
                onClick={() => {
                  setActivePage("dashboard");
                  setMobileMenuOpen(false);
                }}
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
                onClick={() => {
                  setActivePage("subjects");
                  setMobileMenuOpen(false);
                }}
                title="Fakultet oʻqituvchilari oʻquv yuklamalari"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "subjects"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {!sidebarCollapsed && <span>Oʻquv yuklamalari</span>}
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
                onClick={() => {
                  setActivePage("dashboard");
                  setMobileMenuOpen(false);
                }}
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
                onClick={() => {
                  setActivePage("subjects");
                  setMobileMenuOpen(false);
                }}
                title="Filial oʻqituvchilari oʻquv yuklamalari"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "subjects"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {!sidebarCollapsed && <span>Oʻquv yuklamalari</span>}
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
                onClick={() => {
                  setActivePage("dashboard");
                  setMobileMenuOpen(false);
                }}
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
                onClick={() => {
                  setActivePage("subjects");
                  setMobileMenuOpen(false);
                }}
                title="Mening fanlarim va dars yuklamam"
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2 py-2.5" : "justify-between px-3 py-2.5"} rounded-lg text-xs font-semibold transition-colors ${
                  activePage === "subjects"
                    ? "bg-blue-900 text-white shadow-sm"
                    : theme === "dark"
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BookOpen className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  {!sidebarCollapsed && <span className="truncate">Fanlarim va yuklama</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                    activePage === "subjects"
                      ? "bg-blue-800 text-emerald-300"
                      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  }`}>
                    {(() => {
                      const wl = currentUser ? getTeacherWorkloadData(currentUser.hemis_id || currentUser.name) : null;
                      return wl?.totalHours ? `${wl.totalHours} s.` : "HEMIS";
                    })()}
                  </span>
                )}
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
            onClick={() => setActivePage("profile")}
            title="Mening profilim va hisob xavfsizligi"
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center p-2" : "gap-2.5 p-2 text-left"
            } rounded-lg border transition-all ${
              activePage === "profile"
                ? "bg-blue-900 text-white border-blue-800 shadow-md ring-2 ring-blue-500/20"
                : theme === "dark"
                ? "bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 text-slate-200"
                : "bg-white border-slate-200/80 hover:bg-slate-100 text-slate-800 shadow-xs"
            }`}
          >
            {currentUser.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-xs flex-shrink-0 bg-blue-900"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                  const fb = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fb) fb.style.display = "flex";
                }}
              />
            ) : null}
            <div className={`w-8 h-8 rounded-full items-center justify-center font-bold text-xs flex-shrink-0 ${
              activePage === "profile" ? "bg-white text-blue-900 shadow-xs" : "bg-blue-900 text-white"
            } ${currentUser.image ? "hidden" : "flex"}`}>
              {currentUser.name.charAt(0)}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate leading-tight">{currentUser.name}</div>
                <div className={`text-[10px] font-medium truncate flex items-center gap-1 mt-0.5 ${
                  activePage === "profile" ? "text-blue-200" : "text-blue-500"
                }`}>
                  <UserCog className="w-3 h-3" />
                  <span>Mening profilim</span>
                </div>
              </div>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={promptLogout}
            title="Tizimdan xavfsiz chiqish"
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors`}
          >
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>Tizimdan chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ml-0 ${
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      }`}>
        {/* Top Header */}
        <header className={`sticky top-0 z-20 h-16 border-b px-3 sm:px-6 flex items-center justify-between backdrop-blur-md transition-colors ${
          theme === "dark" ? "bg-slate-900/95 border-slate-800 text-slate-100" : "bg-white/95 border-slate-200 text-slate-900"
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 cursor-pointer ${
                theme === "dark" ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              }`}
              title="Menyuni ochish / yopish"
            >
              <Menu className="w-4 h-4" />
            </button>

            <h2 className="text-xs sm:text-sm font-bold truncate max-w-[100px] sm:max-w-[180px] md:max-w-xs lg:max-w-md">
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
              {activePage === "profile" && "Mening profilim va hisob xavfsizligi"}
              {activePage === "subjects" && "HEMIS oʻquv yuklamasi va fanlar reyestri"}
            </h2>

            <span className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
              theme === "dark" ? "bg-blue-950 text-blue-300 border border-blue-800" : "bg-blue-100 text-blue-900"
            }`}>
              {systemSettings.academic_year}
            </span>

            {/* Jonli Muddat Taymeri (Navbar Real-time Countdown Timer) */}
            <NavbarCountdownTimer
              settings={systemSettings}
              theme={theme}
              onOpenSettings={currentUser?.role === "ADMIN" ? () => setActivePage("admin_settings") : undefined}
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Admin inspector view switcher (only visible to system admin) */}
            {currentUser.role === "ADMIN" && (
              <>
                {/* Desktop view switcher */}
                <div className={`hidden xl:flex items-center gap-1.5 p-1 rounded-lg border ${
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

                {/* Mobile & Tablet compact role select */}
                <div className={`xl:hidden flex items-center p-1 rounded-lg border text-xs ${
                  theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-200 text-slate-800"
                }`}>
                  <select
                    value={activeRole}
                    onChange={(e) => {
                      setActiveRole(e.target.value as any);
                      setActivePage("dashboard");
                    }}
                    className="bg-transparent font-bold text-xs focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="DEAN">Dekan</option>
                    <option value="HEAD_OF_DEPT">Mudir</option>
                    <option value="TEACHER">Oʻqituvchi</option>
                    <option value="RECTORATE">Rektorat</option>
                  </select>
                </div>
              </>
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

            {/* Quick KPI Submission button for teachers and department heads */}
            {(activeRole === "TEACHER" || activeRole === "HEAD_OF_DEPT") && (
              <button
                type="button"
                onClick={() => {
                  if (!systemSettings.submissions_open) {
                    showAlert({
                      title: "Hujjatlar qabuli yopiq",
                      message: `Hozirda yangi KPI faoliyat natijalarini qabul qilish muddati yakunlangan. Belgilangan oxirgi qabul muddati: ${systemSettings.deadline_date}`,
                      type: "warning"
                    });
                    return;
                  }
                  const firstInd = indicators[0] || { id: "1.1", max_ball: 6 };
                  setModalIndicator(firstInd.id);
                  setModalClaimedBall(firstInd.max_ball);
                  setModalAuthors(1);
                  setModalDate(new Date().toISOString().split("T")[0]);
                  setModalTitle("");
                  setModalDescription("");
                  setModalUploadedFile(null);
                  setModalUploadedFileName("");
                  setModalNotification(null);
                  setIsAddModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                title="Yangi KPI natijasini kiritish"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Yangi natija</span>
                <span className="sm:hidden">+ Natija</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <main className={`p-3 sm:p-5 lg:p-8 flex-1 transition-colors ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
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
                    onClick={promptSyncHemis}
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

              {/* HEMIS Teacher Workload Analytics Card */}
              <div className={`rounded-xl border shadow-sm p-6 ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>HEMIS Oʻqituvchilar Oʻquv Yuklamasi (Teacher Workload)</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          REST API
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Oʻqituvchilarning dars soatlari, biriktirilgan fanlari va taʼlim turlari (Bakalavr / Magistr) integratsiyasi
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSyncWorkloads}
                    disabled={isWorkloadsLoading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isWorkloadsLoading ? "animate-spin" : ""}`} />
                    <span>{isWorkloadsLoading ? "Sinxronlashtirilmoqda..." : "Yuklamalarni sinxronlash"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
                  <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jami yuklama qatorlari</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {workloadsSummary?.total_items || teacherWorkloads.length || 456} ta
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">HEMIS fan-oʻqituvchi yozuvlari</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Biriktirilgan oʻqituvchilar</div>
                    <div className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">
                      {workloadsSummary?.total_teachers || 179} nafar
                    </div>
                    <div className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">Oʻquv soatiga ega pedagoglar</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Jami oʻquv soatlari</div>
                    <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
                      {workloadsSummary?.total_hours?.toLocaleString() || "39,596"} soat
                    </div>
                    <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Akademik oʻquv yili hajmi</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-purple-100 dark:border-purple-950/60 bg-purple-50/50 dark:bg-purple-950/20">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">Taʼlim bosqichlari</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                        Bakalavr: {workloadsSummary?.bachelor_hours?.toLocaleString() || "38,828"} s.
                      </span>
                    </div>
                    <div className="text-[11px] text-purple-700/80 dark:text-purple-400/80 mt-0.5">
                      Magistratura: {workloadsSummary?.master_hours?.toLocaleString() || "768"} s.
                    </div>
                  </div>
                </div>
              </div>

              {/* HEMIS Academic Curriculums & Resources Card */}
              <div className={`rounded-xl border shadow-sm p-6 ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Oʻquv Rejalar va HEMIS Elektron Fan Resurslari</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          REST API v1
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Oʻquv reja mezonlari, kredit-modul soatlari, elektron oʻquv materiallari va yuklangan fayllar bazasi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSyncHemisAcademic}
                      disabled={isHemisAcademicSyncing || isFullAcademicSyncing}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isHemisAcademicSyncing ? "animate-spin" : ""}`} />
                      <span>{isHemisAcademicSyncing ? "Yangilanmoqda..." : "Tezkor sinxronlash"}</span>
                    </button>

                    <button
                      onClick={handleTriggerFullAcademicSync}
                      disabled={isFullAcademicSyncing || isHemisAcademicSyncing}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                    >
                      <Database className={`w-3.5 h-3.5 ${isFullAcademicSyncing ? "animate-pulse" : ""}`} />
                      <span>{isFullAcademicSyncing ? "Barcha fanlar yuklanmoqda..." : "Toʻliq sinxronlash (7200+ fan)"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Oʻquv Rejalar</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {hemisAcademicStats?.curriculums_count || hemisCurriculums.length || 197} ta
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Bakalavr, magistr</div>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Oʻquv Fanlari</div>
                    <div className="text-xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
                      {hemisAcademicStats?.curriculum_subjects_count?.toLocaleString() || "7,206"} ta
                    </div>
                    <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">100% toʻliq kesh</div>
                  </div>

                  <div className="p-3 rounded-xl border border-purple-100 dark:border-purple-950/60 bg-purple-50/50 dark:bg-purple-950/20">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">Dars Biriktiruv</div>
                    <div className="text-xl font-black text-purple-900 dark:text-purple-200 mt-1">
                      {hemisAcademicStats?.subject_teachers_count?.toLocaleString() || "14,536"} ta
                    </div>
                    <div className="text-[10px] text-purple-700/80 dark:text-purple-400/80 mt-0.5">Oʻqituvchi va guruhlar</div>
                  </div>

                  <div className="p-3 rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Fan Resurslari</div>
                    <div className="text-xl font-black text-blue-900 dark:text-blue-200 mt-1">
                      {hemisAcademicStats?.subject_resources_count?.toLocaleString() || "1,450+"} ta
                    </div>
                    <div className="text-[10px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">On-demand integratsiya</div>
                  </div>

                  <div className="p-3 rounded-xl border border-amber-100 dark:border-amber-950/60 bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Ilmiy Profillar</div>
                    <div className="text-xl font-black text-amber-900 dark:text-amber-200 mt-1">
                      {hemisAcademicStats?.scientific_activities_count || hemisScientificActivities.length || 271} ta
                    </div>
                    <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">Scopus, RG, h-index</div>
                  </div>

                  <div className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">Doktorantlar</div>
                    <div className="text-xl font-black text-indigo-900 dark:text-indigo-200 mt-1">
                      {hemisAcademicStats?.doctorate_students_count || hemisDoctorateStudents.length || 28} nafar
                    </div>
                    <div className="text-[10px] text-indigo-700/80 dark:text-indigo-400/80 mt-0.5">Ilmiy izlanuvchilar</div>
                  </div>
                </div>

                {/* Sub-tablar: O'quv rejalari, Ilmiy profillar, Doktorantlar */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                      <button
                        onClick={() => setHemisAcademicActiveTab("curriculums")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          hemisAcademicActiveTab === "curriculums"
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Oʻquv rejalari ({hemisCurriculums.length || 197})
                      </button>
                      <button
                        onClick={() => setHemisAcademicActiveTab("scientific")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          hemisAcademicActiveTab === "scientific"
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Ilmiy profillar va H-index ({hemisScientificActivities.length || 271})
                      </button>
                      <button
                        onClick={() => setHemisAcademicActiveTab("doctorates")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          hemisAcademicActiveTab === "doctorates"
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Doktorantlar reyestri ({hemisDoctorateStudents.length || 28})
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={hemisCurriculumFilter}
                        onChange={(e) => setHemisCurriculumFilter(e.target.value)}
                        placeholder="Katalogdan qidirish..."
                        className={`pl-8 pr-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 w-60 ${
                          theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                    </div>
                  </div>

                  {/* 1. O'quv rejalari jadvali */}
                  {hemisAcademicActiveTab === "curriculums" && (
                    hemisCurriculums.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className={`sticky top-0 z-10 border-b font-bold uppercase text-[10px] ${
                            theme === "dark" ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}>
                            <tr>
                              <th className="py-2.5 px-3">Oʻquv reja nomi</th>
                              <th className="py-2.5 px-3">Mutaxassislik</th>
                              <th className="py-2.5 px-3">Kafedra</th>
                              <th className="py-2.5 px-3 text-center">Oʻquv yili</th>
                              <th className="py-2.5 px-3 text-center">Taʼlim shakli</th>
                              <th className="py-2.5 px-3 text-center">Baholash tizimi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {hemisCurriculums
                              .filter(c => !hemisCurriculumFilter || c.name.toLowerCase().includes(hemisCurriculumFilter.toLowerCase()) || c.specialty_name.toLowerCase().includes(hemisCurriculumFilter.toLowerCase()) || c.specialty_code.includes(hemisCurriculumFilter))
                              .slice(0, 20)
                              .map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                                    {c.name}
                                  </td>
                                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                                    <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{c.specialty_code}</span> - {c.specialty_name}
                                  </td>
                                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                                    {c.department_name}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-[10px]">
                                      {c.education_year}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[10px] font-bold">
                                      {c.education_form}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-300 text-[11px]">
                                    {c.marking_system}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Oʻquv rejalari yuklanmoqda...
                      </div>
                    )
                  )}

                  {/* 2. Ilmiy profillar jadvali */}
                  {hemisAcademicActiveTab === "scientific" && (
                    <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className={`sticky top-0 z-10 border-b font-bold uppercase text-[10px] ${
                          theme === "dark" ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}>
                          <tr>
                            <th className="py-2.5 px-3">Oʻqituvchi / ID</th>
                            <th className="py-2.5 px-3">Ilmiy platforma</th>
                            <th className="py-2.5 px-3">Profil havolasi</th>
                            <th className="py-2.5 px-3 text-center">H-indeks</th>
                            <th className="py-2.5 px-3 text-center">Nashrlar soni</th>
                            <th className="py-2.5 px-3 text-center">Iqtiboslar</th>
                            <th className="py-2.5 px-3 text-center">Oʻquv yili</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {hemisScientificActivities
                            .filter(s => !hemisCurriculumFilter || s.scientific_platform.toLowerCase().includes(hemisCurriculumFilter.toLowerCase()) || s.profile_link.toLowerCase().includes(hemisCurriculumFilter.toLowerCase()) || String(s.employee_id).includes(hemisCurriculumFilter))
                            .slice(0, 30)
                            .map((s) => (
                              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                                  {s.employee_name || `Xodim #${s.employee_id}`}
                                </td>
                                <td className="py-2 px-3">
                                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                    s.scientific_platform === "Scopus"
                                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                      : s.scientific_platform === "ResearchGate"
                                      ? "bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                                      : "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                  }`}>
                                    {s.scientific_platform}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px] max-w-xs truncate">
                                  {s.profile_link.startsWith("http") ? (
                                    <a href={s.profile_link} target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700">
                                      {s.profile_link}
                                    </a>
                                  ) : (
                                    s.profile_link
                                  )}
                                </td>
                                <td className="py-2 px-3 text-center font-bold text-slate-900 dark:text-white">
                                  {s.h_index}
                                </td>
                                <td className="py-2 px-3 text-center text-slate-700 dark:text-slate-300 font-semibold">
                                  {s.publication_work_count} ta
                                </td>
                                <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                  {s.citation_count} ta
                                </td>
                                <td className="py-2 px-3 text-center text-[10px] text-slate-500">
                                  {s.education_year}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 3. Doktorantlar jadvali */}
                  {hemisAcademicActiveTab === "doctorates" && (
                    <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className={`sticky top-0 z-10 border-b font-bold uppercase text-[10px] ${
                          theme === "dark" ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}>
                          <tr>
                            <th className="py-2.5 px-3">F.I.SH.</th>
                            <th className="py-2.5 px-3">Dissertatsiya mavzusi</th>
                            <th className="py-2.5 px-3">Kafedra / Ixtisoslik</th>
                            <th className="py-2.5 px-3 text-center">Daraja turi</th>
                            <th className="py-2.5 px-3 text-center">Bosqich</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {hemisDoctorateStudents
                            .filter(d => !hemisCurriculumFilter || d.full_name.toLowerCase().includes(hemisCurriculumFilter.toLowerCase()) || d.dissertation_theme.toLowerCase().includes(hemisCurriculumFilter.toLowerCase()) || d.department_name.toLowerCase().includes(hemisCurriculumFilter.toLowerCase()))
                            .map((d) => (
                              <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                                  {d.full_name}
                                  <div className="text-[10px] text-slate-400 font-mono">{d.student_id_number}</div>
                                </td>
                                <td className="py-2 px-3 text-slate-700 dark:text-slate-300 max-w-sm">
                                  {d.dissertation_theme}
                                </td>
                                <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">{d.department_name}</div>
                                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">{d.specialty_code} - {d.specialty_name}</div>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 font-bold text-[10px]">
                                    {d.doctoral_type}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-center text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                                  {d.level}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-semibold text-xs leading-snug ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{emp.full_name}</span>
                                    {(() => {
                                      const wl = getTeacherWorkloadData(emp.id || emp.full_name);
                                      if (wl && wl.totalHours > 0) {
                                        return (
                                          <button
                                            onClick={() => setSelectedWorkloadTeacher({ name: emp.full_name, id: emp.id, department: emp.department })}
                                            title="HEMIS Oʻquv yuklamasini koʻrish"
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer"
                                          >
                                            <BookOpen className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                            <span>{wl.totalHours} soat ({wl.subjectsCount} fan)</span>
                                          </button>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
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
                    <UniversalPagination
                      currentPage={currentSafeHemisPage}
                      totalPages={totalHemisPages}
                      totalItems={filteredHemisEmployees.length}
                      itemsPerPage={hemisPerPage}
                      onPageChange={setHemisPage}
                      onItemsPerPageChange={setHemisPerPage}
                      perPageOptions={[15, 25, 50, 100]}
                      itemLabel="xodim"
                      theme={theme}
                    />
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

                {/* 4 Bosqichli Reglament va Muddatlar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}>
                      1. Ariza topshirish muddati
                    </label>
                    <input
                      type="date"
                      required
                      value={systemSettings.submission_deadline || systemSettings.deadline_date}
                      onChange={(e) => setSystemSettings({ ...systemSettings, submission_deadline: e.target.value, deadline_date: e.target.value })}
                      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                      }`}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Oʻqituvchilar natijalarni kiritadi</p>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}>
                      2. Baholash / Tekshirish muddati
                    </label>
                    <input
                      type="date"
                      required
                      value={systemSettings.review_deadline || "2026-11-05"}
                      onChange={(e) => setSystemSettings({ ...systemSettings, review_deadline: e.target.value })}
                      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                      }`}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Ekspertlar va mudirlar tekshiradi</p>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}>
                      3. Apellyatsiya topshirish muddati
                    </label>
                    <input
                      type="date"
                      required
                      value={systemSettings.appeal_deadline || "2026-11-15"}
                      onChange={(e) => setSystemSettings({ ...systemSettings, appeal_deadline: e.target.value })}
                      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                      }`}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Eʼtiroz arizalari qabul qilinadi</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}>
                      Joriy faol bosqich (Reglament statusi)
                    </label>
                    <select
                      value={systemSettings.current_stage || "ALL_OPEN"}
                      onChange={(e) => setSystemSettings({ ...systemSettings, current_stage: e.target.value })}
                      className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                        theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                      }`}
                    >
                      <option value="ALL_OPEN">Barcha jarayonlar faol (Sinov / Ochiq rejim)</option>
                      <option value="SUBMISSION_STAGE">1-bosqich: Faqat arizalar topshirish davri</option>
                      <option value="REVIEW_STAGE">2-bosqich: Ekspertlar tekshiruvi davri</option>
                      <option value="APPEAL_STAGE">3-bosqich: Apellyatsiya koʻrib chiqish davri</option>
                      <option value="CLOSED">4-bosqich: Yakuniy tasdiqlangan (Reyting yopiq)</option>
                    </select>
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

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveEvaluationPeriod}
                    disabled={isSavingSettings}
                    className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingSettings ? "Saqlanmoqda..." : "Reglament va sozlamalarni saqlash"}</span>
                  </button>
                </div>
              </form>

              {/* BAHOLOVCHILAR VA EKSPERTLAR KOMISSIYASI REYESTRI */}
              <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>Tayinlangan baholovchilar va ekspertlar komissiyasi</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Mezonlar yoʻnalishlari va kafedralar boʻyicha arizalarni tekshiruvchi masʼullar
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddEvaluatorModalOpen(true)}
                    className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>+ Yangi baholovchi tayinlash</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Baholovchi F.I.Sh.</th>
                        <th className="py-3 px-4">Masʼul yoʻnalishi / Mezon bloki</th>
                        <th className="py-3 px-4">Roli</th>
                        <th className="py-3 px-4">Baholash muddati</th>
                        <th className="py-3 px-4 text-center">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {evaluators.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                            Hozircha qoʻshimcha ekspertlar biriktirilmagan. "+ Yangi baholovchi tayinlash" orqali qoʻshing.
                          </td>
                        </tr>
                      ) : (
                        evaluators.map(ev => (
                          <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                              <div>{ev.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">@{ev.username}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                                {ev.assigned_category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                              {ev.role_type === "EXPERT" ? "Ilmiy/Oʻquv Eksperti" : ev.role_type === "COMMISSION" ? "Apellyatsiya Komissiyasi" : ev.role_type}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {ev.deadline_date || "2026-06-25"}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteEvaluator(ev.id, ev.name)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-md transition-colors"
                                title="Baholovchini roʻyxatdan chiqarish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
                      <UniversalPagination
                        currentPage={safePage}
                        totalPages={totalPages}
                        totalItems={blockFiltered.length}
                        itemsPerPage={indicatorsPerPage}
                        onPageChange={setIndicatorsPage}
                        onItemsPerPageChange={setIndicatorsPerPage}
                        perPageOptions={[10, 20, 40]}
                        itemLabel="mezon"
                        theme={theme}
                      />
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
                  <UniversalPagination
                    currentPage={currentSafeAdminUsersPage}
                    totalPages={totalAdminUsersPages}
                    totalItems={adminUsers.length}
                    itemsPerPage={adminUsersPerPage}
                    onPageChange={setAdminUsersPage}
                    onItemsPerPageChange={setAdminUsersPerPage}
                    perPageOptions={[15, 30, 50, 100]}
                    itemLabel="foydalanuvchi"
                    theme={theme}
                  />
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

          {/* ========================================================================= */}
          {/* PAGE: USER PROFILE & SECURITY (DEDICATED PAGE) */}
          {/* ========================================================================= */}
          {activePage === "profile" && currentUser && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Header card with gradient banner */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="h-32 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setActivePage("dashboard")}
                      className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/15"
                    >
                      <span>← Bosh sahifaga qaytish</span>
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12">
                  <div className="flex items-end gap-4">
                    <div className="relative flex-shrink-0">
                      {currentUser.image ? (
                        <img
                          src={currentUser.image}
                          alt={currentUser.name}
                          className="w-24 h-24 rounded-2xl object-cover shadow-xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                            const fb = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-black text-3xl items-center justify-center shadow-xl border-4 border-white dark:border-slate-900 ${
                          currentUser.image ? "hidden" : "flex"
                        }`}
                      >
                        {currentUser.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white" title="Faol seans">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                          {currentUser.role === "ADMIN" && "Tizim administratori"}
                          {currentUser.role === "DEAN" && "Fakultet dekani"}
                          {currentUser.role === "HEAD_OF_DEPT" && "Kafedra mudiri"}
                          {currentUser.role === "TEACHER" && "Professor-oʻqituvchi"}
                          {currentUser.role === "RECTORATE" && "Filial rahbariyati"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>HEMIS ID: <b className="text-blue-600 dark:text-blue-400 font-mono">{currentUser.username}</b></span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUser.faculty || "Filial fakulteti"}</span>
                        <span>•</span>
                        <span className="text-slate-600 dark:text-slate-400">{currentUser.department || "Kafedra koʻrsatilmagan"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Tizim holati:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Faol seans
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                    <span>HEMIS integratsiyasi</span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">Faol ulangan</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">HEMIS ID: {currentUser.username}</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                    <span>Lavozimi va stavka</span>
                    <Briefcase className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                    {currentUser.position || "Oʻqituvchi"}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{currentUser.fte || 1.0} pedagogik stavka</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                    <span>Ilmiy unvoni</span>
                    <Award className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                    {currentUser.degree || "Darajasiz"}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{currentUser.faculty || "Filial tuzilmasi"}</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                    <span>Hisob xavfsizligi</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Himoyalangan</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Rate-limit & Lockout faol</div>
                </div>
              </div>

              {/* Main Content Grid: Left Info & Right Password Change */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Details & Organization info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Detailed Info Card */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Rasmiy xizmat va kadrlar maʼlumotlari
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Toʻliq F.I.Sh:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{currentUser.name}</span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">HEMIS login (Tizim ID):</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{currentUser.username}</span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Fakultet:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {currentUser.faculty || "Filial fakulteti"}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Kafedra:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {currentUser.department || "Kafedra biriktirilmagan"}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Lavozim:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {currentUser.position || "Professor-oʻqituvchi"}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Pedagogik stavka:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {currentUser.fte || 1.0} stavka
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Highlights */}
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Faol xavfsizlik protokollari
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Brute-force himoyasi
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          5 marta xato terilganda hisob 15 daqiqaga muzlatiladi
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          IP Rate Limiting
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Shubhali IP manzillardan ommaviy soʻrovlar cheklangan
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Avtomatik seans
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          30 daqiqa harakatsizlikda seans xavfsiz yakunlanadi
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 1 Col: Password Change Card */}
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                      <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          Maxfiy parolni yangilash
                        </h4>
                        <p className="text-[11px] text-slate-400">Shaxsiy hisobingiz xavfsizligini taʼminlang</p>
                      </div>
                    </div>

                    {profPasswordError && (
                      <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{profPasswordError}</span>
                      </div>
                    )}

                    {profPasswordSuccess && (
                      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl font-medium flex items-center gap-2">
                        <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                        <span>{profPasswordSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleUpdateProfilePassword} className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Joriy maxfiy parol
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowProfCurrentPassword(!showProfCurrentPassword)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            {showProfCurrentPassword ? <><EyeOff className="w-3 h-3" /> Yashirish</> : <><Eye className="w-3 h-3" /> Koʻrish</>}
                          </button>
                        </div>
                        <input
                          type={showProfCurrentPassword ? "text" : "password"}
                          required
                          value={profCurrentPassword}
                          onChange={(e) => setProfCurrentPassword(e.target.value)}
                          placeholder="Hozirgi parolingiz"
                          className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Yangi maxfiy parol
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowProfNewPassword(!showProfNewPassword)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            {showProfNewPassword ? <><EyeOff className="w-3 h-3" /> Yashirish</> : <><Eye className="w-3 h-3" /> Koʻrish</>}
                          </button>
                        </div>
                        <input
                          type={showProfNewPassword ? "text" : "password"}
                          required
                          value={profNewPassword}
                          onChange={(e) => setProfNewPassword(e.target.value)}
                          placeholder="Kamida 6 ta belgi"
                          className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Yangi parolni takrorlang
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowProfConfirmPassword(!showProfConfirmPassword)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            {showProfConfirmPassword ? <><EyeOff className="w-3 h-3" /> Yashirish</> : <><Eye className="w-3 h-3" /> Koʻrish</>}
                          </button>
                        </div>
                        <input
                          type={showProfConfirmPassword ? "text" : "password"}
                          required
                          value={profConfirmPassword}
                          onChange={(e) => setProfConfirmPassword(e.target.value)}
                          placeholder="Parolni qayta tering"
                          className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isProfPasswordSaving}
                        className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{isProfPasswordSaving ? "Yangilanmoqda..." : "Yangi parolni saqlash"}</span>
                      </button>
                    </form>
                  </div>
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
                    {adminLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                          Tizimda audit qaydnomalari mavjud emas.
                        </td>
                      </tr>
                    ) : (
                      pagedAdminLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-slate-400 dark:text-slate-500">#{log.id}</td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">{log.time}</td>
                          <td className="py-3 px-4 font-semibold text-blue-900 dark:text-blue-400">@{log.user}</td>
                          <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{log.action}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination Bar for Admin Logs */}
                <UniversalPagination
                  currentPage={currentSafeAdminLogsPage}
                  totalPages={totalAdminLogsPages}
                  totalItems={adminLogs.length}
                  itemsPerPage={adminLogsPerPage}
                  onPageChange={setAdminLogsPage}
                  onItemsPerPageChange={setAdminLogsPerPage}
                  perPageOptions={[12, 25, 50]}
                  itemLabel="qayd"
                  theme={theme}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GENERAL VIEWS: TEACHER / HEAD OF DEPT / RECTORATE DASHBOARD */}
          {/* ========================================================================= */}
          {activePage === "dashboard" && activeRole !== "ADMIN" && (
            <div>
              {/* Svetafor Banner (Faqat filial miqyosidagi rahbarlar - RECTORATE va DEAN uchun) */}
              {(activeRole === "RECTORATE" || activeRole === "DEAN") && (
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
              )}

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

                  {/* HEMIS O'QUV YUKLAMASI WIDGETI (TEACHER WORKLOAD HUB) */}
                  {(() => {
                    const myWorkload = getTeacherWorkloadData(currentTeacher.id || currentTeacher.name);
                    return (
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-7">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-5 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <span>HEMIS Oʻquv yuklamam (Workload)</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  HEMIS REST API
                                </span>
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                2025/2026-oʻquv yili boʻyicha biriktirilgan fanlar va tasdiqlangan dars soatlari
                              </p>
                            </div>
                          </div>

                          {myWorkload && (
                            <button
                              type="button"
                              onClick={() => setSelectedWorkloadTeacher({ name: currentTeacher.name, id: currentTeacher.id, department: currentTeacher.department })}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Batafsil tahlil</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {myWorkload ? (
                          <>
                            {/* Summary stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
                              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Jami oʻquv yuklama</span>
                                <div className="text-2xl font-black text-blue-900 dark:text-blue-300">
                                  {myWorkload.totalHours} <span className="text-xs font-semibold text-slate-400">soat</span>
                                </div>
                              </div>

                              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Fanlar soni</span>
                                <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                  {myWorkload.subjectsCount} <span className="text-xs font-semibold text-slate-400">ta fan</span>
                                </div>
                              </div>

                              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Bakalavriat</span>
                                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                  {myWorkload.bachelorHours} <span className="text-xs font-semibold text-slate-400">soat</span>
                                </div>
                              </div>

                              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Magistratura</span>
                                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                  {myWorkload.masterHours} <span className="text-xs font-semibold text-slate-400">soat</span>
                                </div>
                              </div>
                            </div>

                            {/* Subjects grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {myWorkload.subjects.map((subj, idx) => (
                                <div
                                  key={`workload-subj-${idx}`}
                                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between shadow-2xs"
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        subj.education_type_name === "Magistr" || subj.education_type_code === "12"
                                          ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                          : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                      }`}>
                                        {subj.education_type_name || "Bakalavr"}
                                      </span>
                                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                        {subj.total_hours} soat
                                      </span>
                                    </div>
                                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                                      {subj.subject_name}
                                    </h5>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 truncate">
                                    Kafedra: {subj.department_name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-400">
                            HEMIS tizimida ushbu oʻqituvchi boʻyicha oʻquv yuklamasi topilmadi yoki hali biriktirilmagan.
                          </div>
                        )}
                      </div>
                    );
                  })()}

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
                          showAlert({
                            title: "Hujjatlar qabuli yopiq",
                            message: `Hozirda yangi KPI faoliyat natijalarini qabul qilish muddati yakunlangan. Belgilangan oxirgi qabul muddati: ${systemSettings.deadline_date}`,
                            type: "warning"
                          });
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
                          <th className="py-3 px-4 text-center">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {mySubmissionsList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                              Hozircha yuklangan KPI natijalari mavjud emas. Yuqoridagi "+ Yangi natija kiritish" tugmasi orqali ariza topshiring.
                            </td>
                          </tr>
                        ) : (
                          pagedMySubmissions.map(sub => (
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
                                    <button
                                      onClick={() => handleOpenAppealModal(sub)}
                                      className="text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-800/50 px-2.5 py-1 rounded text-xs font-semibold mt-2 inline-flex items-center gap-1 transition-colors"
                                    >
                                      <span>⚡ Asoslangan apellyatsiya berish →</span>
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {sub.status === "pending" ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => openEditModal(sub)}
                                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition-colors"
                                      title="Baholanmagan arizani tahrirlash"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Tahrir</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSubmission(sub)}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-rose-200 dark:border-rose-800 transition-colors"
                                      title="Arizani oʻchirish"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Oʻchirish</span>
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                    Muzlatilgan
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Pagination Bar */}
                    <UniversalPagination
                      currentPage={currentSafeMySubsPage}
                      totalPages={totalMySubsPages}
                      totalItems={mySubmissionsList.length}
                      itemsPerPage={mySubsPerPage}
                      onPageChange={setMySubsPage}
                      onItemsPerPageChange={(val) => {
                        setMySubsPerPage(val);
                        setMySubsPage(1);
                      }}
                      itemLabel="natija"
                      theme={theme}
                    />
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
                          {reviewSubmissionsList.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                                {currentUser?.department ? `"${currentUser.department}" kafedrasi boʻyicha hozirda tasdiqlash kutilayotgan arizalar mavjud emas` : "Hozirda tasdiqlash kutilayotgan arizalar mavjud emas"}
                              </td>
                            </tr>
                          ) : (
                            pagedReviewSubmissions.map(sub => (
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
                                    onClick={() => showAlert({
                                      title: "Asoslovchi hujjat",
                                      message: `Yuklangan asoslovchi fayl nomi: "${sub.file_name}". Tizimda hujjat fayli xavfsiz saqlanmoqda va ekspert koʻrigi uchun taqdim etilgan.`,
                                      type: "info"
                                    })}
                                    className="text-xs text-blue-700 dark:text-blue-400 font-semibold underline flex items-center gap-1 hover:text-blue-900"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{sub.file_name}</span>
                                  </button>
                                </td>
                                <td className="py-3.5 px-4">
                                  {(() => {
                                    const isSelf = (sub.teacher_id === currentUser?.id) || 
                                      Boolean(currentUser?.name && sub.teacher_name && 
                                      sub.teacher_name.toLowerCase().replace(/^(dots\.|prof\.)\s*/, '').trim() === currentUser.name.toLowerCase().replace(/^(dots\.|prof\.)\s*/, '').trim());
                                    
                                    if (isSelf) {
                                      return (
                                        <div className="flex flex-col gap-1 max-w-[210px]">
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                            <span>Oʻzingizning arizangiz</span>
                                          </span>
                                          <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                                            Manfaatlar toʻqnashuvi: Fakultet Dekani yoki Komissiya tomonidan baholanadi
                                          </span>
                                        </div>
                                      );
                                    }

                                    return (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => openVerifyModal(sub, "approved")}
                                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                                          title="Arizani tekshirib, bahosini qoʻlda tasdiqlash"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Tasdiqlash</span>
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
                                    );
                                  })()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>

                      {/* Pagination Bar */}
                      <UniversalPagination
                        currentPage={currentSafeReviewSubsPage}
                        totalPages={totalReviewSubsPages}
                        totalItems={reviewSubmissionsList.length}
                        itemsPerPage={reviewSubsPerPage}
                        onPageChange={setReviewSubsPage}
                        onItemsPerPageChange={(val) => {
                          setReviewSubsPerPage(val);
                          setReviewSubsPage(1);
                        }}
                        itemLabel="ariza"
                        theme={theme}
                      />
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
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                                  <span>{t.name}</span>
                                  {(() => {
                                    const wl = getTeacherWorkloadData((t as any).hemis_id || t.name);
                                    if (wl && wl.totalHours > 0) {
                                      return (
                                        <button
                                          onClick={() => setSelectedWorkloadTeacher({ name: t.name, id: (t as any).hemis_id || t.id, department: t.department })}
                                          title="HEMIS Oʻquv yuklamasini koʻrish"
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer"
                                        >
                                          <BookOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                          <span>{wl.totalHours} soat ({wl.subjectsCount} fan)</span>
                                        </button>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </td>
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
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                                  <span>{t.name}</span>
                                  {(() => {
                                    const wl = getTeacherWorkloadData((t as any).hemis_id || t.name);
                                    if (wl && wl.totalHours > 0) {
                                      return (
                                        <button
                                          onClick={() => setSelectedWorkloadTeacher({ name: t.name, id: (t as any).hemis_id || t.id, department: t.department })}
                                          title="HEMIS Oʻquv yuklamasini koʻrish"
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer"
                                        >
                                          <BookOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                          <span>{wl.totalHours} soat ({wl.subjectsCount} fan)</span>
                                        </button>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </td>
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
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                                <span>{t.name}</span>
                                {t.is_head_of_dept && <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-normal border border-blue-100 dark:border-blue-900/50">Mudir</span>}
                                {(() => {
                                  const wl = getTeacherWorkloadData((t as any).hemis_id || t.name);
                                  if (wl && wl.totalHours > 0) {
                                    return (
                                      <button
                                        onClick={() => setSelectedWorkloadTeacher({ name: t.name, id: (t as any).hemis_id || t.id, department: t.department })}
                                        title="HEMIS Oʻquv yuklamasini koʻrish"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer"
                                      >
                                        <BookOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        <span>{wl.totalHours} soat ({wl.subjectsCount} fan)</span>
                                      </button>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
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
                    <UniversalPagination
                      currentPage={currentSafeTeacherPage}
                      totalPages={totalTeacherPages}
                      totalItems={filteredTeachers.length}
                      itemsPerPage={teacherPerPage}
                      onPageChange={setTeacherPage}
                      onItemsPerPageChange={(val) => {
                        setTeacherPerPage(val);
                        setTeacherPage(1);
                      }}
                      perPageOptions={[10, 25, 50, 100]}
                      itemLabel="oʻqituvchi"
                      theme={theme}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGE: ORGANIZATIONAL STRUCTURE HIERARCHY (ADMIN & RECTORATE ONLY) */}
          {/* ========================================================================= */}
          {activePage === "structure" && (activeRole === "ADMIN" || activeRole === "RECTORATE") && (
            <StructureHierarchyView
              theme={theme}
              userRole={activeRole}
              userFaculty={currentUser?.faculty}
              userDepartment={currentUser?.department}
              hierarchyData={structureHierarchy}
              onSelectDepartment={(deptName) => {
                setSelectedDeptFilter(deptName);
                const match = teachers.find(t => 
                  t.department.toLowerCase().includes(deptName.toLowerCase()) || 
                  deptName.toLowerCase().includes(t.department.toLowerCase())
                );
                if (match) setSelectedTeacherId(match.id);
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
                    {pagedCatalogIndicators.map(ind => (
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

                {/* Pagination Bar for Indicators */}
                <UniversalPagination
                  currentPage={currentSafeCatalogIndicatorsPage}
                  totalPages={totalCatalogIndicatorsPages}
                  totalItems={filteredIndicators.length}
                  itemsPerPage={indicatorsPerPage}
                  onPageChange={setIndicatorsPage}
                  onItemsPerPageChange={(val) => {
                    setIndicatorsPerPage(val);
                    setIndicatorsPage(1);
                  }}
                  itemLabel="mezon"
                  theme={theme}
                />
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Qoʻshimcha tasdiqlovchi hujjat (PDF)</label>
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Maks. 10 MB</span>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.size > 10 * 1024 * 1024) {
                            showAlert({
                              title: "Hajm cheklovi",
                              message: "Yuklanadigan hujjat hajmi 10 MB dan oshmasligi kerak!",
                              type: "warning"
                            });
                            e.target.value = "";
                          }
                        }}
                        className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Eslatma: Fayl hajmi 10 MB gacha boʻlishi lozim (PDF formatda)</p>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {activeRole === "TEACHER"
                        ? `Sizning apellyatsiya arizalaringiz tarixi (${roleFilteredAppeals.length} ta)`
                        : activeRole === "HEAD_OF_DEPT"
                        ? `Kafedrangiz aʼzolari va shaxsiy apellyatsiyalaringiz (${roleFilteredAppeals.length} ta)`
                        : `Barcha roʻyxatga olingan apellyatsiyalar reyestri (${roleFilteredAppeals.length} ta)`}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {activeRole === "TEACHER"
                        ? "Faqat oʻzingiz topshirgan va eʼtiroz bildirilgan arizalarning koʻrib chiqilish holati (shaxsiy maxfiylik taʼminlangan)"
                        : "Apellyatsiya komissiyasi xulosasi va yakuniy ballar"}
                    </p>
                  </div>
                </div>

                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Ariza kodi</th>
                      <th className="py-3 px-4">Oʻqituvchi</th>
                      <th className="py-3 px-4">Mezon</th>
                      <th className="py-3 px-4">Eʼtiroz matni & Asos</th>
                      <th className="py-3 px-4">Sana</th>
                      <th className="py-3 px-4">Komissiya qarori</th>
                      {(activeRole === "ADMIN" || activeRole === "RECTORATE" || activeRole === "DEAN") && (
                        <th className="py-3 px-4 text-center">Komissiya amali</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {roleFilteredAppeals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                          {activeRole === "TEACHER"
                            ? "Siz tomondan hozircha apellyatsiya arizasi topshirilmagan. Agar rad etilgan natijalaringiz boʻlsa, yuqoridagi forma yoki «Mening arizalarim» boʻlimidan eʼtiroz bildirishingiz mumkin."
                            : "Ushbu toifa boʻyicha hozircha apellyatsiyalar mavjud emas."}
                        </td>
                      </tr>
                    ) : (
                      pagedAppeals.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-900 dark:text-blue-400">
                            {a.id}
                            {a.title && <div className="text-[11px] font-sans font-normal text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{a.title}</div>}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                            <div>{a.teacher_name}</div>
                            {a.initial_reviewer && (
                              <div className="text-[10px] text-slate-400 font-normal">Dastlabki masʼul: {a.initial_reviewer}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{a.indicator_id}</td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 text-xs max-w-sm">
                            <div className="font-medium text-slate-900 dark:text-slate-100">{a.reason || a.appeal_reason}</div>
                            {a.initial_rejection_reason && (
                              <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 italic">
                                Dastlabki rad sababi: "{a.initial_rejection_reason}"
                              </div>
                            )}
                            {a.evidence_file && (
                              <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                                <FileText className="w-3 h-3" />
                                <span>Ilova: {a.evidence_file}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">{a.submitted_date || "2026-10-01"}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                a.status === "Qanoatlantirildi"
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                  : a.status === "Qisman qanoatlantirildi"
                                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                  : a.status === "Rad etildi"
                                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50"
                              }`}>
                                {a.status} {a.awarded_ball ? `(+${a.awarded_ball} ball)` : ""}
                              </span>
                              {(a.commission_comment || a.decision) && (
                                <div className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                                  "{a.commission_comment || a.decision}"
                                </div>
                              )}
                            </div>
                          </td>
                          {(activeRole === "ADMIN" || activeRole === "RECTORATE" || activeRole === "DEAN") && (
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleOpenReviewAppealModal(a)}
                                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 mx-auto"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Qaror qabul qilish</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination Bar for Appeals */}
                <UniversalPagination
                  currentPage={currentSafeAppealsPage}
                  totalPages={totalAppealsPages}
                  totalItems={roleFilteredAppeals.length}
                  itemsPerPage={appealsPerPage}
                  onPageChange={setAppealsPage}
                  onItemsPerPageChange={(val) => {
                    setAppealsPerPage(val);
                    setAppealsPage(1);
                  }}
                  itemLabel="apellyatsiya"
                  theme={theme}
                />
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

          {/* ========================================================================= */}
          {/* PAGE: TEACHER SUBJECTS & HEMIS WORKLOAD (FANLAR VA OʻQUV YUKLAMASI) */}
          {/* ========================================================================= */}
          {activePage === "subjects" && (() => {
            // Build unique teachers list for switching / browsing
            const teacherMap = new Map<string, { id: number; name: string; department: string; totalHours: number }>();
            if (teacherWorkloads && teacherWorkloads.length > 0) {
              for (const item of teacherWorkloads) {
                if (!teacherMap.has(item.employee_name)) {
                  teacherMap.set(item.employee_name, {
                    id: item.employee_id,
                    name: item.employee_name,
                    department: item.department_name,
                    totalHours: item.total_hours
                  });
                } else {
                  const exist = teacherMap.get(item.employee_name)!;
                  exist.totalHours += item.total_hours;
                }
              }
            }
            const allUniqueTeachers = Array.from(teacherMap.values()).sort((a, b) => a.name.localeCompare(b.name));

            // Mantiqiy zanjir (Role-based Hierarchical Access Control):
            // - TEACHER: Faqat o'zining shaxsiy yuklamasi (boshqa o'qituvchilarni ko'rish cheklangan)
            // - HEAD_OF_DEPT: O'z kafedrasi o'qituvchilari
            // - DEAN: O'z fakultetiga qarashli barcha kafedralar o'qituvchilari
            // - RECTORATE / ADMIN: Butun filial miqyosidagi barcha o'qituvchilar

            const allowedTeachers = allUniqueTeachers.filter(t => {
              // 1. RECTORATE yoki ADMIN: butun filial bo'yicha barchani ko'ra oladi
              if (activeRole === "ADMIN" || activeRole === "RECTORATE") return true;

              // 2. TEACHER: FAQAT VA FAQAT O'ZINING SHAXSIY YUKLAMASINI KO'RADI
              if (activeRole === "TEACHER") {
                if (!currentUser?.name) return false;
                const myName = currentUser.name.toLowerCase().trim();
                const tName = t.name.toLowerCase().trim();
                return tName === myName || tName.includes(myName) || myName.includes(tName);
              }

              // 3. HEAD_OF_DEPT: O'z kafedrasi o'qituvchilari va mudirning o'z shaxsiy darslari
              if (activeRole === "HEAD_OF_DEPT") {
                if (currentUser?.name && (t.name.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(t.name.toLowerCase()))) {
                  return true;
                }
                if (!currentUser?.department) return false;
                const myDept = currentUser.department.toLowerCase().trim();
                const tDept = (t.department || "").toLowerCase().trim();
                return tDept.includes(myDept) || myDept.includes(tDept);
              }

              // 4. DEAN: O'z fakultetiga qarashli kafedralar o'qituvchilari va dekanning o'z darslari
              if (activeRole === "DEAN") {
                if (currentUser?.name && (t.name.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(t.name.toLowerCase()))) {
                  return true;
                }
                if (!currentUser?.faculty) return false;
                const myFaculty = currentUser.faculty.toLowerCase().trim();
                const facultyDepts = structureHierarchy?.faculties
                  ?.find(f => f.name.toLowerCase().includes(myFaculty) || myFaculty.includes(f.name.toLowerCase()))
                  ?.departments.map(d => d.name.toLowerCase().trim()) || [];
                const tDept = (t.department || "").toLowerCase().trim();
                return facultyDepts.some(d => tDept.includes(d) || d.includes(tDept));
              }

              return false;
            });

            // Target teacher resolution strictly bounded by allowedTeachers
            let targetTeacherName = "";
            if (activeRole === "TEACHER") {
              // O'qituvchi o'z profilida faqat o'zinikini ko'radi
              targetTeacherName = currentUser?.name || (allowedTeachers[0]?.name ?? "");
            } else {
              const isSelectedAllowed = selectedSubjectTeacherName && allowedTeachers.some(t => t.name === selectedSubjectTeacherName);
              if (isSelectedAllowed) {
                targetTeacherName = selectedSubjectTeacherName;
              } else {
                targetTeacherName = (currentUser?.name && allowedTeachers.some(t => t.name === currentUser.name))
                  ? currentUser.name
                  : (allowedTeachers[0]?.name ?? "");
              }
            }

            const workloadData = getTeacherWorkloadData(targetTeacherName);

            // Filter & sort subjects
            const rawSubjects = workloadData?.subjects || [];
            const filteredSubjects = rawSubjects.filter(sub => {
              const matchEdu = subjectEduTypeFilter === "ALL" 
                || (subjectEduTypeFilter === "11" && (sub.education_type_code === "11" || sub.education_type_name === "Bakalavr"))
                || (subjectEduTypeFilter === "12" && (sub.education_type_code === "12" || sub.education_type_name === "Magistr"));
              const q = subjectSearchQuery.trim().toLowerCase();
              const matchQuery = !q 
                || sub.subject_name.toLowerCase().includes(q) 
                || sub.department_name.toLowerCase().includes(q);
              return matchEdu && matchQuery;
            }).sort((a, b) => {
              if (subjectSortBy === "hours_desc") return b.total_hours - a.total_hours;
              if (subjectSortBy === "hours_asc") return a.total_hours - b.total_hours;
              return a.subject_name.localeCompare(b.subject_name);
            });

            // Department colleagues strictly bounded by allowedTeachers
            const deptColleagues = workloadData?.departmentName 
              ? allowedTeachers.filter(t => t.department.toLowerCase() === workloadData.departmentName.toLowerCase())
              : [];

            const totalHours = workloadData?.totalHours || 0;
            const bachelorHours = workloadData?.bachelorHours || 0;
            const masterHours = workloadData?.masterHours || 0;
            const bachelorPercent = totalHours > 0 ? Math.round((bachelorHours / totalHours) * 100) : 0;
            const masterPercent = totalHours > 0 ? Math.round((masterHours / totalHours) * 100) : 0;

            const segmentColors = [
              "bg-emerald-500", "bg-blue-500", "bg-indigo-500", "bg-purple-500", 
              "bg-amber-500", "bg-rose-500", "bg-teal-500", "bg-cyan-500"
            ];

            return (
              <div className="space-y-6">
                {/* Hero Card */}
                <div className={`rounded-2xl border shadow-sm p-6 relative overflow-hidden ${
                  theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 flex-shrink-0">
                        <BookOpen className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white">
                            {activeRole === "TEACHER" ? "Mening Fanlarim va Oʻquv Yuklamam" : "Fanlar va Oʻquv Yuklamalari Monitoringi"}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            HEMIS REST API
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          2024–2025 oʻquv yili uchun tasdiqlangan pedagogik dars soatlari va fanlar reyestri
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            {workloadData?.teacherName || targetTeacherName}
                          </span>
                          {workloadData?.departmentName && (
                            <span className="text-slate-400 dark:text-slate-500">
                              • Kafedra: <b className="text-slate-700 dark:text-slate-300">{workloadData.departmentName}</b>
                            </span>
                          )}
                          {workloadData?.employeeId && (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              ID: {workloadData.employeeId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick controls on header */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Role-based Controls */}
                      {activeRole === "TEACHER" ? (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span>Shaxsiy kabinet (faqat oʻzingizning yuklamangiz)</span>
                        </div>
                      ) : allowedTeachers.length > 1 ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <select
                              value={selectedSubjectTeacherName || workloadData?.teacherName || ""}
                              onChange={(e) => setSelectedSubjectTeacherName(e.target.value)}
                              className={`text-xs font-semibold py-2 pl-3 pr-8 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[240px] truncate cursor-pointer ${
                                theme === "dark" 
                                  ? "bg-slate-800 border-slate-700 text-slate-200" 
                                  : "bg-slate-50 border-slate-200 text-slate-800"
                              }`}
                              title={
                                activeRole === "HEAD_OF_DEPT"
                                  ? "Kafedrangiz oʻqituvchisini tanlang"
                                  : activeRole === "DEAN"
                                  ? "Fakultetingiz oʻqituvchisini tanlang"
                                  : "Filial oʻqituvchisini tanlang"
                              }
                            >
                              <optgroup label={
                                activeRole === "HEAD_OF_DEPT"
                                  ? `Kafedra oʻqituvchilari (${allowedTeachers.length} nafar)`
                                  : activeRole === "DEAN"
                                  ? `Fakultet oʻqituvchilari (${allowedTeachers.length} nafar)`
                                  : `Filial barcha oʻqituvchilari (${allowedTeachers.length} nafar)`
                              }>
                                {allowedTeachers.map((t) => (
                                  <option key={t.id + t.name} value={t.name}>
                                    {t.name} ({t.totalHours} s. • {t.department})
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </div>

                          {selectedSubjectTeacherName && currentUser?.name && selectedSubjectTeacherName !== currentUser.name && (
                            <button
                              onClick={() => setSelectedSubjectTeacherName(currentUser.name)}
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                              title="Oʻz shaxsiy dars yuklamamga qaytish"
                            >
                              Mening darslarim
                            </button>
                          )}
                        </div>
                      ) : null}

                      {/* Faqat ADMIN uchun HEMIS sinxronlash ruxsati */}
                      {activeRole === "ADMIN" && (
                        <button
                          onClick={handleSyncWorkloads}
                          disabled={isWorkloadsLoading}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Administrator: HEMIS axborot tizimidan barcha yuklamalarni yangilash"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isWorkloadsLoading ? "animate-spin" : ""}`} />
                          <span className="hidden sm:inline">{isWorkloadsLoading ? "Yangilanmoqda..." : "HEMIS sinxronlash"}</span>
                        </button>
                      )}

                      <button
                        onClick={() => window.print()}
                        className="px-3 py-2 border rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        title="Oʻquv yuklamasini chop etish yoki PDF sifatida saqlash"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Chop etish</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Hours */}
                  <div className={`p-4 rounded-2xl border shadow-sm transition-all relative overflow-hidden ${
                    theme === "dark" ? "bg-slate-900 border-emerald-950/80" : "bg-white border-emerald-100"
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Jami oʻquv yuklamasi
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      {totalHours} <span className="text-sm font-semibold text-slate-500">soat</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <span>Yillik oʻquv rejasi meʼyori</span>
                    </div>
                  </div>

                  {/* Subjects Count */}
                  <div className={`p-4 rounded-2xl border shadow-sm transition-all relative overflow-hidden ${
                    theme === "dark" ? "bg-slate-900 border-blue-950/80" : "bg-white border-blue-100"
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Biriktirilgan fanlar
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      {workloadData?.subjectsCount || 0} <span className="text-sm font-semibold text-slate-500">ta fan</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {workloadData?.departmentName || "Kafedra fanlari"}
                    </div>
                  </div>

                  {/* Bachelor Hours */}
                  <div className={`p-4 rounded-2xl border shadow-sm transition-all relative overflow-hidden ${
                    theme === "dark" ? "bg-slate-900 border-cyan-950/80" : "bg-white border-cyan-100"
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                        Bakalavriat soati
                      </span>
                      <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                        {bachelorPercent}%
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      {bachelorHours} <span className="text-sm font-semibold text-slate-500">soat</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${bachelorPercent}%` }} />
                    </div>
                  </div>

                  {/* Master Hours */}
                  <div className={`p-4 rounded-2xl border shadow-sm transition-all relative overflow-hidden ${
                    theme === "dark" ? "bg-slate-900 border-purple-950/80" : "bg-white border-purple-100"
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        Magistratura soati
                      </span>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        {masterPercent}%
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                      {masterHours} <span className="text-sm font-semibold text-slate-500">soat</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${masterPercent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Creative Workload Distribution Progress Bar */}
                {totalHours > 0 && rawSubjects.length > 0 && (
                  <div className={`p-5 rounded-2xl border shadow-sm ${
                    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          Fanlar Kesimida Yuklama Taqsimoti
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Har bir fanning umumiy dars soatlaridagi foiz ulushi
                        </p>
                      </div>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        Jami 100% ({totalHours} soat)
                      </span>
                    </div>

                    {/* Segmented bar */}
                    <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 p-0.5 gap-0.5">
                      {rawSubjects.map((sub, idx) => {
                        const pct = (sub.total_hours / totalHours) * 100;
                        const colorClass = segmentColors[idx % segmentColors.length];
                        return (
                          <div
                            key={sub.id || idx}
                            style={{ width: `${pct}%` }}
                            className={`${colorClass} h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 relative group`}
                            title={`${sub.subject_name}: ${sub.total_hours} soat (${pct.toFixed(1)}%)`}
                          />
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
                      {rawSubjects.map((sub, idx) => {
                        const pct = ((sub.total_hours / totalHours) * 100).toFixed(1);
                        const colorClass = segmentColors[idx % segmentColors.length];
                        return (
                          <div key={sub.id || idx} className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${colorClass} flex-shrink-0`} />
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                              {sub.subject_name}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                              {sub.total_hours}s ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Filter & Search Bar */}
                <div className={`p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Education filter pills */}
                    <div className={`p-1 rounded-xl border flex items-center gap-1 text-xs ${
                      theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
                    }`}>
                      <button
                        onClick={() => setSubjectEduTypeFilter("ALL")}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          subjectEduTypeFilter === "ALL"
                            ? "bg-blue-900 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Barchasi ({rawSubjects.length})
                      </button>
                      <button
                        onClick={() => setSubjectEduTypeFilter("11")}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          subjectEduTypeFilter === "11"
                            ? "bg-blue-900 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Bakalavr ({rawSubjects.filter(s => s.education_type_code === "11" || s.education_type_name === "Bakalavr").length})
                      </button>
                      <button
                        onClick={() => setSubjectEduTypeFilter("12")}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          subjectEduTypeFilter === "12"
                            ? "bg-blue-900 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Magistr ({rawSubjects.filter(s => s.education_type_code === "12" || s.education_type_name === "Magistr").length})
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <select
                        value={subjectSortBy}
                        onChange={(e) => setSubjectSortBy(e.target.value as any)}
                        className={`text-xs font-semibold py-2 pl-3 pr-7 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer ${
                          theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <option value="hours_desc">Soatlar: Kamayish</option>
                        <option value="hours_asc">Soatlar: Oʻsish</option>
                        <option value="name">Fan nomi (A-Z)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search input */}
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={subjectSearchQuery}
                        onChange={(e) => setSubjectSearchQuery(e.target.value)}
                        placeholder="Fan yoki kafedra qidirish..."
                        className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                          theme === "dark" 
                            ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" 
                            : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                    </div>

                    {/* View Mode Toggle */}
                    <div className={`p-1 rounded-xl border flex items-center ${
                      theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
                    }`}>
                      <button
                        onClick={() => setSubjectViewMode("cards")}
                        title="Kartochkalar koʻrinishi"
                        className={`p-1.5 rounded-lg transition-colors ${
                          subjectViewMode === "cards"
                            ? "bg-white dark:bg-slate-700 text-blue-900 dark:text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSubjectViewMode("table")}
                        title="Jadval koʻrinishi"
                        className={`p-1.5 rounded-lg transition-colors ${
                          subjectViewMode === "table"
                            ? "bg-white dark:bg-slate-700 text-blue-900 dark:text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subjects Content */}
                {filteredSubjects.length === 0 ? (
                  <div className={`p-12 text-center rounded-2xl border ${
                    theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"
                  }`}>
                    <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      Hech qanday fan topilmadi
                    </h4>
                    <p className="text-xs mt-1 max-w-md mx-auto">
                      Qidiruv mezonlariga mos keladigan fan mavjud emas yoki ushbu oʻqituvchiga hozircha HEMIS tizimida oʻquv yuklamasi kiritilmagan.
                    </p>
                    <button
                      onClick={() => {
                        setSubjectSearchQuery("");
                        setSubjectEduTypeFilter("ALL");
                      }}
                      className="mt-4 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold"
                    >
                      Filtrlarni tozalash
                    </button>
                  </div>
                ) : subjectViewMode === "cards" ? (
                  /* Cards View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubjects.map((sub, idx) => {
                      const pct = totalHours > 0 ? ((sub.total_hours / totalHours) * 100).toFixed(1) : "0";
                      const weeklyEst = (sub.total_hours / 30).toFixed(1);
                      const isMaster = sub.education_type_code === "12" || sub.education_type_name === "Magistr";
                      return (
                        <div
                          key={sub.id || idx}
                          className={`rounded-2xl border p-5 transition-all hover:shadow-md relative flex flex-col justify-between group ${
                            theme === "dark" 
                              ? "bg-slate-900 border-slate-800 hover:border-emerald-800/60" 
                              : "bg-white border-slate-200 hover:border-emerald-300"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-3">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                                isMaster
                                  ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                  : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              }`}>
                                <GraduationCap className="w-3 h-3" />
                                {sub.education_type_name || (isMaster ? "Magistr" : "Bakalavr")}
                              </span>

                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                #{idx + 1}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {sub.subject_name}
                            </h4>

                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{sub.department_name}</span>
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-end justify-between">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Dars soati</span>
                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                  {sub.total_hours} <span className="text-xs font-semibold text-slate-500">soat</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Ulushi</span>
                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                  {pct}%
                                </div>
                              </div>
                            </div>

                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, Number(pct))}%` }} 
                              />
                            </div>

                            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                              <span>Oʻrtacha yuklama:</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">~{weeklyEst} soat / hafta</span>
                            </div>

                            {/* 3 ta alohida, qulay tugmalar */}
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                              <button
                                type="button"
                                onClick={() => handleOpenCourseDocs(sub, targetTeacherName)}
                                className="w-full py-2 px-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                              >
                                <FileText className="w-4 h-4 text-blue-200" />
                                <span>Oʻquv-uslubiy hujjatlar</span>
                              </button>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenPublicationWorkflow(sub, targetTeacherName)}
                                  className="py-1.5 px-2 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-900 dark:text-indigo-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                  title="Darslik yoki oʻquv qoʻllanma uchun Kengash bayonnomasi koʻchirmasi (Ixtiyoriy)"
                                >
                                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                  <span>Darslik va grif</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenHemisSubjectResources(sub, targetTeacherName)}
                                  className="py-1.5 px-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                  title="HEMIS tizimidagi asl elektron resurslar va rasmiy soatlar"
                                >
                                  <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>HEMIS bazasi</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Table View */
                  <div className={`rounded-2xl border shadow-sm overflow-hidden ${
                    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                            theme === "dark" ? "border-slate-800 text-slate-400 bg-slate-800/40" : "border-slate-200 text-slate-500 bg-slate-50"
                          }`}>
                            <th className="py-3 px-4 w-12 text-center">№</th>
                            <th className="py-3 px-4">Fan nomi</th>
                            <th className="py-3 px-4">Kafedra</th>
                            <th className="py-3 px-4">Taʼlim bosqichi</th>
                            <th className="py-3 px-4 text-center">Dars soati</th>
                            <th className="py-3 px-4">Yuklamadagi ulushi</th>
                            <th className="py-3 px-4 text-right">Oʻrtacha haftalik</th>
                            <th className="py-3 px-4 text-center">Amallar va Hujjatlar</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y text-xs ${theme === "dark" ? "divide-slate-800 text-slate-200" : "divide-slate-100 text-slate-800"}`}>
                          {filteredSubjects.map((sub, idx) => {
                            const pct = totalHours > 0 ? ((sub.total_hours / totalHours) * 100).toFixed(1) : "0";
                            const weeklyEst = (sub.total_hours / 30).toFixed(1);
                            const isMaster = sub.education_type_code === "12" || sub.education_type_name === "Magistr";
                            return (
                              <tr key={sub.id || idx} className={`transition-colors ${theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}>
                                <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                                  #{idx + 1}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                                  {sub.subject_name}
                                </td>
                                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                                  {sub.department_name}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                                    isMaster
                                      ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                      : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                  }`}>
                                    {sub.education_type_name || (isMaster ? "Magistr" : "Bakalavr")}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                                  {sub.total_hours}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, Number(pct))}%` }} />
                                    </div>
                                    <span className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">{pct}%</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-right font-medium text-slate-500 dark:text-slate-400">
                                  ~{weeklyEst} s./hafta
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCourseDocs(sub, targetTeacherName)}
                                      className="py-1 px-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                      title="Fan oʻquv-uslubiy hujjatlarini topshirish va koʻrish"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>Hujjatlar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPublicationWorkflow(sub, targetTeacherName)}
                                      className="py-1 px-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 font-semibold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                                      title="Darslik va oʻquv qoʻllanmalar Kengashlar zanjiri"
                                    >
                                      <GraduationCap className="w-3.5 h-3.5" />
                                      <span>Grif</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenHemisSubjectResources(sub, targetTeacherName)}
                                      className="py-1 px-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-semibold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                                      title="HEMIS dagi elektron fayllar va oʻquv reja soatlari"
                                    >
                                      <Database className="w-3.5 h-3.5" />
                                      <span>HEMIS</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Department Colleagues Workload Summary (Faqat rahbarlar: Mudir, Dekan va Rektorat uchun) */}
                {activeRole !== "TEACHER" && deptColleagues.length > 1 && (
                  <div className={`p-5 rounded-2xl border shadow-sm ${
                    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>
                            {activeRole === "HEAD_OF_DEPT" 
                              ? `${workloadData?.departmentName || "Kafedra"} Oʻqituvchilari Yuklamasi`
                              : activeRole === "DEAN"
                              ? `${currentUser?.faculty || "Fakultet"} Kafedralari Oʻqituvchilari Yuklamasi`
                              : `${workloadData?.departmentName || "Kafedra"} Oʻqituvchilari Yuklamasi`}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Tegishli boʻlim boʻyicha jami {deptColleagues.length} nafar oʻqituvchining umumiy dars soatlari
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {deptColleagues.map((colleague) => {
                        const isSelected = (workloadData?.teacherName || targetTeacherName) === colleague.name;
                        return (
                          <div
                            key={colleague.id + colleague.name}
                            onClick={() => setSelectedSubjectTeacherName(colleague.name)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20"
                                : theme === "dark"
                                ? "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-200"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold text-xs truncate">
                                {colleague.name}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {isSelected ? "Tanlangan profil" : "Yuklamani koʻrish uchun bosing"}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                                {colleague.totalHours} soat
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL 1: ADD KPI ENTRY (O'QITUVCHI TOMONIDAN NATIJA YUKLASH VA O'ZIGA BALL QO'YISH) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (() => {
        const currentSelectedInd = indicators.find(i => i.id === modalIndicator) || indicators[0];
        const maxPossibleBall = currentSelectedInd ? currentSelectedInd.max_ball : 10;
        const recommendedAuthorBall = currentSelectedInd 
          ? Number((currentSelectedInd.max_ball / Math.max(1, modalAuthors)).toFixed(1)) 
          : 0;

        const filteredModalIndicators = indicators.filter(i => {
          const matchBlock = modalBlockFilter === "ALL" || i.block.toLowerCase() === modalBlockFilter.toLowerCase();
          const q = modalIndicatorSearch.trim().toLowerCase();
          const matchSearch = !q || i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || (i.dept && i.dept.toLowerCase().includes(q));
          return matchBlock && matchSearch;
        });

        const POPULAR_PRESETS = [
          { id: "1.1", label: "Scopus / WoS (Q1-Q4)", badge: "Ilmiy" },
          { id: "1.3", label: "OAK ilmiy maqolasi", badge: "Ilmiy" },
          { id: "2.1", label: "Darslik / Qoʻllanma", badge: "Oʻquv" },
          { id: "3.1", label: "Xalqaro til sertifikati", badge: "Xalqaro" },
          { id: "4.1", label: "Talaba yutugʻi / toʻgarak", badge: "Maʼnaviy" }
        ];

        const isDoiRelevant = modalIndicator.startsWith("1.") || (currentSelectedInd && currentSelectedInd.block.toLowerCase() === "ilm");

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 my-4 flex flex-col max-h-[92vh] overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-md flex-shrink-0">
                    <Award className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{editingSubmission ? "KPI natijasini tahrirlash" : "Yangi KPI natijasi kiritish"}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        editingSubmission
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      }`}>
                        {editingSubmission ? `Ariza #${editingSubmission.id}` : "2025/2026-oʻquv yili"}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {editingSubmission ? (
                        <span>Koʻrsatkich kodi, sarlavha, mualliflar soni yoki asoslovchi hujjatni qayta tahrirlang</span>
                      ) : currentTeacher ? (
                        <span>Topshiruvchi: <b>{currentTeacher.name}</b> • {currentTeacher.department}</span>
                      ) : (
                        "Mezonni tanlang, natijangizni kiriting va tasdiqlovchi hujjatni ilova qiling"
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingSubmission(null);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Ommabop mezonlar tezkor tugmalari */}
              <div className="px-6 py-2.5 bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100/60 dark:border-blue-900/40 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex-shrink-0 flex items-center gap-1">
                  ⚡ Ommabop:
                </span>
                <div className="flex items-center gap-1.5 flex-nowrap">
                  {POPULAR_PRESETS.map(pop => {
                    const isSelected = modalIndicator === pop.id;
                    return (
                      <button
                        key={pop.id}
                        type="button"
                        onClick={() => {
                          setModalIndicator(pop.id);
                          const ind = indicators.find(i => i.id === pop.id);
                          if (ind) {
                            setModalClaimedBall(Number((ind.max_ball / Math.max(1, modalAuthors)).toFixed(1)));
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-blue-900 text-white shadow-xs font-bold"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        }`}
                      >
                        <span>{pop.label}</span>
                        <span className={`text-[10px] px-1 rounded ${isSelected ? "bg-blue-800 text-blue-100" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                          #{pop.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification Banner */}
              {modalNotification && (
                <div className={`mx-6 mt-3 p-3 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150 ${
                  modalNotification.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                    : "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
                }`}>
                  <div className="flex items-center gap-2">
                    {modalNotification.type === "success" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                    )}
                    <span>{modalNotification.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalNotification(null)}
                    className="text-xs hover:opacity-75 ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Form Body - 2 Columns */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-hidden flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-6 overflow-y-auto flex-1">
                  
                  {/* CHAP USTUN (5 ustun): Mezonni tanlash */}
                  <div className="md:col-span-5 flex flex-col space-y-3 md:border-r md:border-slate-200 dark:md:border-slate-800 md:pr-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>1. Baholash mezonini tanlang</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {filteredModalIndicators.length} ta mezon
                      </span>
                    </div>

                    {/* Kategoriya filtri */}
                    <div className="grid grid-cols-5 gap-1 text-[11px] font-semibold">
                      {[
                        { id: "ALL", label: "Barchasi" },
                        { id: "oqv", label: "Oʻquv" },
                        { id: "ilm", label: "Ilmiy" },
                        { id: "xal", label: "Xalqaro" },
                        { id: "man", label: "Maʼnaviy" }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setModalBlockFilter(tab.id)}
                          className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                            modalBlockFilter === tab.id
                              ? "bg-blue-900 text-white shadow-xs font-bold"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Mezon qidiruvi */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={modalIndicatorSearch}
                        onChange={(e) => setModalIndicatorSearch(e.target.value)}
                        placeholder="Mezon kodi (1.1, 2.3) yoki soʻz..."
                        className="w-full pl-8 pr-7 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                      {modalIndicatorSearch && (
                        <button
                          type="button"
                          onClick={() => setModalIndicatorSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Mezonlar ro'yxati (Kartochkalar) */}
                    <div className="flex-1 max-h-[380px] overflow-y-auto space-y-1.5 pr-1 text-xs">
                      {filteredModalIndicators.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-xs">
                          Ushbu qidiruv boʻyicha mezon topilmadi
                        </div>
                      ) : (
                        filteredModalIndicators.map(ind => {
                          const isSelected = modalIndicator === ind.id;
                          return (
                            <div
                              key={ind.id}
                              onClick={() => {
                                setModalIndicator(ind.id);
                                const defaultShare = Number((ind.max_ball / Math.max(1, modalAuthors)).toFixed(1));
                                setModalClaimedBall(defaultShare);
                              }}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 shadow-xs ring-1 ring-blue-600"
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="font-bold flex items-center gap-1.5 text-xs">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    isSelected
                                      ? "bg-blue-900 text-white"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                  }`}>
                                    #{ind.id}
                                  </span>
                                  <span className="line-clamp-1">{ind.name}</span>
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold flex-shrink-0 ${
                                  isSelected
                                    ? "bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                                    : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                }`}>
                                  {ind.max_ball} b.
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                <span>{ind.dept || "Ekspert komissiyasi"}</span>
                                {isSelected && (
                                  <span className="text-blue-700 dark:text-blue-300 font-bold flex items-center gap-0.5">
                                    <Check className="w-3 h-3" /> Tanlangan
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* O'NG USTUN (7 ustun): Natija tafsilotlari va Hujjat */}
                  <div className="md:col-span-7 space-y-3.5">
                    
                    {/* Tanlangan mezon kartochkasi */}
                    {currentSelectedInd && (
                      <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            <span>Mezon #{currentSelectedInd.id}: {currentSelectedInd.name}</span>
                          </div>
                          <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                            Masʼul: <b>{currentSelectedInd.dept || "KPI Komissiyasi"}</b>
                          </div>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-blue-900 text-white text-xs font-bold shadow-xs flex-shrink-0">
                          Maks: {maxPossibleBall} ball
                        </div>
                      </div>
                    )}

                    {/* DOI orqali tezkor to'ldirish (agar ilmiy mezon bo'lsa) */}
                    {isDoiRelevant && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>DOI raqami orqali avtomatik toʻldirish (Scopus / WoS / Crossref)</span>
                          </label>
                          <span className="text-[10px] text-slate-400">Ixtiyoriy</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={doiInput}
                            onChange={(e) => setDoiInput(e.target.value)}
                            placeholder="Masalan: 10.1016/j.eswa.2025.123456"
                            className="flex-1 p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900"
                          />
                          <button
                            type="button"
                            onClick={handleDoiLookup}
                            disabled={isDoiLoading}
                            className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-60 flex-shrink-0"
                          >
                            {isDoiLoading ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Qidirilmoqda...</span>
                              </>
                            ) : (
                              <>
                                <Search className="w-3 h-3 text-blue-300" />
                                <span>Maʼlumotni olish</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Faoliyat natijasi nomi */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        2. Faoliyat natijasi yoki hujjat nomi *
                      </label>
                      <input
                        type="text"
                        required
                        value={modalTitle}
                        onChange={(e) => setModalTitle(e.target.value)}
                        placeholder="Ilmiy maqola sarlavhasi, darslik, xalqaro sertifikat yoki loyiha nomini kiriting..."
                        className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none font-medium"
                      />
                    </div>

                    {/* Mualliflar soni va Da'vo qilinayotgan ball (Aqlli kalkulyator) */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>3. Mualliflar soni va ball taqsimoti</span>
                        </span>
                        <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                          Tavsiya: <b>{recommendedAuthorBall} ball</b>
                        </span>
                      </div>

                      {/* Tezkor mualliflar soni tugmalari */}
                      <div className="grid grid-cols-5 gap-1.5 text-xs font-semibold">
                        {[1, 2, 3, 4, 5].map(cnt => {
                          const isCnt = modalAuthors === cnt;
                          return (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => {
                                setModalAuthors(cnt);
                                if (currentSelectedInd) {
                                  const rec = Number((currentSelectedInd.max_ball / cnt).toFixed(1));
                                  setModalClaimedBall(rec);
                                }
                              }}
                              className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                                isCnt
                                  ? "bg-blue-900 text-white font-bold shadow-xs"
                                  : "bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                            >
                              {cnt === 1 ? "1 kishi (100%)" : `${cnt} kishi`}
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Aniq mualliflar soni:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            required
                            value={modalAuthors}
                            onChange={(e) => {
                              const count = Math.max(1, parseInt(e.target.value) || 1);
                              setModalAuthors(count);
                              if (currentSelectedInd) {
                                const rec = Number((currentSelectedInd.max_ball / count).toFixed(1));
                                setModalClaimedBall(rec);
                              }
                            }}
                            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-blue-950 dark:text-blue-300">
                              Oʻzingizga daʻvo qilayotgan ball:
                            </label>
                            <span className="text-[10px] text-slate-400 font-mono">maks. {maxPossibleBall}</span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              max={maxPossibleBall}
                              required
                              value={modalClaimedBall}
                              onChange={(e) => setModalClaimedBall(Number(e.target.value))}
                              className="w-full p-2 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-black text-blue-900 dark:text-blue-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                            />
                            {modalClaimedBall !== recommendedAuthorBall && (
                              <button
                                type="button"
                                onClick={() => setModalClaimedBall(recommendedAuthorBall)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                title="Tavsiya qilingan ballni tiklash"
                              >
                                ⚡ {recommendedAuthorBall} b.
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sana va Tasdiqlovchi hujjat (Dropzone) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          4. Natija sanasi *
                        </label>
                        <input
                          type="date"
                          required
                          value={modalDate}
                          onChange={(e) => setModalDate(e.target.value)}
                          className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            5. Asoslovchi fayl (PDF / DOCX) *
                          </label>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Maks. 10 MB</span>
                        </div>
                        <label className="cursor-pointer flex flex-col items-center justify-center p-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/30 transition-all text-center">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.zip,.png,.jpg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 10 * 1024 * 1024) {
                                  showAlert({
                                    title: "Fayl hajmi 10 MB dan katta",
                                    message: `Tanlangan fayl hajmi (${(file.size / (1024 * 1024)).toFixed(1)} MB) ruxsat etilgan 10 MB meʼyoridan oshib ketdi. Iltimos, faylni siqib yoki kichikroq hajmda yuklang.`,
                                    type: "warning"
                                  });
                                  e.target.value = "";
                                  return;
                                }
                                setModalUploadedFile(file);
                                setModalUploadedFileName(file.name);
                              }
                            }}
                            className="hidden"
                          />
                          {modalUploadedFileName ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-300 truncate max-w-full">
                              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              <span className="truncate">{modalUploadedFileName}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setModalUploadedFile(null);
                                  setModalUploadedFileName("");
                                }}
                                className="text-xs text-rose-500 hover:text-rose-700 ml-1 font-bold cursor-pointer"
                                title="Faylni olib tashlash"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                              <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span>Faylni yuklash (PDF/DOCX)</span>
                            </div>
                          )}
                        </label>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <span className="text-amber-500 font-bold">ℹ Eslatma:</span>
                          <span>Bitta yuklanadigan fayl hajmi <strong>10 MB</strong> dan oshmasligi lozim.</span>
                        </p>
                      </div>
                    </div>

                    {/* Izoh yoki havola (ixtiyoriy) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        6. Ekspert uchun qoʻshimcha izoh yoki havola (ixtiyoriy)
                      </label>
                      <textarea
                        rows={2}
                        value={modalDescription}
                        onChange={(e) => setModalDescription(e.target.value)}
                        placeholder="Veb-havola, Scopus/ResearchGate profili yoki nashr haqida qoʻshimcha maʼlumot..."
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kiritilgan natija masʼul ekspert va komissiya tekshiruviga yuboriladi.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setEditingSubmission(null);
                      }}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingNewKpi}
                      className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmittingNewKpi ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saqlanmoqda...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{editingSubmission ? "Oʻzgarishlarni saqlash" : "Arizani tasdiqlashga yuborish"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: HEMIS O'QUV YUKLAMASI BATAFSIL TAHLIL MODALI (WORKLOAD MODAL) */}
      {/* ========================================================================= */}
      {selectedWorkloadTeacher && (() => {
        // Mantiqiy zanjir xavfsizlik nazorati (Security verification):
        const isAccessAllowed = activeRole === "ADMIN" || activeRole === "RECTORATE"
          || (activeRole === "TEACHER" && currentUser?.name && (
              selectedWorkloadTeacher.name.toLowerCase().includes(currentUser.name.toLowerCase())
              || currentUser.name.toLowerCase().includes(selectedWorkloadTeacher.name.toLowerCase())
            ))
          || (activeRole === "HEAD_OF_DEPT" && (
              selectedWorkloadTeacher.name.toLowerCase().includes(currentUser?.name?.toLowerCase() || "")
              || (selectedWorkloadTeacher.department && currentUser?.department && (
                  selectedWorkloadTeacher.department.toLowerCase().includes(currentUser.department.toLowerCase())
                  || currentUser.department.toLowerCase().includes(selectedWorkloadTeacher.department.toLowerCase())
                ))
            ))
          || (activeRole === "DEAN" && (
              selectedWorkloadTeacher.name.toLowerCase().includes(currentUser?.name?.toLowerCase() || "")
              || (() => {
                  if (!currentUser?.faculty) return false;
                  const facName = currentUser.faculty.toLowerCase().trim();
                  const facultyDepts = structureHierarchy?.faculties
                    ?.find(f => f.name.toLowerCase().includes(facName) || facName.includes(f.name.toLowerCase()))
                    ?.departments.map(d => d.name.toLowerCase().trim()) || [];
                  return facultyDepts.some(d => (selectedWorkloadTeacher.department || "").toLowerCase().includes(d) || d.includes((selectedWorkloadTeacher.department || "").toLowerCase()));
                })()
            ));

        if (!isAccessAllowed) {
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
              <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 text-center ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h4 className="text-base font-bold">Ruxsat cheklangan</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Mantiqiy zanjir qoidalariga binoan oʻqituvchi faqat oʻzining shaxsiy dars yuklamasini koʻrish huquqiga ega. Boshqa oʻqituvchilar yuklamalarini koʻrish faqat tegishli kafedra mudiri, dekan yoki rahbariyatga ruxsat etilgan.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedWorkloadTeacher(null)}
                  className="mt-5 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Tushundim, yopish
                </button>
              </div>
            </div>
          );
        }

        const wData = getTeacherWorkloadData(selectedWorkloadTeacher.id || selectedWorkloadTeacher.name);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
            <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl p-6 transition-all my-8 ${
              theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
            }`}>
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{selectedWorkloadTeacher.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        HEMIS Workload
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedWorkloadTeacher.department || wData?.departmentName || "Kafedra"} • 2025/2026-oʻquv yili oʻquv yuklamasi
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedWorkloadTeacher(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {wData ? (
                <div className="space-y-5">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Jami soat</span>
                      <div className="text-xl font-black text-blue-900 dark:text-blue-300">{wData.totalHours} <span className="text-xs font-normal text-slate-400">soat</span></div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Fanlar soni</span>
                      <div className="text-xl font-black text-slate-900 dark:text-slate-100">{wData.subjectsCount} <span className="text-xs font-normal text-slate-400">ta</span></div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Bakalavriat</span>
                      <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{wData.bachelorHours} <span className="text-xs font-normal text-slate-400">soat</span></div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Magistratura</span>
                      <div className="text-xl font-black text-purple-600 dark:text-purple-400">{wData.masterHours} <span className="text-xs font-normal text-slate-400">soat</span></div>
                    </div>
                  </div>

                  {/* Subjects Table */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Biriktirilgan fanlar reyestri</h4>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3">№</th>
                            <th className="py-2.5 px-3">Fan nomi</th>
                            <th className="py-2.5 px-3">Kafedra</th>
                            <th className="py-2.5 px-3">Taʼlim turi</th>
                            <th className="py-2.5 px-3 text-right">Yuklama</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {wData.subjects.map((s, idx) => (
                            <tr key={`modal-subj-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-2.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{s.subject_name}</td>
                              <td className="py-2.5 px-3 text-slate-500">{s.department_name}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s.education_type_name === "Magistr" || s.education_type_code === "12"
                                    ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300"
                                    : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                                }`}>
                                  {s.education_type_name || "Bakalavr"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">
                                {s.total_hours} soat
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-400">
                  Ushbu oʻqituvchi boʻyicha HEMIS tizimidan oʻquv yuklamasi topilmadi.
                </div>
              )}

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedWorkloadTeacher(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
                  onClick={() => showAlert({
                    title: "Ekspert koʻrigi hujjati",
                    message: `Biriktirilgan asoslovchi fayl: "${selectedSubForReview.file_name}". Tizimda hujjat fayli toʻliq tekshiruv uchun yuklangan.`,
                    type: "info"
                  })}
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

      {/* ========================================================================= */}
      {/* MODAL: YANGI BAHOLOVCHI / EKSPERT TAYINLASH */}
      {/* ========================================================================= */}
      {isAddEvaluatorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Yangi baholovchi / ekspert tayinlash</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mezon yoʻnalishlari boʻyicha masʼul shaxsni biriktirish</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEvaluatorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvaluator} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Baholovchi F.I.Sh. *
                </label>
                <input
                  type="text"
                  required
                  value={evalFormName}
                  onChange={(e) => setEvalFormName(e.target.value)}
                  placeholder="Masalan: Prof. Rahimov Ulugʻbek Shavkatovich"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Foydalanuvchi logini (username)
                  </label>
                  <input
                    type="text"
                    value={evalFormUsername}
                    onChange={(e) => setEvalFormUsername(e.target.value)}
                    placeholder="Masalan: prof_rahimov"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ekspertlik roli
                  </label>
                  <select
                    value={evalFormRole}
                    onChange={(e) => setEvalFormRole(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none font-medium"
                  >
                    <option value="EXPERT">Soha eksperti (Yoʻnalish boʻyicha)</option>
                    <option value="COMMISSION">Apellyatsiya komissiyasi aʼzosi</option>
                    <option value="HEAD_OF_DEPT">Kafedra mudiri</option>
                    <option value="DEAN">Fakultet dekani</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Masʼul yoʻnalishi / Mezon bloki *
                </label>
                <select
                  value={evalFormCategory}
                  onChange={(e) => setEvalFormCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                >
                  <option value="2. Ilmiy va innovatsion faoliyat">2. Ilmiy va innovatsion faoliyat (Scopus, jurnallar, patentlar)</option>
                  <option value="1. Oʻquv-uslubiy faoliyat">1. Oʻquv-uslubiy faoliyat (Darsliklar, qoʻllanmalar, ochiq darslar)</option>
                  <option value="3. Xalqaro hamkorlik va til">3. Xalqaro hamkorlik va til sertifikatlari</option>
                  <option value="4. Maʼnaviy-maʼrifiy va tarbiyaviy faoliyat">4. Maʼnaviy-maʼrifiy va tarbiyaviy ishlar</option>
                  <option value="Dasturiy injiniring kafedrasi">Dasturiy injiniring kafedrasi</option>
                  <option value="Amaliy matematika va informatika kafedrasi">Amaliy matematika va informatika kafedrasi</option>
                  <option value="Barcha yoʻnalishlar boʻyicha bosh komissiya">Barcha yoʻnalishlar boʻyicha bosh komissiya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Baholashni yakunlash muddati (Deadline)
                </label>
                <input
                  type="date"
                  required
                  value={evalFormDeadline}
                  onChange={(e) => setEvalFormDeadline(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEvaluatorModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isEvaluatorSaving}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                >
                  {isEvaluatorSaving ? "Saqlanmoqda..." : "Baholovchini tayinlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RAD ETILGAN ARIZAGA TO'G'RIDAN-TO'G'RI APELLATSIYA BERISH */}
      {/* ========================================================================= */}
      {isAppealModalOpen && selectedSubForAppeal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span>Apellyatsiya arizasini topshirish</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Rad etilgan natija yuzasidan komissiyaga asosli eʼtiroz</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAppealModalOpen(false);
                  setSelectedSubForAppeal(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dastlabki ariza detallari */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs mb-4 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Ariza kodi & Mezon:</span>
                <span className="font-mono font-bold text-blue-900 dark:text-blue-400">#{selectedSubForAppeal.id} (Mezon: {selectedSubForAppeal.indicator_id})</span>
              </div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{selectedSubForAppeal.title}</div>
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300">
                <b>Dastlabki rad etish sababi:</b> {selectedSubForAppeal.rejection_reason || selectedSubForAppeal.reviewer_comment || "Koʻrikda talabga mos kelmagan"}
              </div>
            </div>

            <form onSubmit={handleSubmitSubAppeal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Eʼtirozning asosli tavsifi va rad etishga raddiya *
                </label>
                <textarea
                  rows={4}
                  required
                  value={appealFormReason}
                  onChange={(e) => setAppealFormReason(e.target.value)}
                  placeholder="Masalan: Maqola xalqaro bazada indekslanganligi boʻyicha toʻliq dalillar mavjud. Dastlabki koʻrikda havola xato tushunilgan. Havola yangilandi va ilova qilindi..."
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Qoʻshimcha tasdiqlovchi hujjat nomi yoki elektron havola
                </label>
                <input
                  type="text"
                  value={appealFormEvidence}
                  onChange={(e) => setAppealFormEvidence(e.target.value)}
                  placeholder="Masalan: scopus_tasdiqnoma_2026_updated.pdf yoki DOI/veb havola"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-900 dark:text-blue-300">
                <b>Eslatma:</b> Apellyatsiya arizangiz arizani dastlab rad etgan shaxs tomonidan emas, balki Rektorat tomonidan tuzilgan <b>mustaqil Apellyatsiya komissiyasi</b> tomonidan koʻrib chiqiladi.
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAppealModalOpen(false);
                    setSelectedSubForAppeal(null);
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isAppealSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                >
                  {isAppealSubmitting ? "Yuborilmoqda..." : "Apellyatsiyani komissiyaga yuborish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KOMISSIYA UCHUN APELLATSIYANI KO'RIB CHIQISH VA QAROR QABUL QILISH */}
      {/* ========================================================================= */}
      {isReviewAppealModalOpen && selectedAppealForReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>Apellyatsiya komissiyasi qarori</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ariza kodi: {selectedAppealForReview.id}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsReviewAppealModalOpen(false);
                  setSelectedAppealForReview(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Apellyatsiya ma'lumotlari */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Arizachi muallif:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedAppealForReview.teacher_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Mezon & Daʼvo balli:</span>
                <span className="font-mono font-bold text-blue-900 dark:text-blue-400">{selectedAppealForReview.indicator_id} — {selectedAppealForReview.claimed_ball || 0} ball</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                <div className="font-bold text-slate-600 dark:text-slate-400 text-[11px] mb-1">Oʻqituvchining eʼtiroz dalili:</div>
                <div className="leading-relaxed">{selectedAppealForReview.reason || selectedAppealForReview.appeal_reason}</div>
              </div>
            </div>

            <form onSubmit={handleSubmitAppealReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Komissiya yakuniy qarori *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAppealReviewStatus("ACCEPTED")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      appealReviewStatus === "ACCEPTED"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    ✓ Qanoatlantirilsin
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppealReviewStatus("PARTIALLY_ACCEPTED")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      appealReviewStatus === "PARTIALLY_ACCEPTED"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    ≈ Qisman qabul
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppealReviewStatus("REJECTED")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      appealReviewStatus === "REJECTED"
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    ✗ Rad etilsin
                  </button>
                </div>
              </div>

              {appealReviewStatus !== "REJECTED" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tiklanadigan / Beriladigan ball (0 - {selectedAppealForReview.claimed_ball || 10})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="15"
                    required
                    value={appealReviewBall}
                    onChange={(e) => setAppealReviewBall(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-900 focus:outline-none font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Komissiya xulosasi va asoslangan tushuntirish *
                </label>
                <textarea
                  rows={3}
                  required
                  value={appealReviewComment}
                  onChange={(e) => setAppealReviewComment(e.target.value)}
                  placeholder="Masalan: Qoʻshimcha taqdim etilgan dalillar tekshirildi va eʼtiroz oʻrinli deb topildi. 8.0 ball toʻliq tiklandi."
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewAppealModalOpen(false);
                    setSelectedAppealForReview(null);
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isAppealReviewing}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                >
                  {isAppealReviewing ? "Tasdiqlanmoqda..." : "Qarorni qabul qilish va ballni saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TO'LIQ EKRANLI FAN BOSHQARUV KABINETI (FULL-PAGE SUBJECT FOCUS CABINET) */}
      {/* ========================================================================= */}
      {(courseDocsModalOpen || workflowModalOpen || publicationModalOpen || hemisSubjectModalOpen) && selectedWorkflowSubject && (
        <div className="fixed inset-0 z-50 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-md overflow-y-auto flex flex-col animate-in fade-in duration-150">
          
          {/* Tepa navigatsiya paneli (Sticky Header) */}
          <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCloseSubjectCabinet}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                title="Fanlar roʻyxatiga qaytish"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Fanlar roʻyxatiga qaytish</span>
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedWorkflowSubject.subject_name}</span>
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
                    {selectedWorkflowSubject.total_hours} soat
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  <span>Kafedra: <b>{selectedWorkflowSubject.department_name}</b></span>
                  <span>•</span>
                  <span>Oʻqituvchi: <b>{selectedWorkflowSubject.teacher_name}</b></span>
                  {selectedWorkflowSubject.education_type_name && (
                    <>
                      <span>•</span>
                      <span>Taʼlim shakli: <b>{selectedWorkflowSubject.education_type_name}</b></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 3 ta toza tab tugmalari */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setWorkflowSubTab("hemis_resources")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  workflowSubTab === "hemis_resources"
                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>1. HEMIS bazasi va soatlar</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold">
                  {activeSubjectHemisResources.length} ta
                </span>
              </button>

              <button
                type="button"
                onClick={() => setWorkflowSubTab("docs")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  workflowSubTab === "docs"
                    ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>2. Oʻquv hujjatlari (Sillabus)</span>
                <span className="px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold">
                  {courseDocsList.length} ta
                </span>
              </button>

              <button
                type="button"
                onClick={() => setWorkflowSubTab("publications")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  workflowSubTab === "publications"
                    ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>3. Darslik va tavsiyanoma</span>
                <span className="px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 text-[10px] font-mono font-bold">
                  {publicationsList.length} ta
                </span>
              </button>
            </div>
          </div>

          {/* Asosiy kontent maydoni */}
          <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">

            {/* ========================================================================= */}
            {/* TAB 1: HEMIS BAZASI VA SOATLAR */}
            {/* ========================================================================= */}
            {workflowSubTab === "hemis_resources" && (
              <div className="space-y-5">
                {/* Fanning o'quv rejadagi rasmiy soatlari */}
                {activeSubjectCurriculumSubject && (
                  <div className={`p-5 rounded-2xl border shadow-xs ${
                    theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2 mb-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          HEMIS Rasmiy Oʻquv Reja Mezonlari
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {activeSubjectCurriculumSubject.subject_name} ({activeSubjectCurriculumSubject.semester_name})
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs">
                          {activeSubjectCurriculumSubject.credit} Kredit
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs">
                          Jami: {activeSubjectCurriculumSubject.total_acload} soat
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500 font-semibold">Maʼruza</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {activeSubjectCurriculumSubject.lecture_hours} soat
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500 font-semibold">Amaliy mashgʻulot</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {activeSubjectCurriculumSubject.practical_hours} soat
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500 font-semibold">Laboratoriya</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {activeSubjectCurriculumSubject.lab_hours} soat
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-500 font-semibold">Seminar</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {activeSubjectCurriculumSubject.seminar_hours} soat
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                        <div className="text-[11px] text-slate-500 font-semibold">Mustaqil taʼlim</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {activeSubjectCurriculumSubject.independent_hours} soat
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* HEMIS fayllari ro'yxati */}
                <div className={`p-5 rounded-2xl border shadow-xs ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>HEMIS Tizimidagi Rasmiy Fayllar ({activeSubjectHemisResources.length} ta)</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        HEMIS serveriga yuklangan maʼruza, amaliyot va boshqa oʻquv materiallari
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fetchSubjectHemisDetails(selectedWorkflowSubject?.subject_name, selectedWorkflowSubject?.teacher_name, true)}
                        disabled={isSubjectHemisResourcesLoading}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="HEMIS API dan jonli qayta yuklash"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSubjectHemisResourcesLoading ? "animate-spin" : ""}`} />
                        <span>Qayta tekshirish</span>
                      </button>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={hemisResourceSearch}
                          onChange={(e) => setHemisResourceSearch(e.target.value)}
                          placeholder="Fayllar ichidan qidirish..."
                          className={`pl-8 pr-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 w-56 ${
                            theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mashg'ulot turlari filtri */}
                  <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
                    {[
                      { id: "ALL", label: "Barchasi" },
                      { id: "MAʼRUZA", label: "Maʼruza" },
                      { id: "AMALIY", label: "Amaliy" },
                      { id: "LABORATORIYA", label: "Laboratoriya" },
                      { id: "SEMINAR", label: "Seminar" }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setHemisResourceFilterType(f.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          hemisResourceFilterType === f.id
                            ? "bg-emerald-800 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {isSubjectHemisResourcesLoading ? (
                    <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                      <span>HEMIS tizimidan fanning rasmiy resurslari tekshirilmoqda...</span>
                    </div>
                  ) : activeSubjectHemisResources.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
                      Ushbu fan boʻyicha HEMIS tizimida hali yuklangan rasmiy fayllar topilmadi. "Qayta tekshirish" tugmasini bosing.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeSubjectHemisResources
                        .filter(res => {
                          const term = hemisResourceSearch.toLowerCase();
                          const matchesSearch = !term || res.title.toLowerCase().includes(term) || (res.file_name && res.file_name.toLowerCase().includes(term)) || (res.employee_name && res.employee_name.toLowerCase().includes(term));
                          const matchesType = hemisResourceFilterType === "ALL" || (res.training_type && res.training_type.toUpperCase().includes(hemisResourceFilterType));
                          return matchesSearch && matchesType;
                        })
                        .map(res => (
                          <div
                            key={res.id}
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                              theme === "dark" ? "bg-slate-800/50 border-slate-800 hover:bg-slate-800" : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/60"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                                  <span>{res.title}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                                    {res.training_type || "Oʻquv materiali"}
                                  </span>
                                </h5>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                  <span>Fayl: <b className="font-mono text-slate-700 dark:text-slate-300">{res.file_name}</b></span>
                                  <span>Hajmi: <b>{res.file_size ? `${(res.file_size / 1024).toFixed(1)} KB` : "Nomaʼlum"}</b></span>
                                  <span>Yuklagan: <b>{res.employee_name}</b></span>
                                  {res.updated_at_ts && (
                                    <span>Sana: <b>{new Date(res.updated_at_ts * 1000).toLocaleDateString()}</b></span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <a
                              href={res.file_url}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors self-start sm:self-center flex-shrink-0 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Koʻrish / Yuklash</span>
                            </a>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: O'QUV-USLUBIY HUJJATLAR (SILLABUS & MAJBURIY QISM) */}
            {/* ========================================================================= */}
            {workflowSubTab === "docs" && (
              <div className="space-y-5">
                <div className={`p-5 rounded-2xl border shadow-xs ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Fan Boʻyicha Majburiy Hujjatlar Nazorati</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Oʻquv mashgʻuloti turlariga qarab yuklanishi shart boʻlgan oʻquv-uslubiy materiallar
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddCourseDocFormOpen(!isAddCourseDocFormOpen)}
                      className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddCourseDocFormOpen ? "Formani yopish" : "+ Yangi hujjat yuklash"}</span>
                    </button>
                  </div>

                  {/* Mashg'ulot turlari tezkor tekshiruvi */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Sizga biriktirilgan mashgʻulot turlari:
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={teacherTrainingRoles.hasLecture}
                          onChange={(e) => setTeacherTrainingRoles(p => ({ ...p, hasLecture: e.target.checked }))}
                          className="rounded text-blue-900 focus:ring-blue-900"
                        />
                        <span>Maʼruza</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={teacherTrainingRoles.hasPractical}
                          onChange={(e) => setTeacherTrainingRoles(p => ({ ...p, hasPractical: e.target.checked }))}
                          className="rounded text-blue-900 focus:ring-blue-900"
                        />
                        <span>Amaliyot</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={teacherTrainingRoles.hasLab}
                          onChange={(e) => setTeacherTrainingRoles(p => ({ ...p, hasLab: e.target.checked }))}
                          className="rounded text-blue-900 focus:ring-blue-900"
                        />
                        <span>Laboratoriya</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={teacherTrainingRoles.hasSeminar}
                          onChange={(e) => setTeacherTrainingRoles(p => ({ ...p, hasSeminar: e.target.checked }))}
                          className="rounded text-blue-900 focus:ring-blue-900"
                        />
                        <span>Seminar</span>
                      </label>
                    </div>
                  </div>

                  {/* Yangi hujjat yuklash formasi */}
                  {isAddCourseDocFormOpen && (
                    <form onSubmit={handleUploadCourseDocSubmit} className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 mb-5 space-y-3.5">
                      <h5 className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Yangi oʻquv-uslubiy hujjatni biriktirish</span>
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Hujjat turi *
                          </label>
                          <select
                            value={newCourseDocType}
                            onChange={(e: any) => setNewCourseDocType(e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                          >
                            <option value="SYLLABUS">Fan sillabusi / Ishchi fan dasturi</option>
                            <option value="WORK_PROGRAM">Ishchi oʻquv dasturi</option>
                            <option value="LECTURE_NOTES">Maʼruzalar matni va taqdimotlar</option>
                            <option value="PRACTICAL_GUIDE">Amaliy mashgʻulotlar uslubiy koʻrsatmasi</option>
                            <option value="LAB_GUIDE">Laboratoriya ishlari uslubiy koʻrsatmasi</option>
                            <option value="SEMINAR_GUIDE">Seminar mashgʻulotlari uslubiy koʻrsatmasi</option>
                            <option value="INDEPENDENT_STUDY_GUIDE">Mustaqil taʼlim uslubiy koʻrsatmasi</option>
                            <option value="ASSESSMENT_CRITERIA">Baholash mezonlari va nazorat savollari</option>
                            <option value="OTHER">Boshqa oʻquv-uslubiy material</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            Hujjat sarlavhasi *
                          </label>
                          <input
                            type="text"
                            required
                            value={newCourseDocTitle}
                            onChange={(e) => setNewCourseDocTitle(e.target.value)}
                            placeholder="Masalan: 2025/2026 oʻquv yili uchun fan sillabusi"
                            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 text-xs">
                          Faylni tanlang (PDF, DOCX) *
                        </label>
                        <input
                          type="file"
                          required
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewCourseDocFile(e.target.files[0]);
                            }
                          }}
                          className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs font-medium cursor-pointer"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddCourseDocFormOpen(false)}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Bekor qilish
                        </button>
                        <button
                          type="submit"
                          disabled={isCourseDocUploading}
                          className="px-4 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isCourseDocUploading ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Yuklanmoqda...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3" />
                              <span>Hujjatni saqlash</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Yuklangan hujjatlar ro'yxati */}
                  {isCourseDocsLoading ? (
                    <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span>Oʻquv hujjatlari yuklanmoqda...</span>
                    </div>
                  ) : courseDocsList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                      Ushbu fan boʻyicha hali oʻquv-uslubiy hujjat yuklanmagan. "+ Yangi hujjat yuklash" tugmasini bosing.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {courseDocsList.map(doc => {
                        const isApprovedByMudir = doc.mudir_status === "APPROVED";
                        const isApprovedByDean = doc.dean_status === "APPROVED";

                        return (
                          <div
                            key={doc.id}
                            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                              theme === "dark" ? "bg-slate-800/40 border-slate-800" : "bg-slate-50/70 border-slate-200"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    {doc.title}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-900">
                                    {getDocTypeLabel(doc.doc_type)}
                                  </span>
                                </div>

                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                  <span>Yuklangan: <b>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ""}</b></span>
                                  <span>•</span>
                                  <span>Mudir: <b className={isApprovedByMudir ? "text-emerald-600" : doc.mudir_status === "REJECTED" ? "text-rose-600" : "text-amber-600"}>{doc.mudir_status || "PENDING"}</b></span>
                                  <span>•</span>
                                  <span>Dekan: <b className={isApprovedByDean ? "text-emerald-600" : doc.dean_status === "REJECTED" ? "text-rose-600" : "text-amber-600"}>{doc.dean_status || "PENDING"}</b></span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                              {(currentUser?.role === "HEAD_OF_DEPT" || currentUser?.role === "ADMIN") && doc.mudir_status !== "APPROVED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveDocForReview(doc);
                                    setCourseDocReviewRole("mudir");
                                    setCourseDocReviewStatus("APPROVED");
                                    setCourseDocReviewComment("");
                                    setCourseDocReviewModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Mudir xulosasi
                                </button>
                              )}

                              {(currentUser?.role === "DEAN" || currentUser?.role === "ADMIN") && doc.mudir_status === "APPROVED" && doc.dean_status !== "APPROVED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveDocForReview(doc);
                                    setCourseDocReviewRole("dean");
                                    setCourseDocReviewStatus("APPROVED");
                                    setCourseDocReviewComment("");
                                    setCourseDocReviewModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Dekan tasdigʻi
                                </button>
                              )}

                              {doc.file_url && (
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Koʻrish</span>
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteCourseDocConfirm(doc)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                title="Oʻchirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: DARSLIK, O'QUV QO'LLANMA VA GRIF TAVSIYANOMASI */}
            {/* ========================================================================= */}
            {workflowSubTab === "publications" && (
              <div className="space-y-5">
                <div className={`p-5 rounded-2xl border shadow-xs ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Fan Boʻyicha Darslik va Oʻquv Qoʻllanmalar Zanjiri</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Kafedra muhokamasi, fakultet va universitet ilmiy kengashidan tavsiyanoma olish
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPubModalFormOpen(true)}
                      className="px-3.5 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Yangi darslik / qoʻllanma qoʻshish</span>
                    </button>
                  </div>

                  {/* Mavjud nashrlar ro'yxati */}
                  {isPubsLoading ? (
                    <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                      <span>Nashrlar maʼlumotlari yuklanmoqda...</span>
                    </div>
                  ) : publicationsList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                      Ushbu fan boʻyicha hali darslik yoki oʻquv qoʻllanma kiritilmagan. "+ Yangi darslik / qoʻllanma qoʻshish" tugmasini bosing.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {publicationsList.map(pub => (
                        <div
                          key={pub.id}
                          className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                            theme === "dark" ? "bg-slate-800/40 border-slate-800" : "bg-slate-50/70 border-slate-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {pub.title}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-900">
                                  {pub.pub_type}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-mono font-bold">
                                  Originallik: {pub.antiplagiarism_score}%
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                <span>Mualliflar: <b>{pub.authors}</b></span>
                                <span>•</span>
                                <span>Kafedra: <b className={pub.kafedra_status === "APPROVED" ? "text-emerald-600" : pub.kafedra_status === "REJECTED" ? "text-rose-600" : "text-amber-600"}>{pub.kafedra_status}</b></span>
                                <span>•</span>
                                <span>Fakultet: <b className={pub.fakultet_status === "APPROVED" ? "text-emerald-600" : pub.fakultet_status === "REJECTED" ? "text-rose-600" : "text-amber-600"}>{pub.fakultet_status}</b></span>
                                <span>•</span>
                                <span>OʻUK: <b className={pub.methodical_status === "APPROVED" ? "text-emerald-600" : pub.methodical_status === "REJECTED" ? "text-rose-600" : "text-amber-600"}>{pub.methodical_status}</b></span>
                                <span>•</span>
                                <span>Filial Kengashi: <b className={pub.council_status === "APPROVED" ? "text-emerald-600" : pub.council_status === "REJECTED" ? "text-rose-600" : "text-amber-600"}>{pub.council_status}</b></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0 flex-wrap">
                            {/* Kafedra mudiri bosqichi */}
                            {(currentUser?.role === "HEAD_OF_DEPT" || currentUser?.role === "ADMIN") && pub.kafedra_status === "PENDING" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePubForReview(pub);
                                  setReviewStageName("kafedra");
                                  setReviewDecision("APPROVED");
                                  setReviewProtocolNum("");
                                  setReviewProtocolDate(new Date().toISOString().split("T")[0]);
                                  setReviewProtocolFile(null);
                                  setReviewComment("");
                                  setReviewStageModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Kafedra xulosasi
                              </button>
                            )}

                            {/* Dekan bosqichi */}
                            {(currentUser?.role === "DEAN" || currentUser?.role === "ADMIN") && pub.kafedra_status === "APPROVED" && pub.fakultet_status === "PENDING" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePubForReview(pub);
                                  setReviewStageName("fakultet");
                                  setReviewDecision("APPROVED");
                                  setReviewProtocolNum("");
                                  setReviewProtocolDate(new Date().toISOString().split("T")[0]);
                                  setReviewProtocolFile(null);
                                  setReviewComment("");
                                  setReviewStageModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Fakultet kengashi
                              </button>
                            )}

                            {/* O'quv-uslubiy boshqarma bosqichi */}
                            {(currentUser?.role === "ADMIN" || currentUser?.role === "RECTORATE") && pub.fakultet_status === "APPROVED" && pub.methodical_status === "PENDING" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePubForReview(pub);
                                  setReviewStageName("methodical");
                                  setReviewDecision("APPROVED");
                                  setReviewProtocolNum("");
                                  setReviewProtocolDate(new Date().toISOString().split("T")[0]);
                                  setReviewProtocolFile(null);
                                  setReviewComment("");
                                  setReviewStageModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                              >
                                OʻUK xulosasi
                              </button>
                            )}

                            {/* Filial kengashi bosqichi */}
                            {(currentUser?.role === "ADMIN" || currentUser?.role === "RECTORATE") && pub.methodical_status === "APPROVED" && pub.council_status === "PENDING" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePubForReview(pub);
                                  setReviewStageName("council");
                                  setReviewDecision("APPROVED");
                                  setReviewProtocolNum("");
                                  setReviewProtocolDate(new Date().toISOString().split("T")[0]);
                                  setReviewProtocolFile(null);
                                  setReviewComment("");
                                  setReviewStageModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Filial Kengashi
                              </button>
                            )}

                            {/* my.gov.uz va Grif */}
                            {pub.council_status === "APPROVED" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActivePubForMyGov(pub);
                                  setMyGovAppNum(pub.mygov_app_num || "");
                                  setMinistryGrifNum(pub.ministry_grif_num || "");
                                  setMinistryCertFile(null);
                                  setMyGovModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                              >
                                my.gov.uz & Grif
                              </button>
                            )}

                            {pub.manuscript_file && (
                              <a
                                href={pub.manuscript_file}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Qoʻlyozma</span>
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePublicationConfirm(pub)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Oʻchirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FAN HUJJATINI KO'RIB CHIQISH (MUDIR / DEKAN) */}
      {/* ========================================================================= */}
      {courseDocReviewModalOpen && activeDocForReview && (
        <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                  <span>{courseDocReviewRole === "mudir" ? "Kafedra mudiri xulosasi" : "Fakultet dekani tasdigʻi"}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Fan: {activeDocForReview.subject_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setCourseDocReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs mb-4 space-y-1">
              <div><b>Hujjat sarlavhasi:</b> {activeDocForReview.title}</div>
              <div><b>Turi:</b> {activeDocForReview.doc_type}</div>
              <div><b>Muallif:</b> {activeDocForReview.teacher_name}</div>
              <div className="pt-1">
                <a
                  href={activeDocForReview.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Faylni ochish va koʻrib chiqish</span>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5">Qaror *</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCourseDocReviewStatus("APPROVED")}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      courseDocReviewStatus === "APPROVED"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Maʼqullash (Tasdiqlash)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseDocReviewStatus("REJECTED")}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      courseDocReviewStatus === "REJECTED"
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Qaytarish (Rad etish)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Xulosa / Tavsiya yoki kamchiliklar izohi</label>
                <textarea
                  rows={3}
                  value={courseDocReviewComment}
                  onChange={(e) => setCourseDocReviewComment(e.target.value)}
                  placeholder="Hujjat boʻyicha fikr va koʻrsatmalar..."
                  className="w-full p-2.5 border rounded-xl text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCourseDocReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={isCourseDocReviewing}
                  onClick={handleReviewCourseDocSubmit}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  {isCourseDocReviewing ? "Saqlanmoqda..." : "Qarorni saqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: YANGI ADABIYOT TAVSIYANOMASI FORMASI */}
      {/* ========================================================================= */}
      {pubModalFormOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                  <span>Darslik, Oʻquv qoʻllanma yoki Monografiyani kengashlarga tavsiya etish</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fanga oid: {selectedWorkflowSubject?.subject_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPubModalFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePublicationSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Nashr turi *</label>
                  <select
                    value={newPubType}
                    onChange={(e) => setNewPubType(e.target.value as any)}
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="DARSLIK">Darslik</option>
                    <option value="OʻQUV QOʻLLANMA">Oʻquv qoʻllanma</option>
                    <option value="USLUBIY QOʻLLANMA">Uslubiy qoʻllanma</option>
                    <option value="MONOGRAFIYA">Monografiya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Antiplagiat originallik koʻrsatkichi (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={newPubAntiplagiatScore}
                    onChange={(e) => setNewPubAntiplagiatScore(parseFloat(e.target.value) || 0)}
                    placeholder="Masalan: 86.4"
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Adabiyotning toʻliq nomi *</label>
                <input
                  type="text"
                  required
                  value={newPubTitle}
                  onChange={(e) => setNewPubTitle(e.target.value)}
                  placeholder="Masalan: Psixologiya fanidan amaliy mashgʻulotlar uchun oʻquv qoʻllanma"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Asosiy muallif(lar) F.I.SH. *</label>
                  <input
                    type="text"
                    required
                    value={newPubAuthors}
                    onChange={(e) => setNewPubAuthors(e.target.value)}
                    placeholder="Masalan: Abdiyeva Dilsoʻz Nasritdin qizi"
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Hammualliflar (agar mavjud boʻlsa)</label>
                  <input
                    type="text"
                    value={newPubCoAuthors}
                    onChange={(e) => setNewPubCoAuthors(e.target.value)}
                    placeholder="F.I.SH., ilmiy darajasi"
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Ichki taqrizchi F.I.SH. va unvoni</label>
                  <input
                    type="text"
                    value={newPubInternalReviewer}
                    onChange={(e) => setNewPubInternalReviewer(e.target.value)}
                    placeholder="Masalan: dots. X.Xalilov"
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Tashqi taqrizchi F.I.SH. va tashkiloti</label>
                  <input
                    type="text"
                    value={newPubExternalReviewer}
                    onChange={(e) => setNewPubExternalReviewer(e.target.value)}
                    placeholder="Masalan: prof. A.Rustamov (OʻzMU)"
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Fayllar yuklash bloki (Majburiy 5 ta PDF, har biri <=10MB) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Majburiy ilova qilinadigan PDF hujjatlar toʻplami:</span>
                  <span className="text-[10px] text-amber-600 font-semibold">Har bir fayl hajmi max 10 MB</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                    <label className="block font-bold mb-1">1. Qoʻlyozmaning toʻliq fayli (PDF) *</label>
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFileManuscript(e.target.files?.[0] || null)}
                      className="w-full text-[10px] cursor-pointer"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                    <label className="block font-bold mb-1">2. Ichki taqriz fayli (PDF) *</label>
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFileInternalReview(e.target.files?.[0] || null)}
                      className="w-full text-[10px] cursor-pointer"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                    <label className="block font-bold mb-1">3. Tashqi taqriz fayli (PDF) *</label>
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFileExternalReview(e.target.files?.[0] || null)}
                      className="w-full text-[10px] cursor-pointer"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                    <label className="block font-bold mb-1">4. Fanning (ishchi) oʻquv dasturi (PDF) *</label>
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFileCurriculum(e.target.files?.[0] || null)}
                      className="w-full text-[10px] cursor-pointer"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 sm:col-span-2">
                    <label className="block font-bold mb-1 text-emerald-900 dark:text-emerald-300">
                      5. Antiplagiat tizimidan oʻtkazilganlik hisoboti va sertifikati (PDF) *
                    </label>
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFileAntiplagiat(e.target.files?.[0] || null)}
                      className="w-full text-[10px] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPubModalFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isPubSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  {isPubSubmitting ? "Yuklanmoqda (bir necha soniya)..." : "Tavsiyanomani roʻyxatdan oʻtkazish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KENGASH BAYONNOMASI BIRIKTIRISH VA TASDIQLASH */}
      {/* ========================================================================= */}
      {reviewStageModalOpen && activePubForReview && (
        <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>
                    {reviewStageName === "kafedra" && "1-Bosqich: Kafedra yigʻilishi bayonnomasi"}
                    {reviewStageName === "fakultet" && "2-Bosqich: Fakultet Kengashi bayonnomasi"}
                    {reviewStageName === "methodical" && "3-Bosqich: Filial Oʻquv-uslubiy Kengashi"}
                    {reviewStageName === "council" && "4-Bosqich: Filial Ilmiy Kengashi qarori"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nashr: {activePubForReview.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewStageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewDecision("APPROVED")}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    reviewDecision === "APPROVED"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Maʼqullash (Keyingi bosqichga)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewDecision("REJECTED")}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    reviewDecision === "REJECTED"
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Qaytarish (Rad etish)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Bayonnoma raqami *</label>
                  <input
                    type="text"
                    value={reviewProtocolNum}
                    onChange={(e) => setReviewProtocolNum(e.target.value)}
                    placeholder="Masalan: 4-son"
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Bayonnoma sanasi *</label>
                  <input
                    type="date"
                    value={reviewProtocolDate}
                    onChange={(e) => setReviewProtocolDate(e.target.value)}
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Bayonnoma skaner nusxasi (PDF, max 10 MB)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setReviewProtocolFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Kengash xulosasi / Izoh</label>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Kengash aʼzolarining taklif va mulohazalari..."
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReviewStageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={isStageReviewing}
                  onClick={handleReviewStageSubmit}
                  className="px-5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  {isStageReviewing ? "Saqlanmoqda..." : "Bayonnomani tasdiqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MY.GOV.UZ VA VAZIRLIK GRIFI MA'LUMOTLARI */}
      {/* ========================================================================= */}
      {myGovModalOpen && activePubForMyGov && (
        <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                  <span>my.gov.uz va Vazirlik Grifi arizasi</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Filial koʻchirmasi asosida yuborilgan ariza</p>
              </div>
              <button
                type="button"
                onClick={() => setMyGovModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">my.gov.uz ariza roʻyxat raqami *</label>
                <input
                  type="text"
                  required
                  value={myGovAppNum}
                  onChange={(e) => setMyGovAppNum(e.target.value)}
                  placeholder="Masalan: APP-2026-98124"
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Vazirlik tomonidan berilgan Grif raqami (agar chiqqan boʻlsa)</label>
                <input
                  type="text"
                  value={ministryGrifNum}
                  onChange={(e) => setMinistryGrifNum(e.target.value)}
                  placeholder="Masalan: № 412-089 (2026-yil 12-fevral)"
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono font-bold text-purple-700 dark:text-purple-300"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Vazirlik guvohnomasi / Grif sertifikati (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setMinistryCertFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMyGovModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={isMyGovSaving}
                  onClick={handleSaveMyGovSubmit}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  {isMyGovSaving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RASMIY QR-KOD VA KO'CHIRMA BLANKI (PRINT & VERIFY) */}
      {/* ========================================================================= */}
      {qrVerifyModalOpen && verifyItemData && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95 duration-150">
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
                    Mirzo Ulugʻbek nomidagi Oʻzbekiston Milliy universiteti Jizzax filiali Ilmiy Kengashi fanning <b>"{verifyItemData.data.subject_name}"</b> kafedrasi boʻyicha professor-oʻqituvchi <b>{verifyItemData.data.authors}</b> tomonidan tayyorlangan quyidagi adabiyotni koʻrib chiqdi va vazirlik grifiga tavsiya etdi:
                  </p>

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
                    <div><b>Adabiyot turi:</b> {verifyItemData.data.pub_type}</div>
                    <div><b>Nomi:</b> <span className="font-bold text-blue-950">{verifyItemData.data.title}</span></div>
                    <div><b>Antiplagiat tizimidan oʻtkazilganlik natijasi:</b> <span className="font-black text-emerald-700">{verifyItemData.data.antiplagiarism_score}% originallik</span></div>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    Mazkur koʻchirma adabiyotni <b>my.gov.uz</b> portali orqali Oliy taʼlim, fan va innovatsiyalar vazirligi Kengashiga davlat grifi olish uchun topshirish huquqini beradi.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Ushbu elektron hujjat orqali OʻzMU Jizzax filiali <b>"{verifyItemData.data.department_name || "Tegishli"}"</b> kafedrasi oʻqituvchisi <b>{verifyItemData.data.teacher_name}</b> tomonidan taqdim etilgan quyidagi oʻquv-uslubiy hujjat toʻliq tasdiqlanganligi qayd etiladi:
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div><b>Fan nomi:</b> <span className="font-bold">{verifyItemData.data.subject_name}</span></div>
                    <div><b>Hujjat turi:</b> {verifyItemData.data.doc_type}</div>
                    <div><b>Hujjat sarlavhasi:</b> {verifyItemData.data.title}</div>
                    <div><b>Kafedra mudiri:</b> <span className="font-semibold text-emerald-700">Maʼqullangan ✓</span></div>
                    <div><b>Fakultet dekani:</b> <span className="font-semibold text-emerald-700">Tasdiqlangan ✓</span></div>
                  </div>
                </>
              )}

              {/* QR-Kod & Verification stamp */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-4">
                <div className="flex-1 space-y-1 text-[10px] text-slate-500 font-mono">
                  <div><b>Verifikatsiya kodi:</b> {verifyItemData.data.verification_token?.slice(0, 18)}...</div>
                  <div><b>Holat:</b> RASMAN TASDIQLANGAN</div>
                  <div><b>Tizim:</b> KPI JBNUU Elektron Hujjat Aylanish Tizimi</div>
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
                onClick={() => setQrVerifyModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GLOBAL CONFIRMATION & ALERT MODAL */}
      {/* ========================================================================= */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <div className="flex items-start gap-3.5 mb-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                confirmModal.type === "danger"
                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                  : confirmModal.type === "warning"
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                  : confirmModal.type === "success"
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                  : "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900"
              }`}>
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
                    setConfirmModal(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {confirmModal.cancelText || "Bekor qilish"}
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  const onConf = confirmModal.onConfirm;
                  setConfirmModal(null);
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
      )}
    </div>
  );
}
