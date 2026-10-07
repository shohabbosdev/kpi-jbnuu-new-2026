export interface TeacherScoreDetail {
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

export interface Teacher {
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

export interface Indicator {
  id: string;
  block: string;
  name: string;
  max_ball: number;
  validity: string;
  dept: string;
  is_active?: boolean;
  description?: string;
}

export interface Submission {
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

export interface Appeal {
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

export interface EvaluatorRecord {
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

export interface EvaluationPeriodInfo {
  academic_year: string;
  submissions_open: boolean;
  submission_deadline: string;
  review_deadline: string;
  appeal_deadline: string;
  current_stage: string;
  budget_cap_monthly: number;
}

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  role: "ADMIN" | "DEAN" | "HEAD_OF_DEPT" | "TEACHER" | "RECTORATE";
  roles?: ("ADMIN" | "DEAN" | "HEAD_OF_DEPT" | "TEACHER" | "RECTORATE")[];
  department?: string;
  faculty?: string;
  position?: string;
  degree?: string;
  fte: number;
  employee_id_number?: string;
  hemis_id?: number | string;
  image?: string;
  must_change_password?: boolean;
  permissions?: string[];
  pinfl?: string;
  inn?: string;
}

export interface EimzoKeyItem {
  id: string;
  disk: string;
  path: string;
  name: string;
  alias: string;
  cn: string;
  pinfl: string;
  inn?: string;
  org?: string;
  role?: string;
  username?: string;
  valid_from: string;
  valid_to: string;
  serial_number: string;
}

export interface RbacPermission {
  code: string;
  module: string;
  name: string;
  description?: string;
}

export interface RbacRole {
  code: string;
  name: string;
  description?: string;
  is_system: boolean;
  permissions: string[];
  created_at?: string;
}

export interface DepartmentHierarchy {
  id: number;
  name: string;
  code: string;
  head: string;
  head_fte: number;
  teachers_count: number;
  avg_score: number;
}

export interface FacultyHierarchy {
  id: number;
  name: string;
  code: string;
  dean: string;
  dean_fte: number;
  departments: DepartmentHierarchy[];
}

export interface StructureHierarchy {
  branch_name: string;
  total_faculties: number;
  total_departments: number;
  total_teachers_hemis: number;
  faculties: FacultyHierarchy[];
}

export interface SystemSettings {
  academic_year: string;
  submissions_open: boolean;
  deadline_date: string;
  submission_deadline?: string;
  review_deadline?: string;
  appeal_deadline?: string;
  current_stage?: string;
  budget_cap_monthly: number;
}

export interface AdminUserRecord {
  username: string;
  name: string;
  role: string;
  roles?: string[];
  department?: string;
  position?: string;
  fte: number;
  must_change_password?: boolean;
  is_active?: boolean;
  employee_id_number?: string;
}

export interface AuditLogRecord {
  id: number;
  time: string;
  user: string;
  action: string;
}

// HEMIS Data Structures
export interface HemisDepartment {
  id: number;
  name: string;
  code: string;
  structure_type: string;
  is_department: boolean;
  active: boolean;
}

export interface HemisEmployee {
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

export interface HemisStats {
  raw_total_records: number;
  total_fired_excluded: number;
  total_unique_active: number;
  multi_contracts_merged: number;
}

export interface HemisStatusInfo {
  connected: boolean;
  base_url: string;
  total_departments: number;
  message: string;
  error?: string;
}

export interface TeacherWorkloadItem {
  id: number;
  employee_id: number;
  employee_name: string;
  department_name: string;
  subject_name: string;
  education_type_code: string;
  education_type_name: string;
  total_hours: number;
}

export interface TeacherWorkloadSummary {
  total_items: number;
  total_teachers: number;
  total_hours: number;
  bachelor_hours: number;
  master_hours: number;
}

export interface ConfirmDialogState {
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

// Fan oʻquv-uslubiy hujjatlari
export interface CourseSyllabusDoc {
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
export interface PublicationRecommendation {
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
  submitted_by_username?: string;
  overall_status: "AT_KAFEDRA" | "AT_FAKULTET" | "AT_METHODICAL" | "AT_COUNCIL" | "COUNCIL_RECOMMENDED" | "SUBMITTED_TO_MYGOV" | "MINISTRY_APPROVED" | "KAFEDRA_REJECTED" | "FAKULTET_REJECTED" | "METHODICAL_REJECTED" | "COUNCIL_REJECTED";
  verification_token?: string;
  created_at?: string;
}

// HEMIS O'quv rejalari va Fan resurslari
export interface HemisCurriculum {
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

export interface HemisCurriculumSubject {
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

export interface HemisSubjectResource {
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

export interface HemisSubjectTeacher {
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

export interface HemisAcademicStats {
  curriculums_count: number;
  curriculum_subjects_count: number;
  subject_resources_count: number;
  subject_teachers_count: number;
  scientific_activities_count?: number;
  doctorate_students_count?: number;
}

export interface HemisScientificActivity {
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

export interface HemisDoctorateStudent {
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

export interface UniversalPaginationProps {
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

export interface NotificationItem {
  id: number;
  recipient_role?: string;
  recipient_username?: string;
  recipient_id?: number;
  department?: string;
  faculty?: string;
  title: string;
  message: string;
  type: "submission" | "appeal" | "course_doc" | "publication" | "system";
  link?: string;
  is_read: boolean;
  created_at: string;
}

