"""
O'zMU JBNUU KPI Tizimi - SQLite relyatsion ma'lumotlar bazasi boshqaruvi.
Server qayta yuklanganda ham barcha o'zgarishlar, arizalar, sozlamalar va parollar to'liq saqlanadi.
"""

import sqlite3
import os
import json
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "kpi_system.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=10000;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    conn.execute("PRAGMA wal_autocheckpoint=100;")
    return conn

def db_checkpoint():
    """WAL jurnalidagi barcha tranzaksiyalarni asosiy maʼlumotlar bazasiga toʻliq koʻchiradi (Data Integrity)"""
    try:
        conn = get_connection()
        conn.execute("PRAGMA wal_checkpoint(PASSIVE);")
        conn.close()
    except Exception as e:
        print(f"[DB CHECKPOINT WARNING] {e}")

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            id INTEGER,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            department TEXT,
            faculty TEXT,
            position TEXT,
            degree TEXT,
            fte REAL DEFAULT 1.0,
            employee_id_number TEXT,
            must_change_password INTEGER DEFAULT 0,
            image TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN image TEXT;")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN pinfl TEXT;")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN inn TEXT;")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN roles TEXT;")
    except Exception:
        pass
    
    # 2. Submissions / Applications table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY,
            teacher_id INTEGER,
            teacher_name TEXT NOT NULL,
            indicator_id TEXT NOT NULL,
            title TEXT NOT NULL,
            doi TEXT,
            authors_count INTEGER DEFAULT 1,
            submitted_date TEXT,
            status TEXT DEFAULT 'pending',
            claimed_ball REAL DEFAULT 0.0,
            ball REAL DEFAULT 0.0,
            file_name TEXT,
            dept TEXT,
            description TEXT,
            reviewer_name TEXT,
            reviewed_date TEXT,
            reviewer_comment TEXT,
            rejection_reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 3. Audit logs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT,
            user TEXT NOT NULL,
            action TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 4. System Settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_settings (
            id INTEGER PRIMARY KEY DEFAULT 1,
            academic_year TEXT DEFAULT '2025/2026-oʻquv yili',
            submissions_open INTEGER DEFAULT 1,
            deadline_date TEXT DEFAULT '2026-05-30',
            submission_deadline TEXT DEFAULT '2026-06-15',
            review_deadline TEXT DEFAULT '2026-06-25',
            appeal_deadline TEXT DEFAULT '2026-07-05',
            current_stage TEXT DEFAULT 'ALL_OPEN',
            budget_cap_monthly REAL DEFAULT 150000000.0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    for col, col_type, default_val in [
        ("submission_deadline", "TEXT", "'2026-06-15'"),
        ("review_deadline", "TEXT", "'2026-06-25'"),
        ("appeal_deadline", "TEXT", "'2026-07-05'"),
        ("current_stage", "TEXT", "'ALL_OPEN'")
    ]:
        try:
            cursor.execute(f"ALTER TABLE system_settings ADD COLUMN {col} {col_type} DEFAULT {default_val};")
        except Exception:
            pass

    # 5. Indicators table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS indicators (
            id TEXT PRIMARY KEY,
            block TEXT NOT NULL,
            name TEXT NOT NULL,
            max_ball REAL NOT NULL,
            validity TEXT,
            dept TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    try:
        cursor.execute("ALTER TABLE indicators ADD COLUMN description TEXT;")
    except Exception:
        pass

    # 6. Appeals table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appeals (
            id TEXT PRIMARY KEY,
            submission_id INTEGER NOT NULL,
            teacher_id INTEGER,
            teacher_name TEXT NOT NULL,
            indicator_id TEXT NOT NULL,
            title TEXT NOT NULL,
            claimed_ball REAL DEFAULT 0.0,
            reviewed_ball REAL DEFAULT 0.0,
            initial_reviewer TEXT,
            initial_rejection_reason TEXT,
            appeal_reason TEXT NOT NULL,
            evidence_file TEXT,
            status TEXT DEFAULT 'PENDING',
            commission_member TEXT,
            commission_comment TEXT,
            decision_date TEXT,
            awarded_ball REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 7. Evaluators / Experts assigned table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evaluators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT NOT NULL,
            name TEXT NOT NULL,
            assigned_category TEXT NOT NULL,
            role_type TEXT DEFAULT 'EXPERT',
            deadline_date TEXT,
            is_active INTEGER DEFAULT 1,
            assigned_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 8. Teacher Workloads table (HEMIS O'quv yuklamalari)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS teacher_workloads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            employee_name TEXT NOT NULL,
            department_name TEXT,
            subject_name TEXT NOT NULL,
            education_type_code TEXT,
            education_type_name TEXT,
            total_hours INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_workload_emp_id ON teacher_workloads(employee_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_workload_emp_name ON teacher_workloads(employee_name);")
    
    # 9. Course Syllabus & Teaching Materials table (Fan hujjatlari: Sillabus, Ishchi dastur, Baholash mezonlari)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS course_syllabus_docs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_id INTEGER,
            teacher_name TEXT NOT NULL,
            subject_name TEXT NOT NULL,
            department_name TEXT,
            academic_year TEXT DEFAULT '2024-2025',
            doc_type TEXT NOT NULL,
            title TEXT NOT NULL,
            file_url TEXT NOT NULL,
            file_name TEXT NOT NULL,
            status TEXT DEFAULT 'SUBMITTED',
            mudir_status TEXT DEFAULT 'PENDING',
            mudir_comment TEXT,
            mudir_updated_at TEXT,
            dean_status TEXT DEFAULT 'PENDING',
            dean_comment TEXT,
            dean_updated_at TEXT,
            verification_token TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_course_doc_teacher ON course_syllabus_docs(teacher_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_course_doc_subject ON course_syllabus_docs(subject_name);")

    # 10. Publication Recommendations & 4-Stage Council Workflow (Darslik, O'quv qo'llanma, Monografiya Kengashlar Zanjiri)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS publication_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_id INTEGER,
            teacher_name TEXT NOT NULL,
            subject_name TEXT NOT NULL,
            department_name TEXT,
            academic_year TEXT DEFAULT '2024-2025',
            pub_type TEXT NOT NULL,
            title TEXT NOT NULL,
            authors TEXT NOT NULL,
            co_authors TEXT,
            
            -- Asosiy yuklangan fayllar to'plami
            manuscript_file TEXT NOT NULL,
            internal_review_file TEXT NOT NULL,
            internal_reviewer_name TEXT,
            external_review_file TEXT NOT NULL,
            external_reviewer_name TEXT,
            curriculum_file TEXT NOT NULL,
            antiplagiarism_file TEXT NOT NULL,
            antiplagiarism_score REAL NOT NULL,
            workload_extract_file TEXT,
            
            -- 1-Bosqich: Kafedra yig'ilishi
            kafedra_status TEXT DEFAULT 'PENDING',
            kafedra_protocol_num TEXT,
            kafedra_protocol_date TEXT,
            kafedra_protocol_file TEXT,
            kafedra_comment TEXT,
            kafedra_updated_at TEXT,
            
            -- 2-Bosqich: Fakultet Kengashi
            fakultet_status TEXT DEFAULT 'PENDING',
            fakultet_protocol_num TEXT,
            fakultet_protocol_date TEXT,
            fakultet_protocol_file TEXT,
            fakultet_comment TEXT,
            fakultet_updated_at TEXT,
            
            -- 3-Bosqich: Filial O'quv-uslubiy Kengashi (O'UK)
            methodical_status TEXT DEFAULT 'PENDING',
            methodical_protocol_num TEXT,
            methodical_protocol_date TEXT,
            methodical_protocol_file TEXT,
            methodical_comment TEXT,
            methodical_updated_at TEXT,
            
            -- 4-Bosqich: Filial Ilmiy Kengashi (Yakuniy filial tavsiyasi)
            council_status TEXT DEFAULT 'PENDING',
            council_protocol_num TEXT,
            council_protocol_date TEXT,
            council_protocol_file TEXT,
            council_comment TEXT,
            council_updated_at TEXT,
            
            -- 5-Bosqich: my.gov.uz & Vazirlik Grifi
            mygov_app_num TEXT,
            ministry_grif_num TEXT,
            ministry_certificate_file TEXT,
            
            -- Umumiy holat va QR-kod
            overall_status TEXT DEFAULT 'AT_KAFEDRA',
            verification_token TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pub_teacher ON publication_recommendations(teacher_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pub_subject ON publication_recommendations(subject_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pub_token ON publication_recommendations(verification_token);")
    
    # 11. HEMIS O'quv rejalar (Curriculums)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hemis_curriculums (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            specialty_code TEXT,
            specialty_name TEXT,
            department_name TEXT,
            department_code TEXT,
            education_year TEXT,
            education_type TEXT,
            education_form TEXT,
            marking_system TEXT,
            semester_count INTEGER DEFAULT 8,
            education_period INTEGER DEFAULT 4,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 12. HEMIS O'quv rejadagi fanlar (Curriculum Subjects)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hemis_curriculum_subjects (
            id INTEGER PRIMARY KEY,
            curriculum_id INTEGER,
            subject_id INTEGER,
            subject_name TEXT NOT NULL,
            subject_code TEXT,
            subject_type TEXT,
            subject_block TEXT,
            semester_name TEXT,
            semester_code TEXT,
            total_acload INTEGER DEFAULT 0,
            credit INTEGER DEFAULT 0,
            lecture_hours INTEGER DEFAULT 0,
            practical_hours INTEGER DEFAULT 0,
            seminar_hours INTEGER DEFAULT 0,
            lab_hours INTEGER DEFAULT 0,
            independent_hours INTEGER DEFAULT 0,
            department_name TEXT,
            resource_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_curr_subj_name ON hemis_curriculum_subjects(subject_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_curr_subj_cid ON hemis_curriculum_subjects(curriculum_id);")

    # 13. HEMIS Fan resurslari (Subject File Resources - Ma'ruza, Amaliyot fayllari)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hemis_subject_resources (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            subject_id INTEGER,
            subject_name TEXT NOT NULL,
            subject_code TEXT,
            training_type TEXT,
            employee_id INTEGER,
            employee_name TEXT NOT NULL,
            resource_type TEXT,
            file_name TEXT,
            file_size INTEGER DEFAULT 0,
            file_url TEXT NOT NULL,
            updated_at_ts INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_res_emp_name ON hemis_subject_resources(employee_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_res_subj_name ON hemis_subject_resources(subject_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_res_subj_id ON hemis_subject_resources(subject_id);")

    # 14. HEMIS Fanlarga biriktirilgan o'qituvchilar va guruhlar (Subject Teachers)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hemis_subject_teachers (
            id INTEGER PRIMARY KEY,
            curriculum_id INTEGER,
            semester_code TEXT,
            education_year TEXT,
            department_id INTEGER,
            subject_id INTEGER,
            subject_name TEXT NOT NULL,
            subject_code TEXT,
            employee_id INTEGER,
            employee_name TEXT NOT NULL,
            training_type TEXT,
            group_id INTEGER,
            students_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_st_emp_name ON hemis_subject_teachers(employee_name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_st_subj_name ON hemis_subject_teachers(subject_name);")
    
    # 15. HEMIS Ilmiy faoliyat va iqtiboslik (Scientific Activity)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hemis_scientific_activity (
            id INTEGER PRIMARY KEY,
            employee_id INTEGER,
            employee_name TEXT,
            scientific_platform TEXT,
            profile_link TEXT,
            h_index INTEGER DEFAULT 0,
            publication_work_count INTEGER DEFAULT 0,
            citation_count INTEGER DEFAULT 0,
            education_year TEXT,
            is_checked INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sa_emp_id ON hemis_scientific_activity(employee_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sa_emp_name ON hemis_scientific_activity(employee_name);")

    # 16. HEMIS Doktorantlar va ilmiy izlanuvchilar (Doctorate Students)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hemis_doctorate_students (
            id INTEGER PRIMARY KEY,
            full_name TEXT NOT NULL,
            short_name TEXT,
            student_id_number TEXT,
            dissertation_theme TEXT,
            department_name TEXT,
            specialty_code TEXT,
            specialty_name TEXT,
            science_branch TEXT,
            doctoral_type TEXT,
            doctorate_status TEXT,
            level TEXT,
            image TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_doc_name ON hemis_doctorate_students(full_name);")
    # 17. Granular Dynamic RBAC: Roles, Permissions & Role-Permission Matrix
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rbac_roles (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            is_system INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rbac_permissions (
            code TEXT PRIMARY KEY,
            module TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rbac_role_permissions (
            role_code TEXT NOT NULL,
            permission_code TEXT NOT NULL,
            PRIMARY KEY (role_code, permission_code)
        );
    """)

    # RBAC standart ruxsatlar katalogini urug'lantirish (Seed Permissions)
    default_permissions = [
        # Dashboard & Navigation
        ("dashboard:view", "Umumiy", "Bosh sahifani koʻrish", "Foydalanuvchi oʻz rolidagi bosh sahifani koʻra oladi"),
        ("structure:view", "Tuzilma", "Tashkiliy tuzilmani koʻrish", "Filial, fakultetlar va kafedralar ierarxiyasi"),
        ("logs:view", "Xavfsizlik", "Audit jurnallarini koʻrish", "Tizimga kirishlar va amallar tarixini kuzatish"),
        
        # O'quv yuklamalari & Fan kabineti
        ("subjects:view_own", "Oʻquv yuklamalari", "Shaxsiy yuklamani koʻrish", "Faqat oʻziga biriktirilgan dars soatlarini koʻrish"),
        ("subjects:view_dept", "Oʻquv yuklamalari", "Kafedra yuklamalarini koʻrish", "Oʻz kafedrasi oʻqituvchilari oʻquv yuklamalarini monitoring qilish"),
        ("subjects:view_faculty", "Oʻquv yuklamalari", "Fakultet yuklamalarini koʻrish", "Fakultet kafedralari oʻqituvchilari yuklamalarini monitoring qilish"),
        ("subjects:view_all", "Oʻquv yuklamalari", "Barcha filial yuklamalarini koʻrish", "Filial miqyosidagi barcha oʻqituvchilar yuklamalarini toʻliq koʻrish"),
        ("subjects:manage_docs", "Oʻquv yuklamalari", "Fan hujjatlarini yuklash", "Sillabus, ishchi dastur va materiallarni kabinetga yuklash"),
        ("subjects:approve_mudir", "Oʻquv yuklamalari", "Kafedra mudiri tasdigʻi", "Fan hujjatlarini kafedra darajasida tekshirish va tasdiqlash"),
        ("subjects:approve_dekan", "Oʻquv yuklamalari", "Fakultet dekani tasdigʻi", "Fan hujjatlarini dekanat darajasida tasdiqlash"),
        
        # HEMIS integratsiyasi
        ("hemis:view", "HEMIS", "HEMIS maʼlumotlarini koʻrish", "Xodimlar, yuklamalar, oʻquv rejalari va ilmiy faoliyat"),
        ("hemis:sync", "HEMIS", "HEMIS bilan toʻliq sinxronlash", "HEMIS REST API dan yangi maʼlumotlarni qayta yuklab olish"),
        
        # KPI Baholash & Hujjat topshirish
        ("kpi:submit", "KPI Baholash", "Natijalar topshirish", "Shaxsiy kabinet orqali mezonlar boʻyicha hisobot topshirish"),
        ("kpi:review_mudir", "KPI Baholash", "Kafedra mudiri ekspertizasi", "Kafedra aʼzolarining KPI arizalarini dastlabki tekshirish"),
        ("kpi:review_expert", "KPI Baholash", "Ekspert komissiyasi baholashi", "Tegishli yoʻnalish boʻyicha arizalarni yakuniy baholash"),
        ("kpi:appeal", "KPI Baholash", "Apellyatsiya berish", "Norozilik arizasini komissiyaga taqdim etish"),
        ("kpi:appeal_review", "KPI Baholash", "Apellyatsiyani koʻrib chiqish", "Apellyatsiya arizalarini koʻrib chiqish va qaror qabul qilish"),
        ("svetafor:view", "KPI Baholash", "Svetafor reytingini koʻrish", "Professor-oʻqituvchilarning integral reytingi va ustamalarini koʻrish"),
        
        # Tizim boshqaruvi
        ("users:manage", "Tizim", "Foydalanuvchilarni boshqarish", "Foydalanuvchilar, rollar va parollarni boshqarish"),
        ("settings:manage", "Tizim", "Tizim sozlamalari", "Baholash davri, mezonlar va komissiya aʼzolarini sozlash"),
        ("rbac:manage", "Tizim", "Rollar va huquqlarni boshqarish", "Dinamik RBAC rollari va huquqlarini oʻzgartirish")
    ]
    cursor.executemany("""
        INSERT OR IGNORE INTO rbac_permissions (code, module, name, description)
        VALUES (?, ?, ?, ?)
    """, default_permissions)

    # Standart tizim rollari (Seed Roles)
    default_roles = [
        ("ADMIN", "Tizim Administratori", "Tizimning toʻliq texnik va maʼmuriy boshqaruvi", 1),
        ("RECTORATE", "Filial Rahbariyati", "Filial miqyosidagi umumiy integral monitoring va nazorat", 1),
        ("DEAN", "Fakultet Dekani", "Fakultet dekanati boʻyicha monitoring va tasdiqlash", 1),
        ("HEAD_OF_DEPT", "Kafedra Mudiri", "Kafedra professor-oʻqituvchilari ustidan monitoring va tekshiruv", 1),
        ("TEACHER", "Professor-oʻqituvchi", "Shaxsiy kabinet, oʻquv yuklamasi va hisobot topshirish", 1)
    ]
    cursor.executemany("""
        INSERT OR IGNORE INTO rbac_roles (code, name, description, is_system)
        VALUES (?, ?, ?, ?)
    """, default_roles)

    # Rollar va huquqlar matritsasi (Seed Role-Permissions)
    role_perms_map = {
        "ADMIN": [p[0] for p in default_permissions],
        "RECTORATE": [
            "dashboard:view", "structure:view", "subjects:view_all", "hemis:view",
            "svetafor:view", "logs:view"
        ],
        "DEAN": [
            "dashboard:view", "structure:view", "subjects:view_faculty", "subjects:view_own",
            "subjects:manage_docs", "subjects:approve_dekan", "hemis:view", "kpi:submit",
            "kpi:appeal", "svetafor:view"
        ],
        "HEAD_OF_DEPT": [
            "dashboard:view", "structure:view", "subjects:view_dept", "subjects:view_own",
            "subjects:manage_docs", "subjects:approve_mudir", "hemis:view", "kpi:submit",
            "kpi:review_mudir", "kpi:appeal", "svetafor:view"
        ],
        "TEACHER": [
            "dashboard:view", "subjects:view_own", "subjects:manage_docs", "kpi:submit",
            "kpi:appeal", "svetafor:view"
        ]
    }
    for r_code, p_list in role_perms_map.items():
        for p_code in p_list:
            cursor.execute("""
                INSERT OR IGNORE INTO rbac_role_permissions (role_code, permission_code)
                VALUES (?, ?)
            """, (r_code, p_code))

    # 17. Universal Notifications table (Bildirishnomalar tizimi)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipient_role TEXT,
            recipient_username TEXT,
            recipient_id INTEGER,
            department TEXT,
            faculty TEXT,
            sender_name TEXT,
            sender_role TEXT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            link_tab TEXT,
            item_id TEXT,
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notif_recipient_role ON notifications(recipient_role);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notif_recipient_username ON notifications(recipient_username);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notif_dept ON notifications(department);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notif_is_read ON notifications(is_read);")

    # 18. Audit Trail (Tizim harakatlari va xavfsizlik jurnali)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_audit_trail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            user_name TEXT,
            user_role TEXT,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT,
            details TEXT,
            ip_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_username ON system_audit_trail(username);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_action ON system_audit_trail(action);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_created ON system_audit_trail(created_at);")

    conn.commit()
    conn.close()

# -------------------------------------------------------------
# RBAC (Role-Based Access Control) Ma'lumotlar Bazasi Metodlari
# -------------------------------------------------------------
def db_get_rbac_roles() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rbac_roles ORDER BY is_system DESC, code ASC")
    roles = [dict(r) for r in cursor.fetchall()]
    for role in roles:
        role["is_system"] = bool(role.get("is_system", 0))
        cursor.execute("SELECT permission_code FROM rbac_role_permissions WHERE role_code = ?", (role["code"],))
        role["permissions"] = [r[0] for r in cursor.fetchall()]
    conn.close()
    return roles

def db_get_rbac_permissions() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rbac_permissions ORDER BY module ASC, code ASC")
    perms = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return perms

def db_get_user_permissions(role_code: str) -> List[str]:
    """Berilgan rolga tegishli barcha faol huquq kodlarini olish"""
    if not role_code:
        return []
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT permission_code FROM rbac_role_permissions WHERE role_code = ?", (role_code.upper(),))
    perms = [r[0] for r in cursor.fetchall()]
    conn.close()
    return perms

def db_create_rbac_role(code: str, name: str, description: str = "") -> bool:
    clean_code = code.strip().upper().replace(" ", "_")
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO rbac_roles (code, name, description, is_system)
            VALUES (?, ?, ?, 0)
        """, (clean_code, name.strip(), description.strip()))
        conn.commit()
        conn.close()
        return True
    except Exception:
        conn.close()
        return False

def db_update_role_permissions(role_code: str, permission_codes: List[str]) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM rbac_role_permissions WHERE role_code = ?", (role_code.upper(),))
    for p in permission_codes:
        cursor.execute("""
            INSERT OR IGNORE INTO rbac_role_permissions (role_code, permission_code)
            VALUES (?, ?)
        """, (role_code.upper(), p.strip()))
    conn.commit()
    conn.close()
    return True

def db_delete_rbac_role(role_code: str) -> bool:
    """Tizim standart rollarini o'chirish taqiqlangan"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_system FROM rbac_roles WHERE code = ?", (role_code.upper(),))
    row = cursor.fetchone()
    if not row or row[0] == 1:
        conn.close()
        return False
    cursor.execute("DELETE FROM rbac_role_permissions WHERE role_code = ?", (role_code.upper(),))
    cursor.execute("DELETE FROM rbac_roles WHERE code = ?", (role_code.upper(),))
    conn.commit()
    conn.close()
    return True

def _format_user_dict(row_dict: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not row_dict:
        return None
    d = dict(row_dict)
    d["must_change_password"] = bool(d.get("must_change_password", 0))
    d["is_active"] = bool(d.get("is_active", 1))

    # Ko'p rollilik (Multi-role RBAC)
    raw_roles = d.get("roles")
    roles_list = []
    if raw_roles:
        try:
            if isinstance(raw_roles, str):
                import json
                roles_list = json.loads(raw_roles)
            elif isinstance(raw_roles, list):
                roles_list = raw_roles
        except Exception:
            roles_list = [r.strip() for r in raw_roles.split(",") if r.strip()]

    if not roles_list:
        primary_role = d.get("role", "TEACHER")
        if primary_role == "HEAD_OF_DEPT":
            roles_list = ["HEAD_OF_DEPT", "TEACHER"]
        elif primary_role == "DEAN":
            roles_list = ["DEAN", "TEACHER"]
        elif primary_role == "ADMIN":
            roles_list = ["ADMIN", "DEAN", "HEAD_OF_DEPT", "TEACHER", "RECTORATE"]
        elif primary_role == "RECTORATE":
            roles_list = ["RECTORATE", "TEACHER"]
        else:
            roles_list = [primary_role]

    d["roles"] = roles_list
    return d

# Foydalanuvchilar amallari
def db_load_users() -> Dict[str, Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    conn.close()
    users = {}
    for r in rows:
        formatted = _format_user_dict(dict(r))
        if formatted:
            users[formatted["username"].lower()] = formatted
    return users

def db_get_user(username: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(username) = LOWER(?)", (username.strip(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return _format_user_dict(dict(row))

def db_get_user_by_pinfl(pinfl: str) -> Optional[Dict[str, Any]]:
    if not pinfl or len(pinfl.strip()) < 5:
        return None
    clean_p = pinfl.strip()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE pinfl = ? OR employee_id_number = ?", (clean_p, clean_p))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return _format_user_dict(dict(row))

def db_get_user_by_name(full_name: str) -> Optional[Dict[str, Any]]:
    if not full_name or len(full_name.strip()) < 3:
        return None
    clean_n = full_name.strip()
    conn = get_connection()
    cursor = conn.cursor()
    # To'liq moslik yoki LIKE orqali qidirish
    cursor.execute("SELECT * FROM users WHERE LOWER(name) = LOWER(?)", (clean_n,))
    row = cursor.fetchone()
    if not row:
        # F.I.Sh. qismlari bo'yicha qidirib ko'rish
        parts = [p for p in clean_n.split() if len(p) >= 3]
        if len(parts) >= 2:
            query = "SELECT * FROM users WHERE LOWER(name) LIKE ? AND LOWER(name) LIKE ?"
            cursor.execute(query, (f"%{parts[0].lower()}%", f"%{parts[1].lower()}%"))
            row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return _format_user_dict(dict(row))

def db_attach_pinfl(username: str, pinfl: str, inn: Optional[str] = None) -> bool:
    if not username or not pinfl:
        return False
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users 
        SET pinfl = ?, inn = COALESCE(?, inn)
        WHERE LOWER(username) = LOWER(?)
    """, (pinfl.strip(), inn.strip() if inn else None, username.strip()))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

def db_save_user(username: str, data: Dict[str, Any], overwrite_auth: bool = False):
    conn = get_connection()
    cursor = conn.cursor()
    if overwrite_auth:
        cursor.execute("""
            INSERT INTO users (username, id, password, name, role, department, faculty, position, degree, fte, employee_id_number, must_change_password, image, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(username) DO UPDATE SET
                id = excluded.id,
                password = excluded.password,
                name = excluded.name,
                role = excluded.role,
                department = excluded.department,
                faculty = excluded.faculty,
                position = excluded.position,
                degree = excluded.degree,
                fte = excluded.fte,
                employee_id_number = excluded.employee_id_number,
                must_change_password = excluded.must_change_password,
                image = COALESCE(excluded.image, users.image),
                is_active = excluded.is_active
        """, (
            username.strip().lower(),
            data.get("id"),
            data.get("password", "parol123"),
            data.get("name", ""),
            data.get("role", "TEACHER"),
            data.get("department", ""),
            data.get("faculty", ""),
            data.get("position", "O'qituvchi"),
            data.get("degree", ""),
            data.get("fte", 1.0),
            data.get("employee_id_number"),
            1 if data.get("must_change_password") else 0,
            data.get("image"),
            1 if data.get("is_active", True) else 0
        ))
    else:
        cursor.execute("""
            INSERT INTO users (username, id, password, name, role, department, faculty, position, degree, fte, employee_id_number, must_change_password, image, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(username) DO UPDATE SET
                id = COALESCE(excluded.id, users.id),
                name = excluded.name,
                department = excluded.department,
                faculty = excluded.faculty,
                position = excluded.position,
                degree = excluded.degree,
                fte = excluded.fte,
                employee_id_number = excluded.employee_id_number,
                image = COALESCE(excluded.image, users.image)
        """, (
            username.strip().lower(),
            data.get("id"),
            data.get("password", "parol123"),
            data.get("name", ""),
            data.get("role", "TEACHER"),
            data.get("department", ""),
            data.get("faculty", ""),
            data.get("position", "O'qituvchi"),
            data.get("degree", ""),
            data.get("fte", 1.0),
            data.get("employee_id_number"),
            1 if data.get("must_change_password") else 0,
            data.get("image"),
            1 if data.get("is_active", True) else 0
        ))
    conn.commit()
    conn.close()

def db_update_password(username: str, new_password: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password = ?, must_change_password = 0 WHERE LOWER(username) = LOWER(?)", (new_password, username.strip()))
    conn.commit()
    conn.close()

def db_reset_user_password(username: str, initial_password: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password = ?, must_change_password = 1 WHERE LOWER(username) = LOWER(?)", (initial_password, username.strip()))
    conn.commit()
    conn.close()

def db_update_user_role(username: str, new_role: str, roles: Optional[List[str]] = None):
    conn = get_connection()
    cursor = conn.cursor()
    new_role_clean = new_role.upper().strip()
    roles_json = None
    if roles:
        roles_json = json.dumps(roles, ensure_ascii=False)
    else:
        if new_role_clean == "HEAD_OF_DEPT":
            roles_json = json.dumps(["HEAD_OF_DEPT", "TEACHER"], ensure_ascii=False)
        elif new_role_clean == "DEAN":
            roles_json = json.dumps(["DEAN", "TEACHER"], ensure_ascii=False)
        elif new_role_clean == "ADMIN":
            roles_json = json.dumps(["ADMIN", "DEAN", "HEAD_OF_DEPT", "TEACHER", "RECTORATE"], ensure_ascii=False)
        elif new_role_clean == "RECTORATE":
            roles_json = json.dumps(["RECTORATE", "TEACHER"], ensure_ascii=False)
        else:
            roles_json = json.dumps([new_role_clean], ensure_ascii=False)

    cursor.execute("UPDATE users SET role = ?, roles = ? WHERE LOWER(username) = LOWER(?)", (new_role_clean, roles_json, username.strip()))
    conn.commit()
    conn.close()

def db_toggle_user_status(username: str, is_active: bool):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET is_active = ? WHERE LOWER(username) = LOWER(?)", (1 if is_active else 0, username.strip()))
    conn.commit()
    conn.close()

# Arizalar amallari
def db_load_submissions() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM submissions ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_save_submission(data: Dict[str, Any]) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    sub_id = data.get("id")
    if sub_id and int(sub_id) > 0:
        cursor.execute("""
            INSERT INTO submissions (
                id, teacher_id, teacher_name, indicator_id, title, doi, authors_count,
                submitted_date, status, claimed_ball, ball, file_name, dept, description,
                reviewer_name, reviewed_date, reviewer_comment, rejection_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                indicator_id = excluded.indicator_id,
                title = excluded.title,
                doi = excluded.doi,
                authors_count = excluded.authors_count,
                claimed_ball = excluded.claimed_ball,
                ball = excluded.ball,
                file_name = excluded.file_name,
                dept = excluded.dept,
                description = excluded.description,
                status = excluded.status,
                reviewer_name = excluded.reviewer_name,
                reviewed_date = excluded.reviewed_date,
                reviewer_comment = excluded.reviewer_comment,
                rejection_reason = excluded.rejection_reason
        """, (
            int(sub_id),
            data.get("teacher_id"),
            data.get("teacher_name", ""),
            data.get("indicator_id", ""),
            data.get("title", ""),
            data.get("doi"),
            data.get("authors_count", 1),
            data.get("submitted_date"),
            data.get("status", "pending"),
            data.get("claimed_ball", 0.0),
            data.get("ball", 0.0),
            data.get("file_name"),
            data.get("dept"),
            data.get("description"),
            data.get("reviewer_name"),
            data.get("reviewed_date"),
            data.get("reviewer_comment"),
            data.get("rejection_reason")
        ))
        conn.commit()
        conn.close()
        return int(sub_id)
    else:
        cursor.execute("""
            INSERT INTO submissions (
                teacher_id, teacher_name, indicator_id, title, doi, authors_count,
                submitted_date, status, claimed_ball, ball, file_name, dept, description,
                reviewer_name, reviewed_date, reviewer_comment, rejection_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get("teacher_id"),
            data.get("teacher_name", ""),
            data.get("indicator_id", ""),
            data.get("title", ""),
            data.get("doi"),
            data.get("authors_count", 1),
            data.get("submitted_date"),
            data.get("status", "pending"),
            data.get("claimed_ball", 0.0),
            data.get("ball", 0.0),
            data.get("file_name"),
            data.get("dept"),
            data.get("description"),
            data.get("reviewer_name"),
            data.get("reviewed_date"),
            data.get("reviewer_comment"),
            data.get("rejection_reason")
        ))
        generated_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return generated_id

def db_get_teacher_scores() -> Dict[Any, Dict[str, float]]:
    """
    Barcha tasdiqlangan (status = 'approved') arizalar bo'yicha
    o'qituvchilarning 4 ta blok bo'yicha jamlangan haqiqiy ballarini qaytaradi.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT teacher_id, teacher_name, indicator_id, ball
        FROM submissions
        WHERE status = 'approved' AND ball > 0
    """)
    rows = cursor.fetchall()
    conn.close()

    scores_by_teacher: Dict[Any, Dict[str, float]] = {}
    for r in rows:
        t_id = r["teacher_id"]
        t_name = (r["teacher_name"] or "").strip().lower()
        ind = str(r["indicator_id"] or "")
        ball = float(r["ball"] or 0.0)

        block = "ilm"
        if ind.startswith("1."):
            block = "oqv"
        elif ind.startswith("2."):
            block = "ilm"
        elif ind.startswith("3."):
            block = "xal"
        elif ind.startswith("4."):
            block = "man"

        for key in [t_id, t_name]:
            if key not in scores_by_teacher:
                scores_by_teacher[key] = {"oqv": 0.0, "ilm": 0.0, "xal": 0.0, "man": 0.0}
            scores_by_teacher[key][block] = round(scores_by_teacher[key][block] + ball, 2)

    return scores_by_teacher

def db_load_all_active_teachers() -> List[Dict[str, Any]]:
    """
    users jadvalidan pedagogik faoliyat yurituvchi barcha 200+ xodimni to'liq yuklaydi.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT username, id, name, role, roles, department, faculty,
               position, degree, fte, image, employee_id_number
        FROM users
        WHERE is_active = 1
        ORDER BY faculty ASC, department ASC, name ASC
    """)
    rows = cursor.fetchall()
    conn.close()

    teachers = []
    for r in rows:
        d = dict(r)
        r_role = d.get("role", "TEACHER").upper()
        roles_list = []
        if d.get("roles"):
            try:
                roles_list = json.loads(d["roles"]) if isinstance(d["roles"], str) else d["roles"]
            except Exception:
                roles_list = [r_role]
        else:
            roles_list = [r_role]

        is_academic = any(rl in ["TEACHER", "HEAD_OF_DEPT", "DEAN"] for rl in roles_list) or r_role in ["TEACHER", "HEAD_OF_DEPT", "DEAN"]
        if is_academic or r_role not in ["ADMIN", "RECTORATE"]:
            teachers.append({
                "username": d["username"],
                "id": d["id"] or (abs(hash(d["username"])) % 100000),
                "name": d["name"],
                "role": r_role,
                "roles": roles_list,
                "department": d.get("department") or "Boshqa",
                "faculty": d.get("faculty") or "Filial boʻlimi",
                "position": d.get("position") or "Oʻqituvchi",
                "degree": d.get("degree") or "Darajasiz",
                "fte": float(d.get("fte") or 1.0),
                "image": d.get("image"),
                "employee_id_number": d.get("employee_id_number")
            })

    return teachers

def db_delete_submission(sub_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM submissions WHERE id = ?", (sub_id,))
    conn.commit()
    conn.close()

def db_save_audit_log(time_str: str, user: str, action: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO audit_logs (time, user, action) VALUES (?, ?, ?)", (time_str, user, action))
    conn.commit()
    conn.close()

def db_load_audit_logs() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Tizim sozlamalari
def db_save_settings(data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO system_settings (
            id, academic_year, submissions_open, deadline_date,
            submission_deadline, review_deadline, appeal_deadline, current_stage,
            budget_cap_monthly
        )
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            academic_year = excluded.academic_year,
            submissions_open = excluded.submissions_open,
            deadline_date = excluded.deadline_date,
            submission_deadline = excluded.submission_deadline,
            review_deadline = excluded.review_deadline,
            appeal_deadline = excluded.appeal_deadline,
            current_stage = excluded.current_stage,
            budget_cap_monthly = excluded.budget_cap_monthly,
            updated_at = CURRENT_TIMESTAMP
    """, (
        data.get("academic_year", "2025/2026-oʻquv yili"),
        1 if data.get("submissions_open", True) else 0,
        data.get("deadline_date", "2026-10-25"),
        data.get("submission_deadline", "2026-10-25"),
        data.get("review_deadline", "2026-11-05"),
        data.get("appeal_deadline", "2026-11-15"),
        data.get("current_stage", "ALL_OPEN"),
        data.get("budget_cap_monthly", 150000000.0)
    ))
    conn.commit()
    conn.close()

def db_load_settings() -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM system_settings WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["submissions_open"] = bool(d.get("submissions_open", 1))
    d["submission_deadline"] = d.get("submission_deadline") or "2026-10-25"
    d["review_deadline"] = d.get("review_deadline") or "2026-11-05"
    d["appeal_deadline"] = d.get("appeal_deadline") or "2026-11-15"
    d["deadline_date"] = d.get("deadline_date") or "2026-10-25"
    d["current_stage"] = d.get("current_stage") or "ALL_OPEN"
    return d

# Mezonlar
def db_load_indicators() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM indicators ORDER BY CAST(id AS INTEGER), id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_save_indicator(data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO indicators (id, block, name, max_ball, validity, dept, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            block = excluded.block,
            name = excluded.name,
            max_ball = excluded.max_ball,
            validity = excluded.validity,
            dept = excluded.dept,
            description = excluded.description
    """, (
        str(data.get("id")),
        data.get("block"),
        data.get("name"),
        data.get("max_ball"),
        data.get("validity"),
        data.get("dept"),
        data.get("description", "")
    ))
    conn.commit()
    conn.close()

def db_reset_to_council_indicators(indicators_list: List[Dict[str, Any]]):
    """Rasmiy Ilmiy kengash nizomidagi 20 ta mezonni bazaga to'liq yangilash"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM indicators")
    for ind in indicators_list:
        cursor.execute("""
            INSERT INTO indicators (id, block, name, max_ball, validity, dept, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            str(ind["id"]),
            ind["block"],
            ind["name"],
            float(ind["max_ball"]),
            ind.get("validity", ""),
            ind.get("dept", ""),
            ind.get("description", "")
        ))
    conn.commit()
    conn.close()

# -------------------------------------------------------------
# Apellyatsiyalar (Appeals) boshqaruvi
# -------------------------------------------------------------
def db_load_appeals() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appeals ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_save_appeal(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO appeals (
            id, submission_id, teacher_id, teacher_name, indicator_id, title,
            claimed_ball, reviewed_ball, initial_reviewer, initial_rejection_reason,
            appeal_reason, evidence_file, status, commission_member, commission_comment,
            decision_date, awarded_ball
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            commission_member = excluded.commission_member,
            commission_comment = excluded.commission_comment,
            decision_date = excluded.decision_date,
            awarded_ball = excluded.awarded_ball
    """, (
        data.get("id"),
        data.get("submission_id"),
        data.get("teacher_id"),
        data.get("teacher_name"),
        data.get("indicator_id"),
        data.get("title"),
        data.get("claimed_ball", 0.0),
        data.get("reviewed_ball", 0.0),
        data.get("initial_reviewer"),
        data.get("initial_rejection_reason"),
        data.get("appeal_reason"),
        data.get("evidence_file"),
        data.get("status", "PENDING"),
        data.get("commission_member"),
        data.get("commission_comment"),
        data.get("decision_date"),
        data.get("awarded_ball", 0.0)
    ))
    conn.commit()
    conn.close()
    return data

def db_review_appeal(appeal_id: str, decision: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE appeals
        SET status = ?,
            commission_member = ?,
            commission_comment = ?,
            decision_date = ?,
            awarded_ball = ?
        WHERE id = ?
    """, (
        decision.get("status", "ACCEPTED"),
        decision.get("commission_member", "Apellyatsiya Komissiyasi"),
        decision.get("commission_comment", ""),
        decision.get("decision_date"),
        decision.get("awarded_ball", 0.0),
        appeal_id
    ))
    conn.commit()

    # Agar apellyatsiya qanoatlantirilsa (yoki qisman), arizaning ballini ham yangilaymiz!
    cursor.execute("SELECT submission_id FROM appeals WHERE id = ?", (appeal_id,))
    row = cursor.fetchone()
    if row and decision.get("status") in ["ACCEPTED", "PARTIALLY_ACCEPTED"]:
        sub_id = row["submission_id"]
        awarded_ball = decision.get("awarded_ball", 0.0)
        cursor.execute("""
            UPDATE submissions
            SET status = 'approved',
                ball = ?,
                reviewer_comment = ?
            WHERE id = ?
        """, (
            awarded_ball,
            f"Apellyatsiya komissiyasi qarori bilan tasdiqlandi: {decision.get('commission_comment', '')}",
            sub_id
        ))
        conn.commit()

    cursor.execute("SELECT * FROM appeals WHERE id = ?", (appeal_id,))
    res = cursor.fetchone()
    conn.close()
    return dict(res) if res else None

# -------------------------------------------------------------
# Baholovchilar / Ekspertlar (Evaluators) boshqaruvi
# -------------------------------------------------------------
def db_load_evaluators() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evaluators ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_add_evaluator(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO evaluators (user_id, username, name, assigned_category, role_type, deadline_date, is_active, assigned_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("user_id"),
        data.get("username", "").strip().lower(),
        data.get("name"),
        data.get("assigned_category", "Barcha mezonlar"),
        data.get("role_type", "EXPERT"),
        data.get("deadline_date"),
        1 if data.get("is_active", True) else 0,
        data.get("assigned_by", "ADMIN")
    ))
    eval_id = cursor.lastrowid
    conn.commit()
    conn.close()
    data["id"] = eval_id
    return data

def db_delete_evaluator(evaluator_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM evaluators WHERE id = ?", (evaluator_id,))
    conn.commit()
    conn.close()

# -------------------------------------------------------------
# HEMIS O'quv yuklamalari (Teacher Workloads) boshqaruvi
# -------------------------------------------------------------
def db_save_workloads(items: List[Dict[str, Any]]) -> int:
    """HEMIS o'quv yuklamalarini saqlash (tozalab qayta yozish)"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM teacher_workloads")
    
    rows = []
    for item in items:
        emp = item.get("employee", {}) or {}
        emp_id = emp.get("id") or 0
        emp_name = (emp.get("full_name") or "").strip()
        dept = (item.get("department", {}) or {}).get("name", "")
        subj = (item.get("subject", {}) or {}).get("name", "")
        edu = item.get("educationType", {}) or {}
        edu_code = str(edu.get("code") or "")
        edu_name = edu.get("name") or "Bakalavr"
        hours = int(item.get("total_hours") or 0)
        
        if emp_name and subj:
            rows.append((emp_id, emp_name, dept, subj, edu_code, edu_name, hours))
            
    cursor.executemany("""
        INSERT INTO teacher_workloads (
            employee_id, employee_name, department_name, subject_name,
            education_type_code, education_type_name, total_hours
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, rows)
    
    conn.commit()
    inserted_count = cursor.rowcount
    conn.close()
    return inserted_count

def db_get_teacher_workloads(employee_id: Optional[int] = None, employee_name: Optional[str] = None) -> List[Dict[str, Any]]:
    """Muayyan o'qituvchining HEMIS o'quv yuklamasini olish"""
    conn = get_connection()
    cursor = conn.cursor()
    
    if employee_id:
        cursor.execute("SELECT * FROM teacher_workloads WHERE employee_id = ? ORDER BY total_hours DESC", (employee_id,))
    elif employee_name:
        clean_name = f"%{employee_name.strip()}%"
        cursor.execute("SELECT * FROM teacher_workloads WHERE employee_name LIKE ? ORDER BY total_hours DESC", (clean_name,))
    else:
        cursor.execute("SELECT * FROM teacher_workloads ORDER BY employee_name ASC, total_hours DESC")
        
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_get_workloads_summary() -> Dict[str, Any]:
    """Umumiy o'quv yuklamasi statistikasi"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            COUNT(*) as total_items,
            COUNT(DISTINCT employee_id) as total_teachers,
            COALESCE(SUM(total_hours), 0) as total_hours,
            COALESCE(SUM(CASE WHEN education_type_name = 'Bakalavr' OR education_type_code = '11' THEN total_hours ELSE 0 END), 0) as bachelor_hours,
            COALESCE(SUM(CASE WHEN education_type_name = 'Magistr' OR education_type_code = '12' THEN total_hours ELSE 0 END), 0) as master_hours
        FROM teacher_workloads
    """)
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {
        "total_items": 0,
        "total_teachers": 0,
        "total_hours": 0,
        "bachelor_hours": 0,
        "master_hours": 0
    }

# -------------------------------------------------------------
# Fan hujjatlari (Course Syllabus & Teaching Materials)
# -------------------------------------------------------------
def db_save_course_doc(data: Dict[str, Any]) -> Dict[str, Any]:
    import uuid
    conn = get_connection()
    cursor = conn.cursor()
    token = data.get("verification_token") or str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO course_syllabus_docs (
            teacher_id, teacher_name, subject_name, department_name, academic_year,
            doc_type, title, file_url, file_name, status,
            mudir_status, mudir_comment, mudir_updated_at,
            dean_status, dean_comment, dean_updated_at,
            verification_token
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("teacher_id"),
        data.get("teacher_name", "").strip(),
        data.get("subject_name", "").strip(),
        data.get("department_name", "").strip(),
        data.get("academic_year", "2024-2025"),
        data.get("doc_type", "SYLLABUS"),
        data.get("title", "").strip(),
        data.get("file_url", ""),
        data.get("file_name", ""),
        data.get("status", "SUBMITTED"),
        data.get("mudir_status", "PENDING"),
        data.get("mudir_comment"),
        data.get("mudir_updated_at"),
        data.get("dean_status", "PENDING"),
        data.get("dean_comment"),
        data.get("dean_updated_at"),
        token
    ))
    doc_id = cursor.lastrowid
    conn.commit()
    cursor.execute("SELECT * FROM course_syllabus_docs WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else data

def db_get_course_docs(
    teacher_id: Optional[int] = None,
    teacher_name: Optional[str] = None,
    department_name: Optional[str] = None,
    subject_name: Optional[str] = None
) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM course_syllabus_docs WHERE 1=1"
    params = []
    
    if teacher_name:
        query += " AND teacher_name LIKE ?"
        params.append(f"%{teacher_name.strip()}%")
    if department_name:
        query += " AND department_name LIKE ?"
        params.append(f"%{department_name.strip()}%")
    if subject_name:
        query += " AND subject_name LIKE ?"
        params.append(f"%{subject_name.strip()}%")
        
    query += " ORDER BY id DESC"
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_update_course_doc_review(doc_id: int, role: str, status: str, comment: str) -> Optional[Dict[str, Any]]:
    from datetime import datetime
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_connection()
    cursor = conn.cursor()
    
    if role.lower() == "mudir":
        new_overall = "MUDIR_APPROVED" if status == "APPROVED" else "MUDIR_REJECTED"
        cursor.execute("""
            UPDATE course_syllabus_docs
            SET mudir_status = ?, mudir_comment = ?, mudir_updated_at = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, comment, now_str, new_overall, doc_id))
    elif role.lower() == "dean":
        new_overall = "APPROVED" if status == "APPROVED" else "DEAN_REJECTED"
        cursor.execute("""
            UPDATE course_syllabus_docs
            SET dean_status = ?, dean_comment = ?, dean_updated_at = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, comment, now_str, new_overall, doc_id))
    else:
        conn.close()
        return None
        
    conn.commit()
    cursor.execute("SELECT * FROM course_syllabus_docs WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def db_get_course_doc_by_token(token: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM course_syllabus_docs WHERE verification_token = ?", (token,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def db_delete_course_doc(doc_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM course_syllabus_docs WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()

# -------------------------------------------------------------
# Darslik, O'quv qo'llanma, Monografiya Kengashlar Zanjiri
# -------------------------------------------------------------
def db_save_publication(data: Dict[str, Any]) -> Dict[str, Any]:
    import uuid
    conn = get_connection()
    cursor = conn.cursor()
    token = data.get("verification_token") or str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO publication_recommendations (
            teacher_id, teacher_name, subject_name, department_name, academic_year,
            pub_type, title, authors, co_authors,
            manuscript_file, internal_review_file, internal_reviewer_name,
            external_review_file, external_reviewer_name,
            curriculum_file, antiplagiarism_file, antiplagiarism_score,
            workload_extract_file,
            kafedra_status, fakultet_status, methodical_status, council_status,
            overall_status, verification_token
        ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?,
            ?, ?, ?,
            ?,
            'PENDING', 'PENDING', 'PENDING', 'PENDING',
            'AT_KAFEDRA', ?
        )
    """, (
        data.get("teacher_id"),
        data.get("teacher_name", "").strip(),
        data.get("subject_name", "").strip(),
        data.get("department_name", "").strip(),
        data.get("academic_year", "2024-2025"),
        data.get("pub_type", "O'QUV QO'LLANMA"),
        data.get("title", "").strip(),
        data.get("authors", "").strip(),
        data.get("co_authors", "").strip(),
        data.get("manuscript_file", ""),
        data.get("internal_review_file", ""),
        data.get("internal_reviewer_name", "").strip(),
        data.get("external_review_file", ""),
        data.get("external_reviewer_name", "").strip(),
        data.get("curriculum_file", ""),
        data.get("antiplagiarism_file", ""),
        float(data.get("antiplagiarism_score") or 0.0),
        data.get("workload_extract_file", ""),
        token
    ))
    pub_id = cursor.lastrowid
    conn.commit()
    cursor.execute("SELECT * FROM publication_recommendations WHERE id = ?", (pub_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else data

def db_get_publications(
    teacher_id: Optional[int] = None,
    teacher_name: Optional[str] = None,
    department_name: Optional[str] = None,
    subject_name: Optional[str] = None
) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM publication_recommendations WHERE 1=1"
    params = []
    
    if teacher_name:
        query += " AND teacher_name LIKE ?"
        params.append(f"%{teacher_name.strip()}%")
    if department_name:
        query += " AND department_name LIKE ?"
        params.append(f"%{department_name.strip()}%")
    if subject_name:
        query += " AND subject_name LIKE ?"
        params.append(f"%{subject_name.strip()}%")
        
    query += " ORDER BY id DESC"
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_update_publication_stage(
    pub_id: int,
    stage: str,
    status: str,
    protocol_num: str = "",
    protocol_date: str = "",
    protocol_file: str = "",
    comment: str = ""
) -> Optional[Dict[str, Any]]:
    from datetime import datetime
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_connection()
    cursor = conn.cursor()
    
    stage = stage.lower()
    if stage == "kafedra":
        new_overall = "AT_FAKULTET" if status == "APPROVED" else "KAFEDRA_REJECTED"
        cursor.execute("""
            UPDATE publication_recommendations
            SET kafedra_status = ?, kafedra_protocol_num = ?, kafedra_protocol_date = ?,
                kafedra_protocol_file = ?, kafedra_comment = ?, kafedra_updated_at = ?,
                overall_status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, protocol_num, protocol_date, protocol_file, comment, now_str, new_overall, pub_id))
    elif stage == "fakultet":
        new_overall = "AT_METHODICAL" if status == "APPROVED" else "FAKULTET_REJECTED"
        cursor.execute("""
            UPDATE publication_recommendations
            SET fakultet_status = ?, fakultet_protocol_num = ?, fakultet_protocol_date = ?,
                fakultet_protocol_file = ?, fakultet_comment = ?, fakultet_updated_at = ?,
                overall_status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, protocol_num, protocol_date, protocol_file, comment, now_str, new_overall, pub_id))
    elif stage == "methodical":
        new_overall = "AT_COUNCIL" if status == "APPROVED" else "METHODICAL_REJECTED"
        cursor.execute("""
            UPDATE publication_recommendations
            SET methodical_status = ?, methodical_protocol_num = ?, methodical_protocol_date = ?,
                methodical_protocol_file = ?, methodical_comment = ?, methodical_updated_at = ?,
                overall_status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, protocol_num, protocol_date, protocol_file, comment, now_str, new_overall, pub_id))
    elif stage == "council":
        new_overall = "COUNCIL_RECOMMENDED" if status == "APPROVED" else "COUNCIL_REJECTED"
        cursor.execute("""
            UPDATE publication_recommendations
            SET council_status = ?, council_protocol_num = ?, council_protocol_date = ?,
                council_protocol_file = ?, council_comment = ?, council_updated_at = ?,
                overall_status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (status, protocol_num, protocol_date, protocol_file, comment, now_str, new_overall, pub_id))
    else:
        conn.close()
        return None

    conn.commit()
    cursor.execute("SELECT * FROM publication_recommendations WHERE id = ?", (pub_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def db_update_publication_mygov(
    pub_id: int,
    mygov_app_num: str,
    ministry_grif_num: str = "",
    ministry_certificate_file: str = ""
) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    overall = "MINISTRY_APPROVED" if ministry_grif_num else "SUBMITTED_TO_MYGOV"
    cursor.execute("""
        UPDATE publication_recommendations
        SET mygov_app_num = ?, ministry_grif_num = ?, ministry_certificate_file = ?,
            overall_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (mygov_app_num, ministry_grif_num, ministry_certificate_file, overall, pub_id))
    conn.commit()
    cursor.execute("SELECT * FROM publication_recommendations WHERE id = ?", (pub_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def db_get_publication_by_token(token: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM publication_recommendations WHERE verification_token = ?", (token,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def db_get_publication_by_id(pub_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM publication_recommendations WHERE id = ?", (pub_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def db_delete_publication(pub_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM publication_recommendations WHERE id = ?", (pub_id,))
    conn.commit()
    conn.close()

# -------------------------------------------------------------
# HEMIS O'quv rejalar (Curriculums)
# -------------------------------------------------------------
def db_save_hemis_curriculums(items: List[Dict[str, Any]]) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM hemis_curriculums")
    
    rows = []
    for it in items:
        spec = it.get("specialty") or {}
        dept = it.get("department") or {}
        eyear = it.get("educationYear") or {}
        etype = it.get("educationType") or {}
        eform = it.get("educationForm") or {}
        msys = it.get("markingSystem") or {}
        rows.append((
            it.get("id"),
            it.get("name", ""),
            spec.get("code", ""),
            spec.get("name", ""),
            dept.get("name", ""),
            dept.get("code", ""),
            eyear.get("name", ""),
            etype.get("name", ""),
            eform.get("name", ""),
            msys.get("name", ""),
            it.get("semester_count", 8),
            it.get("education_period", 4),
            1 if it.get("active", True) else 0
        ))
    cursor.executemany("""
        INSERT OR REPLACE INTO hemis_curriculums (
            id, name, specialty_code, specialty_name, department_name, department_code,
            education_year, education_type, education_form, marking_system,
            semester_count, education_period, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)
    conn.commit()
    count = cursor.rowcount
    conn.close()
    return count

def db_get_hemis_curriculums() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hemis_curriculums ORDER BY education_year DESC, name ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# -------------------------------------------------------------
# HEMIS O'quv rejadagi fanlar (Curriculum Subjects)
# -------------------------------------------------------------
def db_save_hemis_curriculum_subjects(items: List[Dict[str, Any]], clear_existing: bool = False) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    if clear_existing:
        cursor.execute("DELETE FROM hemis_curriculum_subjects")
    
    rows = []
    for it in items:
        subj = it.get("subject") or {}
        stype = it.get("subjectType") or {}
        sblock = it.get("subjectBlock") or {}
        sem = it.get("semester") or {}
        dept = it.get("department") or {}
        
        # Details (hours breakdown)
        details = it.get("subjectDetails") or []
        lec = 0
        prac = 0
        sem_h = 0
        lab = 0
        indep = 0
        for d in details:
            t_type = (d.get("trainingType") or {}).get("code")
            load = int(d.get("academic_load") or 0)
            if t_type == "11":
                lec += load
            elif t_type == "13":
                prac += load
            elif t_type == "14":
                sem_h += load
            elif t_type == "12":
                lab += load
            elif t_type == "17":
                indep += load
                
        rows.append((
            it.get("id"),
            it.get("_curriculum"),
            subj.get("id"),
            subj.get("name", ""),
            subj.get("code", ""),
            stype.get("name", ""),
            sblock.get("name", ""),
            sem.get("name", ""),
            str(sem.get("code", "")),
            int(it.get("total_acload") or 0),
            int(it.get("credit") or 0),
            lec, prac, sem_h, lab, indep,
            dept.get("name", ""),
            int(it.get("resource_count") or 0)
        ))
    cursor.executemany("""
        INSERT OR REPLACE INTO hemis_curriculum_subjects (
            id, curriculum_id, subject_id, subject_name, subject_code,
            subject_type, subject_block, semester_name, semester_code,
            total_acload, credit, lecture_hours, practical_hours,
            seminar_hours, lab_hours, independent_hours,
            department_name, resource_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)
    conn.commit()
    count = cursor.rowcount
    conn.close()
    return count

def db_get_hemis_curriculum_subjects(curriculum_id: Optional[int] = None, subject_name: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM hemis_curriculum_subjects WHERE 1=1"
    params = []
    if curriculum_id:
        query += " AND curriculum_id = ?"
        params.append(curriculum_id)
    if subject_name:
        query += " AND subject_name LIKE ?"
        params.append(f"%{subject_name.strip()}%")
    query += " ORDER BY semester_code ASC, subject_name ASC"
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# -------------------------------------------------------------
# HEMIS Fan resurslari (Subject File Resources)
# -------------------------------------------------------------

def db_find_subject_id_by_name(subject_name: str) -> Optional[int]:
    """Fan nomi bo'yicha hemis_curriculum_subjects yoki hemis_subject_teachers dan subject_id ni topish"""
    if not subject_name:
        return None
    clean_name = subject_name.split("(")[0].strip()
    conn = get_connection()
    cursor = conn.cursor()
    # 1. hemis_curriculum_subjects dan qidirish
    cursor.execute("""
        SELECT subject_id FROM hemis_curriculum_subjects 
        WHERE subject_id IS NOT NULL AND (subject_name = ? OR subject_name LIKE ?)
        LIMIT 1
    """, (clean_name, f"%{clean_name}%"))
    row = cursor.fetchone()
    if row and row["subject_id"]:
        conn.close()
        return int(row["subject_id"])
    
    # 2. hemis_subject_teachers dan qidirish
    cursor.execute("""
        SELECT subject_id FROM hemis_subject_teachers 
        WHERE subject_id IS NOT NULL AND (subject_name = ? OR subject_name LIKE ?)
        LIMIT 1
    """, (clean_name, f"%{clean_name}%"))
    row = cursor.fetchone()
    conn.close()
    if row and row["subject_id"]:
        return int(row["subject_id"])
    return None

def db_save_hemis_subject_resources(items: List[Dict[str, Any]], clear_all: bool = False) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    
    # ensure file_url index exists
    try:
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_res_file_url ON hemis_subject_resources(file_url);")
    except Exception:
        pass
        
    if clear_all:
        cursor.execute("DELETE FROM hemis_subject_resources")
    
    rows = []
    for it in items:
        subj = it.get("subject") or {}
        ttype = it.get("trainingType") or {}
        emp = it.get("employee") or {}
        
        # Files list
        file_items = it.get("subjectFileResourceItems") or []
        for fi in file_items:
            rtype = fi.get("resourceType") or {}
            files = fi.get("files") or []
            ts = fi.get("updated_at") or it.get("updated_at") or 0
            for f in files:
                f_url = f.get("url", "")
                if not f_url:
                    continue
                rows.append((
                    it.get("id"),
                    it.get("title", ""),
                    subj.get("id"),
                    subj.get("name", ""),
                    subj.get("code", ""),
                    ttype.get("name", ""),
                    emp.get("id"),
                    emp.get("name", ""),
                    rtype.get("name", ""),
                    f.get("name", ""),
                    int(f.get("size") or 0),
                    f_url,
                    ts
                ))
    cursor.executemany("""
        INSERT OR REPLACE INTO hemis_subject_resources (
            id, title, subject_id, subject_name, subject_code,
            training_type, employee_id, employee_name,
            resource_type, file_name, file_size, file_url, updated_at_ts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)
    conn.commit()
    count = len(rows)
    conn.close()
    return count

def db_get_hemis_subject_resources(employee_name: Optional[str] = None, subject_name: Optional[str] = None, subject_id: Optional[int] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    
    # Agar subject_id berilmagan bo'lsa, subject_name orqali aniqlash
    resolved_subj_id = subject_id
    clean_name = None
    if subject_name:
        clean_name = subject_name.split("(")[0].strip()
        if not resolved_subj_id:
            resolved_subj_id = db_find_subject_id_by_name(clean_name)
    
    query = "SELECT * FROM hemis_subject_resources WHERE 1=1"
    params = []
    
    if resolved_subj_id:
        query += " AND (subject_id = ? OR subject_name LIKE ?)"
        params.extend([resolved_subj_id, f"%{clean_name or ''}%"])
    elif clean_name:
        query += " AND subject_name LIKE ?"
        params.append(f"%{clean_name}%")
        
    if employee_name and employee_name.strip():
        emp_clean = employee_name.strip()
        query += " AND employee_name LIKE ?"
        params.append(f"%{emp_clean}%")
        
    query += " ORDER BY updated_at_ts DESC, id DESC"
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# -------------------------------------------------------------
# HEMIS Fanlarga biriktirilgan o'qituvchilar va guruhlar (Subject Teachers)
# -------------------------------------------------------------
def db_save_hemis_subject_teachers(items: List[Dict[str, Any]], clear_existing: bool = False) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    if clear_existing:
        cursor.execute("DELETE FROM hemis_subject_teachers")
    
    rows = []
    for it in items:
        subj = it.get("subject") or {}
        emp = it.get("employee") or {}
        ttype = (it.get("curriculumSubjectDetail") or {}).get("trainingType") or {}
        rows.append((
            it.get("id"),
            it.get("_curriculum"),
            str(it.get("_semester") or ""),
            str(it.get("_education_year") or ""),
            it.get("_department"),
            subj.get("id"),
            subj.get("name", ""),
            subj.get("code", ""),
            emp.get("id"),
            emp.get("name", ""),
            ttype.get("name", ""),
            it.get("_group"),
            int(it.get("students_count") or 0)
        ))
    cursor.executemany("""
        INSERT OR REPLACE INTO hemis_subject_teachers (
            id, curriculum_id, semester_code, education_year, department_id,
            subject_id, subject_name, subject_code,
            employee_id, employee_name, training_type, group_id, students_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)
    conn.commit()
    count = cursor.rowcount
    conn.close()
    return count

def db_get_hemis_subject_teachers(employee_name: Optional[str] = None, subject_name: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM hemis_subject_teachers WHERE 1=1"
    params = []
    if employee_name:
        query += " AND employee_name LIKE ?"
        params.append(f"%{employee_name.strip()}%")
    if subject_name:
        query += " AND subject_name LIKE ?"
        params.append(f"%{subject_name.strip()}%")
    query += " ORDER BY id DESC"
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# -------------------------------------------------------------
# HEMIS Ilmiy faoliyat va iqtiboslik (Scientific Activity)
# -------------------------------------------------------------
def db_save_hemis_scientific_activities(
    items: List[Dict[str, Any]],
    clear_existing: bool = False,
    emp_name_map: Optional[Dict[int, str]] = None
) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    if clear_existing:
        cursor.execute("DELETE FROM hemis_scientific_activity")
    
    # 1. Bazadagi o'quv yuklamalaridan o'qituvchilar nomini olish
    cursor.execute("SELECT DISTINCT employee_id, employee_name FROM teacher_workloads WHERE employee_id IS NOT NULL")
    db_emp_map: Dict[int, str] = {int(r[0]): r[1] for r in cursor.fetchall() if r[0] and r[1]}

    # 2. Users jadvalidan ham qo'shimcha nomlarni olish
    cursor.execute("SELECT id, name FROM users WHERE id IS NOT NULL")
    for r in cursor.fetchall():
        if r[0] and r[1] and int(r[0]) not in db_emp_map:
            db_emp_map[int(r[0])] = r[1]

    # 3. Tashqaridan berilgan emp_name_map bilan boyitish
    if emp_name_map:
        for eid, ename in emp_name_map.items():
            if eid and ename:
                db_emp_map[int(eid)] = ename

    rows = []
    for it in items:
        # Platform nomi mapping
        p_code = str(it.get("_scientific_platform") or "")
        p_name = "Boshqa"
        if p_code == "11":
            p_name = "Scopus"
        elif p_code == "12":
            p_name = "ResearchGate"
        elif p_code == "13":
            p_name = "Google Scholar"
        elif p_code == "14":
            p_name = "Web of Science"
            
        emp_id = it.get("_employee") or it.get("employee_id")
        emp_obj = it.get("employee") or {}
        emp_name = (
            emp_obj.get("name") or 
            it.get("employee_name") or 
            (db_emp_map.get(int(emp_id)) if emp_id else "") or 
            ""
        )

        if not emp_name and emp_id:
            emp_name = f"Olim #{emp_id}"
        
        rows.append((
            it.get("id"),
            emp_id,
            emp_name,
            p_name,
            it.get("profile_link") or "",
            int(it.get("h_index") or 0),
            int(it.get("publication_work_count") or 0),
            int(it.get("citation_count") or 0),
            str(it.get("_education_year") or it.get("education_year") or ""),
            1 if it.get("is_checked") else 0
        ))
    cursor.executemany("""
        INSERT OR REPLACE INTO hemis_scientific_activity (
            id, employee_id, employee_name, scientific_platform, profile_link,
            h_index, publication_work_count, citation_count, education_year, is_checked
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)
    conn.commit()
    count = cursor.rowcount
    conn.close()
    return count

def db_get_hemis_scientific_activities(employee_id: Optional[int] = None, employee_name: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM hemis_scientific_activity WHERE 1=1"
    params = []
    if employee_id:
        query += " AND employee_id = ?"
        params.append(employee_id)
    if employee_name and employee_name.strip():
        query += " AND employee_name LIKE ?"
        params.append(f"%{employee_name.strip()}%")
    query += " ORDER BY citation_count DESC, h_index DESC"
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# -------------------------------------------------------------
# HEMIS Doktorantlar (Doctorate Students)
# -------------------------------------------------------------
def db_save_hemis_doctorate_students(items: List[Dict[str, Any]], clear_existing: bool = False) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    if clear_existing:
        cursor.execute("DELETE FROM hemis_doctorate_students")
    
    rows = []
    for it in items:
        dept = it.get("department") or {}
        spec = it.get("specialty") or {}
        sbranch = it.get("scienceBranch") or {}
        dtype = it.get("doctoralStudentType") or {}
        dstatus = it.get("doctorateStudentStatus") or {}
        
        rows.append((
            it.get("id"),
            it.get("full_name") or "",
            it.get("short_name") or "",
            it.get("student_id_number") or "",
            it.get("dissertation_theme") or "",
            dept.get("name") or "",
            spec.get("code") or "",
            spec.get("name") or "",
            sbranch.get("name") or "",
            dtype.get("name") or "",
            dstatus.get("name") or "",
            it.get("level") or "",
            it.get("image") or ""
        ))
    cursor.executemany("""
        INSERT OR REPLACE INTO hemis_doctorate_students (
            id, full_name, short_name, student_id_number, dissertation_theme,
            department_name, specialty_code, specialty_name, science_branch,
            doctoral_type, doctorate_status, level, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)
    conn.commit()
    count = cursor.rowcount
    conn.close()
    return count

def db_get_hemis_doctorate_students(search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM hemis_doctorate_students WHERE 1=1"
    params = []
    if search and search.strip():
        term = f"%{search.strip()}%"
        query += " AND (full_name LIKE ? OR dissertation_theme LIKE ? OR department_name LIKE ? OR specialty_name LIKE ?)"
        params.extend([term, term, term, term])
    query += " ORDER BY full_name ASC"
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_get_hemis_academic_stats() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM hemis_curriculums")
    c_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM hemis_curriculum_subjects")
    cs_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM hemis_subject_resources")
    res_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM hemis_subject_teachers")
    st_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM hemis_scientific_activity")
    sa_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM hemis_doctorate_students")
    doc_count = cursor.fetchone()[0]
    conn.close()
    return {
        "curriculums_count": c_count,
        "curriculum_subjects_count": cs_count,
        "subject_resources_count": res_count,
        "subject_teachers_count": st_count,
        "scientific_activities_count": sa_count,
        "doctorate_students_count": doc_count
    }

# =============================================================
# BILDIRISHNOMALAR (NOTIFICATIONS ENGINE) METODLARI
# =============================================================

def db_create_notification(data: Dict[str, Any]) -> int:
    """Yangi bildirishnoma yaratish va saqlash"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO notifications (
            recipient_role, recipient_username, recipient_id,
            department, faculty, sender_name, sender_role,
            title, message, type, link_tab, item_id, is_read
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    """, (
        data.get("recipient_role"),
        data.get("recipient_username"),
        data.get("recipient_id"),
        data.get("department"),
        data.get("faculty"),
        data.get("sender_name", "Tizim"),
        data.get("sender_role", "SYSTEM"),
        data.get("title", ""),
        data.get("message", ""),
        data.get("type", "SYSTEM"),
        data.get("link_tab"),
        str(data.get("item_id", "")) if data.get("item_id") is not None else None
    ))
    notif_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return notif_id

def db_get_notifications(
    username: Optional[str] = None,
    role: Optional[str] = None,
    roles: Optional[List[str]] = None,
    department: Optional[str] = None,
    faculty: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """
    Foydalanuvchining shaxsiyati, faol rollari, kafedrasi yoki fakultetiga
    tegishli barcha bildirishnomalarni va o'qilmaganlar sonini olish.
    """
    conn = get_connection()
    cursor = conn.cursor()

    active_roles = set()
    if role:
        active_roles.add(role.upper())
    if roles:
        for r in roles:
            active_roles.add(r.upper())

    clean_user = (username or "").strip().lower()
    clean_dept = (department or "").strip().lower()
    clean_fac = (faculty or "").strip().lower()

    # Barcha so'nggi 200 ta bildirishnomalarni olib, moslik bo'yicha saralash
    cursor.execute("SELECT * FROM notifications ORDER BY created_at DESC, id DESC LIMIT 200")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    matched = []
    unread_count = 0

    for item in rows:
        r_user = (item.get("recipient_username") or "").strip().lower()
        r_role = (item.get("recipient_role") or "").strip().upper()
        r_dept = (item.get("department") or "").strip().lower()
        r_fac = (item.get("faculty") or "").strip().lower()

        is_for_me = False

        # 1. Bevosita shu foydalanuvchiga yuborilgan
        if r_user and clean_user and r_user == clean_user:
            is_for_me = True
        # 2. Barchaga yuborilgan
        elif r_role == "ALL":
            is_for_me = True
        # 3. Rol va bo'lim mosligi
        elif r_role in active_roles:
            dept_matches = not r_dept or (clean_dept and (r_dept in clean_dept or clean_dept in r_dept))
            fac_matches = not r_fac or (clean_fac and (r_fac in clean_fac or clean_fac in r_fac))

            if r_role in ["ADMIN", "RECTORATE"]:
                is_for_me = True  # Rahbariyat va adminga filial bo'yicha hamma tegishli
            elif r_role == "DEAN" and fac_matches:
                is_for_me = True
            elif r_role == "HEAD_OF_DEPT" and dept_matches:
                is_for_me = True
            elif r_role == "TEACHER" and (not r_user or r_user == clean_user):
                is_for_me = True

        if is_for_me:
            matched.append(item)
            if not item.get("is_read"):
                unread_count += 1

    limited_items = matched[:limit]
    return {
        "items": limited_items,
        "total_count": len(matched),
        "unread_count": unread_count
    }

def db_mark_notification_read(notification_id: int) -> bool:
    """Bitta bildirishnomani o'qilgan deb belgilash"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ?", (notification_id,))
    conn.commit()
    conn.close()
    return True

def db_mark_all_notifications_read(
    username: Optional[str] = None,
    role: Optional[str] = None,
    roles: Optional[List[str]] = None,
    department: Optional[str] = None,
    faculty: Optional[str] = None
) -> bool:
    """Foydalanuvchiga tegishli barcha bildirishnomalarni o'qilgan holatga o'tkazish"""
    res = db_get_notifications(username=username, role=role, roles=roles, department=department, faculty=faculty, limit=200)
    ids = [item["id"] for item in res.get("items", []) if not item.get("is_read")]
    if ids:
        conn = get_connection()
        cursor = conn.cursor()
        placeholders = ",".join("?" for _ in ids)
        cursor.execute(f"UPDATE notifications SET is_read = 1 WHERE id IN ({placeholders})", ids)
        conn.commit()
        conn.close()
    return True

def db_log_audit(
    username: str,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    user_name: Optional[str] = None,
    user_role: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None
) -> int:
    """Tizim harakatlari va xavfsizlik amallarini o'zgarmas jurnalga qayd qilish (Immutable Audit Log)"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO system_audit_trail (username, user_name, user_role, action, entity_type, entity_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (username, user_name or "", user_role or "", action, entity_type, str(entity_id or ""), details or "", ip_address or ""))
        conn.commit()
        log_id = cursor.lastrowid
        conn.close()
        return log_id
    except Exception as e:
        print(f"[AUDIT LOG ERROR] {e}")
        return 0

def db_get_audit_logs(limit: int = 100, offset: int = 0, action: Optional[str] = None, username: Optional[str] = None) -> List[Dict[str, Any]]:
    """Tizim auditi jurnali yozuvlarini olish"""
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM system_audit_trail"
    params = []
    conditions = []
    if action:
        conditions.append("action = ?")
        params.append(action)
    if username:
        conditions.append("username = ?")
        params.append(username)
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# Bazani ishga tushirish
init_db()
