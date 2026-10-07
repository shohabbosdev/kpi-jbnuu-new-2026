"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Database,
  Download,
  GraduationCap,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  LockKeyhole,
  Upload,
  X,
  XCircle
} from "lucide-react";
import {
  AuthUser,
  CourseSyllabusDoc,
  HemisCurriculumSubject,
  HemisSubjectResource,
  PublicationRecommendation,
  SystemSettings
} from "@/types";
import { CouncilExtractModal } from "./CouncilExtractModal";

interface WorkflowSubjectInfo {
  subject_name: string;
  department_name: string;
  education_type_name?: string;
  teacher_name: string;
  total_hours: number;
}

interface SubjectCabinetProps {
  isOpen: boolean;
  selectedSubject: WorkflowSubjectInfo | null;
  onClose: () => void;
  workflowSubTab: "hemis_resources" | "docs" | "publications";
  setWorkflowSubTab: (tab: "hemis_resources" | "docs" | "publications") => void;
  currentUser: AuthUser | null;
  theme: "light" | "dark";
  systemSettings: SystemSettings | null;
  API_BASE: string;
  showAlert: (config: { title: string; message: string; type?: "danger" | "warning" | "info" | "success" }) => void;
  showConfirm: (config: {
    title: string;
    message: string;
    confirmText?: string;
    type?: "danger" | "warning" | "info" | "success";
    onConfirm: () => void | Promise<void>;
  }) => void;
  uploadSingleFile: (file: File) => Promise<string>;

  // HEMIS Resources State
  activeSubjectHemisResources: HemisSubjectResource[];
  isSubjectHemisResourcesLoading: boolean;
  activeSubjectCurriculumSubject: HemisCurriculumSubject | null;
  fetchSubjectHemisDetails: (subName?: string, tName?: string, forceRefresh?: boolean) => void;

  // Course Docs State
  courseDocsList: CourseSyllabusDoc[];
  isCourseDocsLoading: boolean;
  fetchCourseDocs: (subName?: string, tName?: string) => void;

  // Publications State
  publicationsList: PublicationRecommendation[];
  isPubsLoading: boolean;
  fetchPublications: (subName?: string, tName?: string) => void;
}

export const SubjectCabinet: React.FC<SubjectCabinetProps> = ({
  isOpen,
  selectedSubject,
  onClose,
  workflowSubTab,
  setWorkflowSubTab,
  currentUser,
  theme,
  systemSettings,
  API_BASE,
  showAlert,
  showConfirm,
  uploadSingleFile,
  activeSubjectHemisResources,
  isSubjectHemisResourcesLoading,
  activeSubjectCurriculumSubject,
  fetchSubjectHemisDetails,
  courseDocsList,
  isCourseDocsLoading,
  fetchCourseDocs,
  publicationsList,
  isPubsLoading,
  fetchPublications
}) => {
  // Local filter and search
  const [hemisResourceSearch, setHemisResourceSearch] = useState("");
  const [hemisResourceFilterType, setHemisResourceFilterType] = useState<string>("ALL");

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("kpi_auth_token") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  };

  // Course Docs Local Form States
  const [isAddCourseDocFormOpen, setIsAddCourseDocFormOpen] = useState(false);
  const [isCourseDocUploading, setIsCourseDocUploading] = useState(false);
  const [newCourseDocType, setNewCourseDocType] = useState<
    "SYLLABUS" | "WORK_PROGRAM" | "LECTURE_NOTES" | "PRACTICAL_GUIDE" | "LAB_GUIDE" | "SEMINAR_GUIDE" | "INDEPENDENT_STUDY_GUIDE" | "ASSESSMENT_CRITERIA" | "OTHER"
  >("SYLLABUS");
  const [newCourseDocTitle, setNewCourseDocTitle] = useState("");
  const [newCourseDocFile, setNewCourseDocFile] = useState<File | null>(null);

  const [isDraggingCourseDoc, setIsDraggingCourseDoc] = useState(false);

  // Course Doc Review Modal State
  const [courseDocReviewModalOpen, setCourseDocReviewModalOpen] = useState(false);
  const [activeDocForReview, setActiveDocForReview] = useState<CourseSyllabusDoc | null>(null);
  const [courseDocReviewRole, setCourseDocReviewRole] = useState<"mudir" | "dean">("mudir");
  const [courseDocReviewStatus, setCourseDocReviewStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [courseDocReviewComment, setCourseDocReviewComment] = useState("");
  const [isCourseDocReviewing, setIsCourseDocReviewing] = useState(false);

  // Publications Local Form States
  const [pubModalFormOpen, setPubModalFormOpen] = useState(false);
  const [isPubSubmitting, setIsPubSubmitting] = useState(false);
  const [newPubType, setNewPubType] = useState<"DARSLIK" | "OʻQUV QOʻLLANMA" | "USLUBIY QOʻLLANMA" | "MONOGRAFIYA">("OʻQUV QOʻLLANMA");
  const [newPubTitle, setNewPubTitle] = useState("");
  const [newPubAuthors, setNewPubAuthors] = useState("");
  const [newPubCoAuthors, setNewPubCoAuthors] = useState("");
  const [newPubInternalReviewer, setNewPubInternalReviewer] = useState("");
  const [newPubExternalReviewer, setNewPubExternalReviewer] = useState("");
  const [newPubAntiplagiatScore, setNewPubAntiplagiatScore] = useState<number>(85.0);

  const [fileManuscript, setFileManuscript] = useState<File | null>(null);
  const [fileInternalReview, setFileInternalReview] = useState<File | null>(null);
  const [fileExternalReview, setFileExternalReview] = useState<File | null>(null);
  const [fileCurriculum, setFileCurriculum] = useState<File | null>(null);
  const [fileAntiplagiat, setFileAntiplagiat] = useState<File | null>(null);
  const [fileWorkloadExtract, setFileWorkloadExtract] = useState<File | null>(null);

  // Publication Stage Review Modal State
  const [reviewStageModalOpen, setReviewStageModalOpen] = useState(false);
  const [activePubForReview, setActivePubForReview] = useState<PublicationRecommendation | null>(null);
  const [reviewStageName, setReviewStageName] = useState<"kafedra" | "fakultet" | "methodical" | "council">("kafedra");
  const [reviewProtocolNum, setReviewProtocolNum] = useState("");
  const [reviewProtocolDate, setReviewProtocolDate] = useState("");
  const [reviewProtocolFile, setReviewProtocolFile] = useState<File | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewDecision, setReviewDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [isStageReviewing, setIsStageReviewing] = useState(false);

  // MyGov / Grif Modal State
  const [myGovModalOpen, setMyGovModalOpen] = useState(false);
  const [activePubForMyGov, setActivePubForMyGov] = useState<PublicationRecommendation | null>(null);
  const [myGovAppNum, setMyGovAppNum] = useState("");
  const [ministryGrifNum, setMinistryGrifNum] = useState("");
  const [ministryCertFile, setMinistryCertFile] = useState<File | null>(null);

  // Rasmiy Kengash Bayonnomasi Koʻchirmasi State
  const [isCouncilExtractOpen, setIsCouncilExtractOpen] = useState(false);
  const [selectedExtractData, setSelectedExtractData] = useState<any>(null);
  const [isMyGovSaving, setIsMyGovSaving] = useState(false);

  if (!isOpen || !selectedSubject) return null;

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case "SYLLABUS": return "Fan sillabusi / Ishchi dastur";
      case "WORK_PROGRAM": return "Ishchi oʻquv dasturi";
      case "LECTURE_NOTES": return "Maʼruzalar matni";
      case "PRACTICAL_GUIDE": return "Amaliy mashgʻulot qoʻllanmasi";
      case "LAB_GUIDE": return "Laboratoriya qoʻllanmasi";
      case "SEMINAR_GUIDE": return "Seminar qoʻllanmasi";
      case "INDEPENDENT_STUDY_GUIDE": return "Mustaqil taʼlim koʻrsatmasi";
      case "ASSESSMENT_CRITERIA": return "Baholash mezonlari";
      default: return "Oʻquv-uslubiy material";
    }
  };

  // Handlers
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
        teacher_name: selectedSubject.teacher_name || currentUser?.name || "",
        subject_name: selectedSubject.subject_name || "",
        department_name: selectedSubject.department_name || currentUser?.department || "",
        academic_year: systemSettings?.academic_year || "2024-2025",
        doc_type: newCourseDocType,
        title: newCourseDocTitle.trim(),
        file_url: fileUrl,
        file_name: newCourseDocFile.name
      };
      const res = await fetch(`${API_BASE}/course-docs`, {
        method: "POST",
        headers: getAuthHeaders(),
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
        fetchCourseDocs(selectedSubject.subject_name, selectedSubject.teacher_name);
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
        headers: getAuthHeaders(),
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
        fetchCourseDocs(selectedSubject.subject_name, selectedSubject.teacher_name);
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

  const isDocAuthorOrAdmin = (doc: CourseSyllabusDoc) => {
    if (!currentUser) return false;
    if (currentUser.role === "ADMIN") return true;
    const myName = (currentUser.name || "").toLowerCase().trim();
    const docTeacher = (doc.teacher_name || "").toLowerCase().trim();
    return docTeacher === myName || docTeacher.includes(myName) || myName.includes(docTeacher);
  };

  const isPubAuthorOrAdmin = (pub: PublicationRecommendation) => {
    if (!currentUser) return false;
    if (currentUser.role === "ADMIN") return true;
    const myName = (currentUser.name || "").toLowerCase().trim();
    const pubTeacher = (pub.teacher_name || "").toLowerCase().trim();
    const pubAuthors = (pub.authors || "").toLowerCase().trim();
    const isSubmittedBy = Boolean(pub.submitted_by_username && currentUser.username && pub.submitted_by_username.toLowerCase() === currentUser.username.toLowerCase());
    return isSubmittedBy || pubTeacher === myName || pubTeacher.includes(myName) || pubAuthors.includes(myName);
  };

  const handleDeleteCourseDocConfirm = (doc: CourseSyllabusDoc) => {
    if (!isDocAuthorOrAdmin(doc)) {
      showAlert({
        title: "Ruxsat berilmagan",
        message: "Siz faqat oʻzingiz yuklagan fan hujjatlarini oʻchirish huquqiga egasiz!",
        type: "warning"
      });
      return;
    }
    if (doc.mudir_status === "APPROVED" && currentUser?.role !== "ADMIN") {
      showAlert({
        title: "Oʻchirish taqiqlangan",
        message: "Kafedra mudiri tomonidan tasdiqlangan rasmiy hujjatni oʻchirib boʻlmaydi!",
        type: "warning"
      });
      return;
    }
    showConfirm({
      title: "Hujjatni oʻchirish",
      message: `Haqiqatan ham "${doc.title}" hujjatini oʻchirmoqchimisiz?`,
      confirmText: "Ha, oʻchirish",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/course-docs/${doc.id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
          });
          if (res.ok) {
            showAlert({ title: "Oʻchirildi", message: "Hujjat muvaffaqiyatli oʻchirildi", type: "success" });
            fetchCourseDocs(selectedSubject?.subject_name, selectedSubject?.teacher_name);
          } else {
            const errData = await res.json().catch(() => ({}));
            showAlert({ title: "Oʻchirilmadi", message: errData.detail || "Hujjatni oʻchirish taqiqlandi", type: "danger" });
          }
        } catch {
          showAlert({ title: "Xatolik", message: "Oʻchirishda server xatoligi", type: "danger" });
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
        teacher_name: selectedSubject.teacher_name || currentUser?.name || "",
        subject_name: selectedSubject.subject_name || "",
        department_name: selectedSubject.department_name || currentUser?.department || "",
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
        headers: getAuthHeaders(),
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
        fetchPublications(selectedSubject.subject_name, selectedSubject.teacher_name);
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
        headers: getAuthHeaders(),
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
        fetchPublications(selectedSubject.subject_name, selectedSubject.teacher_name);
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
        headers: getAuthHeaders(),
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
        fetchPublications(selectedSubject.subject_name, selectedSubject.teacher_name);
      }
    } catch (err: any) {
      showAlert({ title: "Xatolik", message: err.message || "Saqlashda xatolik", type: "danger" });
    } finally {
      setIsMyGovSaving(false);
    }
  };

  const handleDeletePublicationConfirm = (pub: PublicationRecommendation) => {
    if (!isPubAuthorOrAdmin(pub)) {
      showAlert({
        title: "Ruxsat berilmagan",
        message: "Siz faqat oʻzingiz taqdim etgan darslik va nashr arizalarini oʻchirish huquqiga egasiz!",
        type: "warning"
      });
      return;
    }
    if (pub.kafedra_status === "APPROVED" && currentUser?.role !== "ADMIN") {
      showAlert({
        title: "Oʻchirish taqiqlangan",
        message: "Kafedra kengashida tasdiqlangan va bayonnoma biriktirilgan nashr arizasini oʻchirib boʻlmaydi!",
        type: "warning"
      });
      return;
    }
    showConfirm({
      title: "Nashr arizasini oʻchirish",
      message: `Haqiqatan ham "${pub.title}" adabiyotining barcha kengash yozuvlarini oʻchirmoqchimisiz?`,
      confirmText: "Ha, oʻchirish",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/publications/${pub.id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
          });
          if (res.ok) {
            showAlert({ title: "Oʻchirildi", message: "Nashr arizasi muvaffaqiyatli oʻchirildi", type: "success" });
            fetchPublications(selectedSubject?.subject_name, selectedSubject?.teacher_name);
          } else {
            const errData = await res.json().catch(() => ({}));
            showAlert({ title: "Oʻchirilmadi", message: errData.detail || "Nashr arizasini oʻchirish taqiqlandi", type: "danger" });
          }
        } catch {
          showAlert({ title: "Xatolik", message: "Oʻchirishda server xatoligi", type: "danger" });
        }
      }
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-md overflow-y-auto overflow-x-hidden w-full max-w-full flex flex-col animate-in fade-in duration-150">
        {/* Tepa navigatsiya paneli (Sticky Header) */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs px-3 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shrink-0"
              title="Fanlar roʻyxatiga qaytish"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Fanlar roʻyxatiga qaytish</span>
              <span className="sm:hidden">Orqaga</span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block shrink-0" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 min-w-0">
                  <span className="truncate">{selectedSubject.subject_name}</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono shrink-0">
                  {selectedSubject.total_hours} soat
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 truncate">
                <span className="truncate">
                  Kafedra: <b>{selectedSubject.department_name}</b>
                </span>
                <span>•</span>
                <span className="truncate">
                  Oʻqituvchi: <b>{selectedSubject.teacher_name}</b>
                </span>
                {selectedSubject.education_type_name && (
                  <>
                    <span>•</span>
                    <span className="truncate">
                      Taʼlim shakli: <b>{selectedSubject.education_type_name}</b>
                    </span>
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
        <div className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-8 py-4 sm:py-6 space-y-6 min-w-0 overflow-x-hidden">
          {/* TAB 1: HEMIS BAZASI VA SOATLAR */}
          {workflowSubTab === "hemis_resources" && (
            <div className="space-y-5">
              {activeSubjectCurriculumSubject && (
                <div
                  className={`p-5 rounded-2xl border shadow-xs ${
                    theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
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
              <div
                className={`p-5 rounded-2xl border shadow-xs ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}
              >
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
                      onClick={() => fetchSubjectHemisDetails(selectedSubject.subject_name, selectedSubject.teacher_name, true)}
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
                          theme === "dark"
                            ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                            : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
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
                  ].map((f) => (
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
                      .filter((res) => {
                        const term = hemisResourceSearch.toLowerCase();
                        const matchesSearch =
                          !term ||
                          res.title.toLowerCase().includes(term) ||
                          (res.file_name && res.file_name.toLowerCase().includes(term)) ||
                          (res.employee_name && res.employee_name.toLowerCase().includes(term));
                        const matchesType =
                          hemisResourceFilterType === "ALL" ||
                          (res.training_type && res.training_type.toUpperCase().includes(hemisResourceFilterType));
                        return matchesSearch && matchesType;
                      })
                      .map((res) => (
                        <div
                          key={res.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            theme === "dark"
                              ? "bg-slate-800/50 border-slate-800 hover:bg-slate-800"
                              : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/60"
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
                                <span>
                                  Fayl: <b className="font-mono text-slate-700 dark:text-slate-300">{res.file_name}</b>
                                </span>
                                <span>
                                  Hajmi: <b>{res.file_size ? `${(res.file_size / 1024).toFixed(1)} KB` : "Nomaʼlum"}</b>
                                </span>
                                <span>
                                  Yuklagan: <b>{res.employee_name}</b>
                                </span>
                                {res.updated_at_ts && (
                                  <span>
                                    Sana: <b>{new Date(res.updated_at_ts * 1000).toLocaleDateString()}</b>
                                  </span>
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

          {/* TAB 2: O'QUV-USLUBIY HUJJATLAR */}
          {workflowSubTab === "docs" && (
            <div className="space-y-5">
              <div
                className={`p-5 rounded-2xl border shadow-xs ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}
              >
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
                    <span>{isAddCourseDocFormOpen ? "Formani yopish" : "Yangi hujjat yuklash"}</span>
                  </button>
                </div>

                {/* Yangi hujjat yuklash formasi */}
                {isAddCourseDocFormOpen && (
                  <form
                    onSubmit={handleUploadCourseDocSubmit}
                    className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 mb-5 space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-blue-900/60">
                      <h5 className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Yangi oʻquv-uslubiy hujjatni biriktirish</span>
                      </h5>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Fan: <b>{selectedSubject.subject_name}</b>
                      </span>
                    </div>

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

                    {/* Drag-and-Drop Hujjat Yuklash Maydoni */}
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5 text-xs">
                        Hujjat faylini yuklash (PDF, DOC, DOCX — max 10MB) *
                      </label>

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDraggingCourseDoc(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDraggingCourseDoc(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDraggingCourseDoc(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            const file = e.dataTransfer.files[0];
                            const ext = file.name.toLowerCase();
                            if (ext.endsWith(".pdf") || ext.endsWith(".doc") || ext.endsWith(".docx")) {
                              setNewCourseDocFile(file);
                              if (!newCourseDocTitle.trim()) {
                                const cleanName = file.name.replace(/\.[^/.]+$/, "");
                                setNewCourseDocTitle(cleanName);
                              }
                            } else {
                              showAlert({
                                title: "Fayl formati mos emas",
                                message: "Faqat PDF yoki Word (DOC/DOCX) formatidagi hujjatlar qabul qilinadi.",
                                type: "warning"
                              });
                            }
                          }
                        }}
                        onClick={() => {
                          const fileInput = document.getElementById("course-doc-file-input") as HTMLInputElement;
                          if (fileInput) fileInput.click();
                        }}
                        className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                          isDraggingCourseDoc
                            ? "border-blue-500 bg-blue-100/70 dark:bg-blue-950/60 scale-[1.01]"
                            : newCourseDocFile
                            ? "border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30"
                            : "border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-800/80 hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
                        }`}
                      >
                        <input
                          id="course-doc-file-input"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setNewCourseDocFile(file);
                              if (!newCourseDocTitle.trim()) {
                                const cleanName = file.name.replace(/\.[^/.]+$/, "");
                                setNewCourseDocTitle(cleanName);
                              }
                            }
                          }}
                        />

                        {newCourseDocFile ? (
                          <div className="flex items-center justify-between w-full max-w-md px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                            <div className="flex items-center gap-3 truncate">
                              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                              <div className="text-left truncate">
                                <div className="font-bold text-slate-900 dark:text-white truncate text-xs">
                                  {newCourseDocFile.name}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {(newCourseDocFile.size / 1024).toFixed(1)} KB • Boshqa fayl tanlash uchun bosing
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewCourseDocFile(null);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-2 cursor-pointer flex-shrink-0"
                              title="Faylni bekor qilish"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center shadow-xs">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                Faylni bu yerga sudrab tashlang (Drag & Drop) yoki tanlash uchun bosing
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                Qabul qilinadigan formatlar: PDF, DOC, DOCX (Maksimal hajm: 10 MB)
                              </span>
                            </div>
                          </>
                        )}
                      </div>
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
                    Ushbu fan boʻyicha hali oʻquv-uslubiy hujjat yuklanmagan. "Yangi hujjat yuklash" tugmasini bosing.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courseDocsList.map((doc) => {
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
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-900">
                                  {getDocTypeLabel(doc.doc_type)}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                <span>
                                  Yuklangan: <b>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ""}</b>
                                </span>
                                <span>•</span>
                                <span>
                                  Mudir:{" "}
                                  <b
                                    className={
                                      isApprovedByMudir
                                        ? "text-emerald-600"
                                        : doc.mudir_status === "REJECTED"
                                        ? "text-rose-600"
                                        : "text-amber-600"
                                    }
                                  >
                                    {doc.mudir_status || "PENDING"}
                                  </b>
                                </span>
                                <span>•</span>
                                <span>
                                  Dekan:{" "}
                                  <b
                                    className={
                                      isApprovedByDean
                                        ? "text-emerald-600"
                                        : doc.dean_status === "REJECTED"
                                        ? "text-rose-600"
                                        : "text-amber-600"
                                    }
                                  >
                                    {doc.dean_status || "PENDING"}
                                  </b>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                            {(currentUser?.role === "HEAD_OF_DEPT" || currentUser?.role === "ADMIN") &&
                              doc.mudir_status !== "APPROVED" && (
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

                            {(currentUser?.role === "DEAN" || currentUser?.role === "ADMIN") &&
                              doc.mudir_status === "APPROVED" &&
                              doc.dean_status !== "APPROVED" && (
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

                            {isDocAuthorOrAdmin(doc) && (
                              doc.mudir_status === "APPROVED" && currentUser?.role !== "ADMIN" ? (
                                <span
                                  className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 cursor-not-allowed flex items-center"
                                  title="Kafedra mudiri tasdiqlagan! Tasdiqlangan rasmiy hujjatni oʻchirib boʻlmaydi."
                                >
                                  <LockKeyhole className="w-4 h-4" />
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCourseDocConfirm(doc)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                  title="Oʻchirish"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DARSLIK VA TAVSIYANOMA */}
          {workflowSubTab === "publications" && (
            <div className="space-y-5">
              <div
                className={`p-5 rounded-2xl border shadow-xs ${
                  theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}
              >
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
                    <span>Yangi darslik / qoʻllanma qoʻshish</span>
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
                    Ushbu fan boʻyicha hali darslik yoki oʻquv qoʻllanma kiritilmagan. "Yangi darslik / qoʻllanma qoʻshish" tugmasini bosing.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {publicationsList.map((pub) => (
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
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{pub.title}</span>
                              <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-900">
                                {pub.pub_type}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-mono font-bold">
                                Originallik: {pub.antiplagiarism_score}%
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                              <span>
                                Mualliflar: <b>{pub.authors}</b>
                              </span>
                              <span>•</span>
                              <span>
                                Kafedra:{" "}
                                <b
                                  className={
                                    pub.kafedra_status === "APPROVED"
                                      ? "text-emerald-600"
                                      : pub.kafedra_status === "REJECTED"
                                      ? "text-rose-600"
                                      : "text-amber-600"
                                  }
                                >
                                  {pub.kafedra_status}
                                </b>
                              </span>
                              <span>•</span>
                              <span>
                                Fakultet:{" "}
                                <b
                                  className={
                                    pub.fakultet_status === "APPROVED"
                                      ? "text-emerald-600"
                                      : pub.fakultet_status === "REJECTED"
                                      ? "text-rose-600"
                                      : "text-amber-600"
                                  }
                                >
                                  {pub.fakultet_status}
                                </b>
                              </span>
                              <span>•</span>
                              <span>
                                OʻUK:{" "}
                                <b
                                  className={
                                    pub.methodical_status === "APPROVED"
                                      ? "text-emerald-600"
                                      : pub.methodical_status === "REJECTED"
                                      ? "text-rose-600"
                                      : "text-amber-600"
                                  }
                                >
                                  {pub.methodical_status}
                                </b>
                              </span>
                              <span>•</span>
                              <span>
                                Filial Kengashi:{" "}
                                <b
                                  className={
                                    pub.council_status === "APPROVED"
                                      ? "text-emerald-600"
                                      : pub.council_status === "REJECTED"
                                      ? "text-rose-600"
                                      : "text-amber-600"
                                  }
                                >
                                  {pub.council_status}
                                </b>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0 flex-wrap">
                          {/* Kafedra mudiri bosqichi */}
                          {(currentUser?.role === "HEAD_OF_DEPT" || currentUser?.role === "ADMIN") &&
                            pub.kafedra_status === "PENDING" && (
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
                          {(currentUser?.role === "DEAN" || currentUser?.role === "ADMIN") &&
                            pub.kafedra_status === "APPROVED" &&
                            pub.fakultet_status === "PENDING" && (
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
                          {(currentUser?.role === "ADMIN" || currentUser?.role === "RECTORATE") &&
                            pub.fakultet_status === "APPROVED" &&
                            pub.methodical_status === "PENDING" && (
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
                          {(currentUser?.role === "ADMIN" || currentUser?.role === "RECTORATE") &&
                            pub.methodical_status === "APPROVED" &&
                            pub.council_status === "PENDING" && (
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

                          {/* Rasmiy Kengash Bayonnomasi Ko'chirmasi */}
                          {(pub.kafedra_status === "APPROVED" || pub.fakultet_status === "APPROVED" || pub.council_status === "APPROVED") && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedExtractData({
                                  id: pub.id,
                                  university_name: "Oʻzbekiston Milliy universiteti Jizzax filiali",
                                  protocol_number: pub.council_protocol_num || pub.fakultet_protocol_num || pub.kafedra_protocol_num || "—",
                                  protocol_date: pub.council_protocol_date || pub.fakultet_protocol_date || pub.kafedra_protocol_date || "",
                                  stage_level: pub.council_status === "APPROVED" ? "Filial Ilmiy Kengashi" : (pub.fakultet_status === "APPROVED" ? "Fakultet Ilmiy-uslubiy Kengashi" : "Kafedra yigʻilishi"),
                                  publication_title: pub.title,
                                  pub_type: pub.pub_type,
                                  authors: pub.authors,
                                  co_authors: pub.co_authors,
                                  department: pub.department_name || selectedSubject?.department_name || "Kafedra",
                                  antiplagiarism_score: pub.antiplagiarism_score,
                                  verification_token: pub.verification_token,
                                  verification_url: `https://jbnuu.uz/kpi/verify?token=${pub.verification_token || ""}`,
                                  is_recommended: true
                                });
                                setIsCouncilExtractOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Rasmiy Kengash qarori koʻchirmasini koʻrish va chop etish"
                            >
                              <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Koʻchirma</span>
                            </button>
                          )}

                          {isPubAuthorOrAdmin(pub) && (
                            pub.kafedra_status === "APPROVED" && currentUser?.role !== "ADMIN" ? (
                              <span
                                className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 cursor-not-allowed flex items-center"
                                title="Kafedra kengashida tasdiqlangan va bayonnoma biriktirilgan! Kengashlar zanjiridagi rasmiy ishni oʻchirib boʻlmaydi."
                              >
                                <LockKeyhole className="w-4 h-4" />
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeletePublicationConfirm(pub)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                title="Oʻchirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )
                          )}
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

      {/* MODAL: FAN HUJJATINI KO'RIB CHIQISH (MUDIR / DEKAN) */}
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
              <div>
                <b>Hujjat sarlavhasi:</b> {activeDocForReview.title}
              </div>
              <div>
                <b>Turi:</b> {activeDocForReview.doc_type}
              </div>
              <div>
                <b>Muallif:</b> {activeDocForReview.teacher_name}
              </div>
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

      {/* MODAL: YANGI ADABIYOT TAVSIYANOMASI FORMASI */}
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
                  Fanga oid: {selectedSubject.subject_name}
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

              {/* Fayllar yuklash */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Majburiy elektron hujjatlar (Har biri PDF formatda, max 10MB):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">1. Qoʻlyozma toʻliq matni (PDF) *</label>
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFileManuscript(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">2. Ichki taqriz (PDF) *</label>
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFileInternalReview(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">3. Tashqi taqriz (PDF) *</label>
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFileExternalReview(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">4. Tasdiqlangan Fan dasturi (PDF) *</label>
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFileCurriculum(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">5. Antiplagiat hisoboti (PDF) *</label>
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={(e) => setFileAntiplagiat(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">6. Oʻquv yuklama koʻchirmasi (ixtiyoriy)</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFileWorkloadExtract(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
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
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  {isPubSubmitting ? "Yuklanmoqda..." : "Arizani yuborish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KENGASH BOSQICHI BAYONNOMASI (KAFEDRA / FAKULTET / O'UK / KENGASH) */}
      {reviewStageModalOpen && activePubForReview && (
        <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                  <span>
                    {reviewStageName === "kafedra" && "Kafedra yigʻilishi xulosasi"}
                    {reviewStageName === "fakultet" && "Fakultet Ilmiy kengashi xulosasi"}
                    {reviewStageName === "methodical" && "Oʻquv-uslubiy kengash xulosasi"}
                    {reviewStageName === "council" && "Filial Ilmiy Kengashi tavsiyanomasi"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Adabiyot: {activePubForReview.title}</p>
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
              <div>
                <label className="block font-bold mb-1.5">Qaror *</label>
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
                    <span>Maʼqullash (Tavsiya etish)</span>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Bayonnoma raqami *</label>
                  <input
                    type="text"
                    required
                    value={reviewProtocolNum}
                    onChange={(e) => setReviewProtocolNum(e.target.value)}
                    placeholder="Masalan: 8-sonli"
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Bayonnoma sanasi *</label>
                  <input
                    type="date"
                    required
                    value={reviewProtocolDate}
                    onChange={(e) => setReviewProtocolDate(e.target.value)}
                    className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Bayonnoma / Koʻchirma hujjati (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setReviewProtocolFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Xulosa / Tavsiyalar yoki kamchiliklar</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Kengash aʼzolarining xulosasi yoki koʻrsatmalari..."
                  className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-900 focus:outline-none"
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
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  {isStageReviewing ? "Saqlanmoqda..." : "Qarorni saqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MY.GOV.UZ VA VAZIRLIK GRIFI */}
      {myGovModalOpen && activePubForMyGov && (
        <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>my.gov.uz va Vazirlik Grifi Qaydi</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Adabiyot: {activePubForMyGov.title}</p>
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
                <label className="block font-bold mb-1">my.gov.uz portalidagi ariza raqami *</label>
                <input
                  type="text"
                  required
                  value={myGovAppNum}
                  onChange={(e) => setMyGovAppNum(e.target.value)}
                  placeholder="Masalan: APP-2026-98124"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Vazirlik Grifi / Buyruq raqami (agar olingan boʻlsa)</label>
                <input
                  type="text"
                  value={ministryGrifNum}
                  onChange={(e) => setMinistryGrifNum(e.target.value)}
                  placeholder="Masalan: Oliy taʼlim vazirligi 2026-yil 14-martdagi 84-sonli buyrugʻi"
                  className="w-full p-2 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Vazirlik Grifi guvohnomasi fayli (PDF)</label>
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

      {/* Rasmiy Kengash Bayonnomasi Koʻchirmasi Modali */}
      <CouncilExtractModal
        isOpen={isCouncilExtractOpen}
        onClose={() => setIsCouncilExtractOpen(false)}
        extract={selectedExtractData}
      />
    </>
  );
};
