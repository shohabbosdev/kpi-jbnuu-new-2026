"""
O'zMU JBNUU KPI Tizimi - SQLite relyatsion ma'lumotlar bazasi boshqaruvi.
Server qayta yuklanganda ham barcha o'zgarishlar, arizalar, sozlamalar va parollar to'liq saqlanadi.
"""

import sqlite3
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "kpi_system.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

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
    
    conn.commit()
    conn.close()

# Foydalanuvchilar amallari
def db_load_users() -> Dict[str, Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    conn.close()
    users = {}
    for r in rows:
        d = dict(r)
        d["must_change_password"] = bool(d.get("must_change_password", 0))
        d["is_active"] = bool(d.get("is_active", 1))
        users[d["username"].lower()] = d
    return users

def db_get_user(username: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(username) = LOWER(?)", (username.strip(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["must_change_password"] = bool(d.get("must_change_password", 0))
    d["is_active"] = bool(d.get("is_active", 1))
    return d

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

def db_update_user_role(username: str, new_role: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET role = ? WHERE LOWER(username) = LOWER(?)", (new_role.upper(), username.strip()))
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

def db_save_submission(data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
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
        data.get("id"),
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
    cursor.execute("SELECT * FROM indicators ORDER BY CAST(SUBSTR(id, 1, INSTR(id || '.', '.') - 1) AS INTEGER), id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def db_save_indicator(data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO indicators (id, block, name, max_ball, validity, dept)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            block = excluded.block,
            name = excluded.name,
            max_ball = excluded.max_ball,
            validity = excluded.validity,
            dept = excluded.dept
    """, (
        data.get("id"),
        data.get("block"),
        data.get("name"),
        data.get("max_ball"),
        data.get("validity"),
        data.get("dept")
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

# Bazani ishga tushirish
init_db()
