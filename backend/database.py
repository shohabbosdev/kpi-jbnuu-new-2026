"""
O'zMU JBNUU KPI Tizimi - SQLite relyatsion ma'lumotlar bazasi boshqaruvi.
Server qayta yuklanganda ham barcha o'zgarishlar, arizalar va parollar saqlanadi.
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN image TEXT;")
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
        users[d["username"]] = d
    return users

def db_save_user(username: str, data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (username, id, password, name, role, department, faculty, position, degree, fte, employee_id_number, must_change_password, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            image = excluded.image
    """, (
        username,
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
        data.get("image")
    ))
    conn.commit()
    conn.close()

def db_update_password(username: str, new_password: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password = ?, must_change_password = 0 WHERE username = ?", (new_password, username))
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
            status = excluded.status,
            ball = excluded.ball,
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

# Bazani ishga tushirish
init_db()
