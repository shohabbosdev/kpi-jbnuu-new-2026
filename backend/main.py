import os
import io
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
import uuid
import shutil
from pydantic import BaseModel
import requests
from dotenv import load_dotenv

# .env faylini yuklash
load_dotenv()
HEMIS_BASE_URL = os.getenv("HEMIS_BASE_URL", "https://student.jbnuu.uz/rest/v1")
HEMIS_API_TOKEN = os.getenv("HEMIS_API_TOKEN", "Qn8Jp7TVvpGdQUvWoqpBC1i0p7ukHKT0")

from database import (
    db_load_users, db_get_user, db_save_user, db_update_password,
    db_reset_user_password, db_update_user_role, db_toggle_user_status,
    db_load_submissions, db_save_submission, db_delete_submission,
    db_save_audit_log, db_load_audit_logs,
    db_load_settings, db_save_settings,
    db_load_indicators, db_save_indicator,
    db_load_appeals, db_save_appeal, db_review_appeal,
    db_load_evaluators, db_add_evaluator, db_delete_evaluator
)


app = FastAPI(
    title="OʻzMU Jizzax Filiali KPI Axborot Tizimi API",
    description="Professor-oʻqituvchilar faoliyatini baholash va ragʻbatlantirish tizimi backend xizmati",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# XAVFSIZLIK VA BRUTE-FORCE RATE LIMITING
# ==========================================
MAX_FAILED_PER_ACCOUNT = 5          # 1 ta hisobga 5 ta xato urinishdan so'ng hisob 15 daqiqaga bloklanadi
MAX_FAILED_PER_IP = 20             # 1 ta IP dan 20 ta umumiy xato urinishdan so'ng IP bloklanadi
LOCKOUT_DURATION_MINUTES = 15      # Bloklanish vaqti (daqiqa)
ATTEMPT_WINDOW_MINUTES = 10        # 10 daqiqa ichidagi xatolar hisobga olinadi

# In-memory tracking: { "ip:X.X.X.X": {...}, "user:username": {...} }
FAILED_LOGIN_TRACKER: Dict[str, Dict[str, Any]] = {}

def get_client_ip(request: Request) -> str:
    """Klientning real IP manzilini xavfsiz aniqlash"""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"

def check_login_rate_limit(ip: str, username: str):
    """
    IP yoki hisob bo'yicha bloklanganlik holatini tekshirish.
    Agar bloklangan bo'lsa HTTP 429 xatosi qaytaradi.
    """
    now = datetime.now()
    
    # 1. IP bo'yicha umumiy blok tekshiruvi (IP-level DDoS/Brute-force)
    ip_rec = FAILED_LOGIN_TRACKER.get(f"ip:{ip}")
    if ip_rec and ip_rec.get("locked_until"):
        if now < ip_rec["locked_until"]:
            rem_sec = int((ip_rec["locked_until"] - now).total_seconds())
            rem_min = max(1, (rem_sec + 59) // 60)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Xavfsizlik tizimi: Ushbu IP manzildan juda koʻp muvaffaqiyatsiz urinishlar aniqlandi! IP 15 daqiqaga cheklandi. Qolgan vaqt: {rem_min} daqiqa."
            )
        else:
            FAILED_LOGIN_TRACKER.pop(f"ip:{ip}", None)

    # 2. Aniq foydalanuvchi hisobi bo'yicha blok tekshiruvi (Account Lockout)
    user_rec = FAILED_LOGIN_TRACKER.get(f"user:{username}")
    if user_rec and user_rec.get("locked_until"):
        if now < user_rec["locked_until"]:
            rem_sec = int((user_rec["locked_until"] - now).total_seconds())
            rem_min = max(1, (rem_sec + 59) // 60)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Xavfsizlik tizimi: '{username}' hisobiga ketma-ket xato parollar kiritilgani sababli ushbu hisob 15 daqiqaga bloklangan! Qolgan vaqt: {rem_min} daqiqa."
            )
        else:
            FAILED_LOGIN_TRACKER.pop(f"user:{username}", None)

def record_failed_login(ip: str, username: str) -> Dict[str, int]:
    """
    Muvaffaqiyatsiz urinishni qayd etish.
    User va IP bo'yicha urinishlar sonini qaytaradi.
    """
    now = datetime.now()

    # User tracker
    user_key = f"user:{username}"
    u_rec = FAILED_LOGIN_TRACKER.get(user_key)
    if not u_rec or (now - u_rec["last_attempt"]).total_seconds() > ATTEMPT_WINDOW_MINUTES * 60:
        FAILED_LOGIN_TRACKER[user_key] = {"count": 1, "last_attempt": now, "locked_until": None}
        user_count = 1
    else:
        u_rec["count"] += 1
        u_rec["last_attempt"] = now
        user_count = u_rec["count"]

    if user_count >= MAX_FAILED_PER_ACCOUNT:
        FAILED_LOGIN_TRACKER[user_key]["locked_until"] = now + timedelta(minutes=LOCKOUT_DURATION_MINUTES)

    # IP tracker
    ip_key = f"ip:{ip}"
    ip_rec = FAILED_LOGIN_TRACKER.get(ip_key)
    if not ip_rec or (now - ip_rec["last_attempt"]).total_seconds() > ATTEMPT_WINDOW_MINUTES * 60:
        FAILED_LOGIN_TRACKER[ip_key] = {"count": 1, "last_attempt": now, "locked_until": None}
        ip_count = 1
    else:
        ip_rec["count"] += 1
        ip_rec["last_attempt"] = now
        ip_count = ip_rec["count"]

    if ip_count >= MAX_FAILED_PER_IP:
        FAILED_LOGIN_TRACKER[ip_key]["locked_until"] = now + timedelta(minutes=LOCKOUT_DURATION_MINUTES)

    return {"user_count": user_count, "ip_count": ip_count}

def reset_failed_login(ip: str, username: str):
    """Muvaffaqiyatli kirilganda hisoblagichlarni tozalash"""
    FAILED_LOGIN_TRACKER.pop(f"user:{username}", None)

# ==========================================
# MODELLAR (PYDANTIC SCHEMAS)
# ==========================================

class LoginRequest(BaseModel):
    username: str
    password: str

class ChangePasswordRequest(BaseModel):
    username: str
    current_password: str
    new_password: str
    confirm_password: str

class UserProfile(BaseModel):
    id: int
    username: str
    name: str
    role: str  # 'ADMIN' | 'HEAD_OF_DEPT' | 'TEACHER' | 'RECTORATE'
    department: Optional[str] = None
    faculty: Optional[str] = None
    position: Optional[str] = None
    degree: Optional[str] = None
    fte: float = 1.0
    employee_id_number: Optional[str] = None
    image: Optional[str] = None
    must_change_password: bool = False

class LoginResponse(BaseModel):
    success: bool
    access_token: str
    user: UserProfile

class Indicator(BaseModel):
    id: str
    block: str
    name: str
    max_ball: float
    validity: str
    dept: str
    is_active: bool = True
    description: Optional[str] = None

class IndicatorCreate(BaseModel):
    id: str
    block: str
    name: str
    max_ball: float
    validity: str
    dept: str
    description: Optional[str] = None
    is_active: bool = True

class IndicatorUpdate(BaseModel):
    name: Optional[str] = None
    block: Optional[str] = None
    max_ball: Optional[float] = None
    validity: Optional[str] = None
    dept: Optional[str] = None
    is_active: Optional[bool] = None

class AdminUserCreate(BaseModel):
    username: str
    name: str
    role: str
    department: Optional[str] = "Kafedra koʻrsatilmagan"
    position: Optional[str] = "Oʻqituvchi"
    fte: float = 1.0
    password: Optional[str] = None

class AdminUserRoleUpdate(BaseModel):
    role: str

class TeacherScoreDetail(BaseModel):
    oqv: float
    ilm: float
    xal: float
    man: float
    jarima: float
    flex_applied: float
    raw_total: float
    fte: float
    normalized_score: float
    svetafor_zone: str
    svetafor_label: str
    bonus_label: str

class Teacher(BaseModel):
    id: int
    name: str
    faculty: str
    department: str
    position: str
    degree: str
    fte: float
    track: str
    is_first_year: bool
    is_head_of_dept: bool
    image: Optional[str] = None
    scores: TeacherScoreDetail

class SubmissionCreate(BaseModel):
    teacher_id: int
    indicator_id: str
    title: str
    doi: Optional[str] = None
    authors_count: int = 1
    submitted_date: str
    file_name: str
    claimed_ball: Optional[float] = None
    description: Optional[str] = None

class SubmissionUpdate(BaseModel):
    indicator_id: Optional[str] = None
    title: Optional[str] = None
    doi: Optional[str] = None
    authors_count: Optional[int] = None
    claimed_ball: Optional[float] = None
    file_name: Optional[str] = None
    description: Optional[str] = None

class Submission(BaseModel):
    id: int
    teacher_id: int
    teacher_name: str
    indicator_id: str
    title: str
    doi: Optional[str] = None
    authors_count: int
    submitted_date: str
    status: str
    claimed_ball: float
    ball: float
    file_name: str
    dept: str
    description: Optional[str] = None
    reviewer_name: Optional[str] = None
    reviewed_date: Optional[str] = None
    reviewer_comment: Optional[str] = None
    rejection_reason: Optional[str] = None

class VerificationAction(BaseModel):
    reviewer_id: int
    reviewer_name: str
    status: str  # 'approved' | 'rejected'
    score: Optional[float] = None  # Tekshiruvchi qo'lda qo'ygan ball
    rejection_reason: Optional[str] = None  # Rad etilganda majburiy sabab
    comment: Optional[str] = None

class AppealCreate(BaseModel):
    submission_id: Optional[int] = None
    teacher_id: int
    teacher_name: str
    indicator_id: str
    title: Optional[str] = None
    claimed_ball: Optional[float] = 0.0
    reviewed_ball: Optional[float] = 0.0
    initial_reviewer: Optional[str] = None
    initial_rejection_reason: Optional[str] = None
    reason: str
    evidence_file: Optional[str] = None
    file_name: Optional[str] = None

class AppealReviewRequest(BaseModel):
    status: str  # 'ACCEPTED', 'PARTIALLY_ACCEPTED', 'REJECTED'
    commission_member: Optional[str] = "Apellyatsiya Komissiyasi"
    commission_comment: str
    awarded_ball: Optional[float] = 0.0

class Appeal(BaseModel):
    id: str
    submission_id: Optional[int] = None
    teacher_id: int
    teacher_name: str
    indicator_id: str
    title: Optional[str] = None
    claimed_ball: Optional[float] = 0.0
    reviewed_ball: Optional[float] = 0.0
    initial_reviewer: Optional[str] = None
    initial_rejection_reason: Optional[str] = None
    appeal_reason: Optional[str] = None
    reason: Optional[str] = None
    evidence_file: Optional[str] = None
    submitted_date: Optional[str] = None
    status: str
    decision: Optional[str] = None
    commission_member: Optional[str] = None
    commission_comment: Optional[str] = None
    decision_date: Optional[str] = None
    awarded_ball: Optional[float] = 0.0
    created_at: Optional[str] = None

class EvaluatorCreate(BaseModel):
    user_id: Optional[int] = None
    username: str
    name: str
    assigned_category: str
    role_type: Optional[str] = "EXPERT"
    deadline_date: Optional[str] = None
    is_active: Optional[bool] = True
    assigned_by: Optional[str] = "ADMIN"

class Evaluator(BaseModel):
    id: int
    user_id: Optional[int] = None
    username: str
    name: str
    assigned_category: str
    role_type: str = "EXPERT"
    deadline_date: Optional[str] = None
    is_active: bool = True
    assigned_by: Optional[str] = None
    created_at: Optional[str] = None

class DoiLookupRequest(BaseModel):
    doi: str

class SystemSettings(BaseModel):
    academic_year: str
    submissions_open: bool
    deadline_date: str
    submission_deadline: Optional[str] = "2026-06-15"
    review_deadline: Optional[str] = "2026-06-25"
    appeal_deadline: Optional[str] = "2026-07-05"
    current_stage: Optional[str] = "ALL_OPEN"
    budget_cap_monthly: float

class EvaluationPeriodUpdate(BaseModel):
    academic_year: Optional[str] = None
    submissions_open: Optional[bool] = None
    deadline_date: Optional[str] = None
    submission_deadline: Optional[str] = None
    review_deadline: Optional[str] = None
    appeal_deadline: Optional[str] = None
    current_stage: Optional[str] = None
    budget_cap_monthly: Optional[float] = None

# ==========================================
# FOYDALANUVCHILAR VA XAVFSIZLIK BAZASI
# ==========================================

USERS_DB: Dict[str, Dict[str, Any]] = {
    "admin": {
        "id": 999,
        "password": "admin",
        "name": "Tizim Administratori",
        "role": "ADMIN",
        "department": "Raqamli taʼlim texnologiyalari markazi",
        "faculty": "Filial maʼmuriyati",
        "position": "Bosh administrator",
        "degree": "Texnika fanlari nomzodi",
        "fte": 1.0
    }
}

SYSTEM_SETTINGS = SystemSettings(
    academic_year="2025/2026-oʻquv yili",
    submissions_open=True,
    deadline_date="2026-05-30",
    budget_cap_monthly=150000000.0  # 150 mln so'm
)

AUDIT_LOGS = [
    {"id": 1, "time": "2026-10-01 19:30", "user": "admin", "action": "Tizim sozlamalari yangilandi"},
    {"id": 2, "time": "2026-10-01 19:45", "user": "mudir", "action": "Sobirova Nilufar arizasini koʻrib chiqdi"},
    {"id": 3, "time": "2026-10-01 20:10", "user": "oqituvchi", "action": "Yangi Scopus Q1 maqolasini yukladi"}
]

INDICATORS_DB: List[Indicator] = [
    Indicator(id="1.1", block="oqv", name="Nashr etilgan darslik (vazirlik yoki OTM grifi, ISBN raqami bilan)", max_ball=6.0, validity="2 yil", dept="Oʻquv-uslubiy boshqarma"),
    Indicator(id="1.2", block="oqv", name="Nashr etilgan oʻquv qoʻllanma (ISBN raqami bilan)", max_ball=4.0, validity="1 yil", dept="Oʻquv-uslubiy boshqarma"),
    Indicator(id="1.3", block="oqv", name="TOP-300 xorijiy OTM adabiyotlarini oʻzga tillardan tarjima qilganlik", max_ball=6.0, validity="2 yil", dept="Oʻquv boshqarma, Xalqaro boʻlim"),
    Indicator(id="1.4", block="oqv", name="Videodars va virtual laboratoriya ishlab chiqqanlik (Jalingo studiyasi)", max_ball=3.0, validity="1 yil", dept="Raqamli taʼlim texnologiyalari markazi"),
    Indicator(id="1.5", block="oqv", name="HEMIS axborot tizimiga sifatli oʻquv kontentlarini toʻliq yuklaganlik", max_ball=2.0, validity="1 yil", dept="Oʻquv-uslubiy boshqarma"),
    Indicator(id="1.6", block="oqv", name="TOP-300 dasturi asosida yangi fan dasturi va sillabus ishlab chiqqanlik", max_ball=3.0, validity="1 yil", dept="Oʻquv-uslubiy boshqarma"),
    Indicator(id="1.7", block="oqv", name="Namunali ochiq dars mashgʻulotlarini oʻtkazganlik", max_ball=1.0, validity="1 yil", dept="Taʼlim sifatini nazorat qilish boʻlimi"),
    Indicator(id="1.8", block="oqv", name="Respublika tarmoq markazlarida malaka oshirganlik (144 soat)", max_ball=2.0, validity="3 yil", dept="Oʻquv-uslubiy boshqarma"),
    Indicator(id="1.9", block="oqv", name="Talabalar va hamkasblar oʻrtasidagi soʻrovnoma natijalari", max_ball=4.0, validity="1 yil", dept="Taʼlim sifatini nazorat qilish boʻlimi"),
    Indicator(id="1.10", block="oqv", name="HEMIS tizimida talabalar davomatini kunlik namunali yuritganlik", max_ball=2.0, validity="1 yil", dept="Oʻquv boʻlimi"),

    Indicator(id="2.1", block="ilm", name="Falsafa doktori (PhD) yoki fan doktori (DSc) ilmiy darajasi mavjudligi", max_ball=3.0, validity="Doimiy", dept="Ilmiy boʻlim, Kadrlar boʻlimi"),
    Indicator(id="2.2", block="ilm", name="Ilmiy rahbarligida PhD yoki maslahatchiligida DSc kadr tayyorlaganlik", max_ball=3.0, validity="1 yil", dept="Ilmiy-tadqiqotlar boʻlimi"),
    Indicator(id="2.3", block="ilm", name="Scopus va Web of Science (Q1, Q2 kvartildagi jurnallarda maqola)", max_ball=8.0, validity="1 yil", dept="Ilmiy-tadqiqotlar boʻlimi"),
    Indicator(id="2.4", block="ilm", name="Scopus va Web of Science (Q3, Q4 kvartildagi jurnallarda maqola)", max_ball=6.0, validity="1 yil", dept="Ilmiy-tadqiqotlar boʻlimi"),
    Indicator(id="2.5", block="ilm", name="Scopus/WoS indeksatsiyalangan xalqaro konferensiyalarda maqola nashri", max_ball=4.0, validity="1 yil", dept="Ilmiy-tadqiqotlar boʻlimi"),
    Indicator(id="2.6", block="ilm", name="Scopus va Web of Science bazalaridagi Xirsh indeksi (h-index)", max_ball=5.0, validity="1 yil", dept="Ilmiy-tadqiqotlar boʻlimi"),
    Indicator(id="2.7", block="ilm", name="OAK roʻyxatidagi xorijiy va mahalliy ilmiy jurnallarda maqola chop etish", max_ball=4.0, validity="1 yil", dept="Ilmiy-tadqiqotlar boʻlimi"),
    Indicator(id="2.8", block="ilm", name="Monografiya yozganlik va lugʻat tuzganlik (ISBN raqami bilan)", max_ball=4.0, validity="1 yil", dept="Ilmiy-tadqiqotlar boʻlimi"),
    Indicator(id="2.9", block="ilm", name="Ilmiy-tadqiqot samaradorligi: patent (ixtiro, sanoat namunasi)", max_ball=5.0, validity="1 yil", dept="Tijoratlashtirish boʻlimi"),
    Indicator(id="2.10", block="ilm", name="Dasturiy vositalar uchun mualliflik guvohnomasi (DGU) olish", max_ball=3.0, validity="1 yil", dept="Tijoratlashtirish boʻlimi"),
    Indicator(id="2.11", block="ilm", name="Sohalar buyurtmalari (xoʻjalik shartnomalari) asosida tushgan mablagʻ", max_ball=6.0, validity="1 yil", dept="Tijoratlashtirish boʻlimi"),
    Indicator(id="2.12", block="ilm", name="Davlat ilmiy-texnika dasturlari va grantlariga rahbarlik qilish", max_ball=8.0, validity="Loyiha muddati", dept="Ilmiy boʻlim, Tijoratlashtirish"),

    Indicator(id="3.1", block="xal", name="TOP-1000 xorijiy OTMlarda oʻquv mashgʻulotlari (maʼruzalar) oʻtkazganlik", max_ball=4.0, validity="1 yil", dept="Xalqaro hamkorlik boʻlimi"),
    Indicator(id="3.2", block="xal", name="Xalqaro ilmiy loyihalarda (Erasmus+, Horizon, KOICA) rahbarlik yoki aʼzolik", max_ball=4.0, validity="Loyiha muddati", dept="Xalqaro hamkorlik boʻlimi"),
    Indicator(id="3.3", block="xal", name="Xorijiy tilni bilish boʻyicha xalqaro sertifikat (IELTS, TOEFL, CEFR B2/C1)", max_ball=3.0, validity="Sertifikat muddati", dept="Xalqaro hamkorlik boʻlimi"),
    Indicator(id="3.4", block="xal", name="Mutaxassislik fanlarini toʻliq chet tilida oʻqitish", max_ball=2.0, validity="6 oy", dept="Oʻquv boshqarma, Xalqaro boʻlim"),
    Indicator(id="3.5", block="xal", name="Xorijiy nufuzli OTMda malaka oshirish yoki stajirovka oʻtaganlik", max_ball=4.0, validity="1 yil", dept="Xalqaro hamkorlik boʻlimi"),
    Indicator(id="3.6", block="xal", name="Xorijiy investitsiya va grant mablagʻlarini filial hisobiga jalb etganlik", max_ball=3.0, validity="1 yil", dept="Xalqaro boʻlim, Buxgalteriya"),
    Indicator(id="3.7", block="xal", name="Taʼlim eksportini amalga oshirganlik (xorijiy fuqarolarni jalb qilish)", max_ball=2.0, validity="1 yil", dept="Xalqaro hamkorlik boʻlimi"),

    Indicator(id="4.1", block="man", name="Bitiruvchi shogirdlarni mutaxassisligi boʻyicha ishga joylashtirish (YAMMT)", max_ball=4.0, validity="1 yil", dept="Marketing va bandlik boʻlimi"),
    Indicator(id="4.2", block="man", name="Korxonalar bilan bitiruvchilarni ishga olish boʻyicha 3 tomonlama shartnomalar", max_ball=2.0, validity="1 yil", dept="Marketing va bandlik boʻlimi"),
    Indicator(id="4.3", block="man", name="Ijtimoiy, maʼnaviy va maʼrifiy tadbirlarni namunali tashkil etganlik", max_ball=2.0, validity="1 yil", dept="Yoshlar bilan ishlash boʻlimi"),
    Indicator(id="4.4", block="man", name="Talabalar oʻrtasida doimiy ishlovchi fan va ijodiy toʻgaraklar rahbarligi", max_ball=2.0, validity="1 yil", dept="Yoshlar bilan ishlash boʻlimi"),
    Indicator(id="4.5", block="man", name="Akademik guruh murabbiyi sifatida talabalar davomatini (90%+) taʼminlash", max_ball=2.0, validity="1 yil", dept="Yoshlar bilan ishlash boʻlimi"),
    Indicator(id="4.6", block="man", name="Markaziy ommaviy axborot vositalarida tahliliy maqolalar bilan chiqish qilish", max_ball=1.0, validity="1 yil", dept="Matbuot xizmati"),
]

def calculate_kpi(raw_oqv: float, raw_ilm: float, raw_xal: float, raw_man: float, jarima: float, fte: float, is_first_year: bool) -> TeacherScoreDetail:
    oqv = min(raw_oqv, 30.0)
    xal = min(raw_xal, 20.0)
    
    flex_applied = 0.0
    if raw_ilm > 40.0:
        flex_surplus = raw_ilm - 40.0
        ilm = 40.0
        needed = 10.0 - raw_man
        if needed > 0:
            flex_applied = min(needed, flex_surplus)
            effective_man = min(10.0, raw_man + flex_applied)
        else:
            effective_man = min(10.0, raw_man)
    else:
        ilm = min(raw_ilm, 40.0)
        effective_man = min(10.0, raw_man)

    raw_total = oqv + ilm + xal + effective_man + jarima
    normalized = round((raw_total / fte) * 10) / 10

    if normalized >= 71.0:
        zone = "green"
        label = "Yashil toifa (Yuqori koʻrsatkich)"
        bonus = "100 foiz oylik ustama" if normalized >= 86.0 else "70 foiz oylik ustama"
    elif normalized >= 56.0 or (is_first_year and normalized >= 45.0):
        zone = "yellow"
        label = "Sariq toifa (Qoniqarli)"
        bonus = "40 foiz oylik ustama"
    elif normalized >= 40.0:
        zone = "yellow"
        label = "Sariq toifa (Chegaraviy holat)"
        bonus = "Bir martalik ragʻbatlantirish"
    else:
        zone = "red"
        label = "Qizil toifa (Qoniqarsiz)"
        bonus = "Ustama belgilanmaydi"

    return TeacherScoreDetail(
        oqv=oqv, ilm=ilm, xal=xal, man=effective_man,
        jarima=jarima, flex_applied=flex_applied, raw_total=raw_total,
        fte=fte, normalized_score=normalized, svetafor_zone=zone,
        svetafor_label=label, bonus_label=bonus
    )

RAW_TEACHERS = [
    {
        "id": 1,
        "name": "Dots. Sharipova Sadoqat Fazliddinovna",
        "faculty": "Amaliy matematika fakulteti",
        "department": "Amaliy matematika",
        "position": "Kafedra mudiri, dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.50,
        "track": "Tadqiqotchi",
        "is_first_year": False,
        "is_head_of_dept": True,
        "oqv": 38.0, "ilm": 62.0, "xal": 25.0, "man": 15.0, "jarima": 0.0
    },
    {
        "id": 2,
        "name": "Dots. Hafizov Erkin Alimboy oʻgʻli",
        "faculty": "Amaliy matematika fakulteti",
        "department": "Axborot tizimlari va texnologiyalari",
        "position": "Dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.50,
        "track": "Tadqiqotchi",
        "is_first_year": False,
        "is_head_of_dept": False,
        "oqv": 35.0, "ilm": 55.0, "xal": 22.0, "man": 12.0, "jarima": 0.0
    },
    {
        "id": 3,
        "name": "Dots. Kuvandikov Joʻra Tursunbayevich",
        "faculty": "Amaliy matematika fakulteti",
        "department": "Kompyuter ilmlari va dasturlashtirish",
        "position": "Kafedra mudiri, dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.50,
        "track": "Tadqiqotchi",
        "is_first_year": False,
        "is_head_of_dept": True,
        "oqv": 40.0, "ilm": 50.0, "xal": 20.0, "man": 14.0, "jarima": 0.0
    },
    {
        "id": 4,
        "name": "Dots. Alimov Salohiddin Hikmat oʻgʻli",
        "faculty": "Amaliy matematika fakulteti",
        "department": "Amaliy matematika",
        "position": "Dekan muovini, dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.50,
        "track": "Tadqiqotchi",
        "is_first_year": False,
        "is_head_of_dept": False,
        "oqv": 36.0, "ilm": 58.0, "xal": 24.0, "man": 12.0, "jarima": 0.0
    },
    {
        "id": 5,
        "name": "Dots. Butayev Ruslan Buriboyevich",
        "faculty": "Amaliy matematika fakulteti",
        "department": "Amaliy matematika",
        "position": "Dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.0,
        "track": "Tadqiqotchi",
        "is_first_year": False,
        "is_head_of_dept": False,
        "oqv": 28.0, "ilm": 42.0, "xal": 16.0, "man": 10.0, "jarima": 0.0
    },
    {
        "id": 6,
        "name": "Abdullayev Sardor Ikrom oʻgʻli",
        "faculty": "Amaliy matematika fakulteti",
        "department": "Kompyuter ilmlari va dasturlashtirish",
        "position": "Assistent",
        "degree": "Magistr",
        "fte": 0.50,
        "track": "Pedagog-metodist",
        "is_first_year": True,
        "is_head_of_dept": False,
        "oqv": 16.0, "ilm": 6.0, "xal": 4.0, "man": 5.0, "jarima": 0.0
    },
    {
        "id": 7,
        "name": "Dots. Aliqulov Saloxiddin Turdimuratovich",
        "faculty": "Psixologiya fakulteti",
        "department": "Psixologiya kafedrasi",
        "position": "Fakultet dekani, dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.25,
        "track": "Tadqiqotchi",
        "is_first_year": False,
        "is_head_of_dept": False,
        "oqv": 32.0, "ilm": 48.0, "xal": 18.0, "man": 12.0, "jarima": 0.0
    },
    {
        "id": 8,
        "name": "Dots. Nasirov Bunyod Uralovich",
        "faculty": "Psixologiya fakulteti",
        "department": "O'zbek tili va ijtimoiy fanlar kafedrasi",
        "position": "Kafedra mudiri, dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.50,
        "track": "Pedagog-metodist",
        "is_first_year": False,
        "is_head_of_dept": True,
        "oqv": 36.0, "ilm": 44.0, "xal": 16.0, "man": 14.0, "jarima": 0.0
    },
    {
        "id": 9,
        "name": "Prof. Soy Marina Petrovna",
        "faculty": "Psixologiya fakulteti",
        "department": "Iqtisodiyot va turizm",
        "position": "Kafedra mudiri, professor",
        "degree": "Fan doktori (DSc)",
        "fte": 1.50,
        "track": "Tadqiqotchi",
        "is_first_year": False,
        "is_head_of_dept": True,
        "oqv": 38.0, "ilm": 65.0, "xal": 28.0, "man": 15.0, "jarima": 0.0
    },
    {
        "id": 10,
        "name": "Joʻrayev Muxammadraximxon Murod oʻgʻli",
        "faculty": "Psixologiya fakulteti",
        "department": "Xorijiy tillar",
        "position": "Kafedra mudiri, assistent",
        "degree": "Magistr",
        "fte": 1.50,
        "track": "Pedagog-metodist",
        "is_first_year": False,
        "is_head_of_dept": True,
        "oqv": 34.0, "ilm": 28.0, "xal": 20.0, "man": 10.0, "jarima": 0.0
    },
    {
        "id": 11,
        "name": "Dots. Umarova Dilfuza Mahmudovna",
        "faculty": "Psixologiya fakulteti",
        "department": "Psixologiya kafedrasi",
        "position": "Dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.0,
        "track": "Pedagog-metodist",
        "is_first_year": False,
        "is_head_of_dept": False,
        "oqv": 27.0, "ilm": 24.0, "xal": 18.0, "man": 8.0, "jarima": 0.0
    },
    {
        "id": 12,
        "name": "Dots. Halimov Oʻktam Haydarovich",
        "faculty": "Sirtqi fakultet",
        "department": "Sirtqi (maxsus sirtqi) boʻlimi",
        "position": "Fakultet dekani, dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.50,
        "track": "Tadqiqotchi",
        "is_first_year": False,
        "is_head_of_dept": False,
        "oqv": 35.0, "ilm": 50.0, "xal": 18.0, "man": 12.0, "jarima": 0.0
    }
]

SUBMISSIONS_DB: List[Submission] = [
    Submission(
        id=101,
        teacher_id=3,
        teacher_name="Sobirova Nilufar Rustamovna",
        indicator_id="1.4",
        title="«Algoritmlarni loyihalash» fani boʻyicha 12 ta videodarslar toʻplami",
        doi=None,
        authors_count=1,
        submitted_date="2026-09-28",
        status="pending",
        claimed_ball=3.0,
        ball=3.0,
        file_name="videodarslar_dalolatnomasi.pdf",
        dept="Raqamli taʼlim texnologiyalari markazi",
        description="Oʻquv portaliga joylashtirilgan 12 ta videodarslik"
    ),
    Submission(
        id=102,
        teacher_id=1,
        teacher_name="Prof. Rahimov Ulugʻbek Shavkatovich",
        indicator_id="2.3",
        title="Expert Systems with Applications (Scopus Q1) jurnalida ilmiy maqola",
        doi="10.1016/j.eswa.2026.123456",
        authors_count=2,
        submitted_date="2026-09-29",
        status="approved",
        claimed_ball=8.0,
        ball=8.0,
        file_name="scopus_q1_maqola_doi_10_1016.pdf",
        dept="Ilmiy-tadqiqotlar boʻlimi",
        reviewer_name="Prof. Alimov K.T. (Dekan)",
        reviewed_date="2026-09-30 11:20",
        reviewer_comment="Scopus va Web of Science bazasida tekshirildi, Q1 toifasiga toʻliq mos."
    ),
    Submission(
        id=103,
        teacher_id=4,
        teacher_name="Abdullayev Sardor Ikrom oʻgʻli",
        indicator_id="3.3",
        title="IELTS 7.0 xalqaro til sertifikati (yosh mutaxassis koeffitsiyenti)",
        doi=None,
        authors_count=1,
        submitted_date="2026-09-30",
        status="pending",
        claimed_ball=3.0,
        ball=3.0,
        file_name="ielts_7_sertifikati.pdf",
        dept="Xalqaro hamkorlik boʻlimi",
        description="British Council tomonidan berilgan rasmiy TRF sertifikati"
    )
]

APPEALS_DB: List[Appeal] = [
    Appeal(
        id="AP-2026-04",
        submission_id=101,
        teacher_id=2,
        teacher_name="Dots. Karimov Jamshid Anvarovich",
        indicator_id="2.3",
        title="Scopus Q2 xalqaro jurnalida maqola",
        claimed_ball=8.0,
        reviewed_ball=0.0,
        initial_reviewer="Kafedra mudiri",
        initial_rejection_reason="Havoladagi kvartil tasdiqnomasi ochilmadi",
        appeal_reason="Kvartil tasdiqnomasi yangilangan havola orqali ilova qilindi",
        reason="Kvartil tasdiqnomasi yangilangan havola orqali ilova qilindi",
        submitted_date="2026-09-29",
        status="Jarayonda",
        decision="Ekspertiza jarayonida (Ilmiy boʻlim)"
    )
]

# SQLite bazasidan apellyatsiyalarni yuklash
db_appeals = db_load_appeals()
if db_appeals:
    APPEALS_DB = [Appeal(**a) for a in db_appeals]
else:
    for a in APPEALS_DB:
        db_save_appeal(a.dict())

# SQLite bazasidan baholovchilarni yuklash
EVALUATORS_DB: List[Evaluator] = []
db_evals = db_load_evaluators()
if db_evals:
    EVALUATORS_DB = [Evaluator(**e) for e in db_evals]
else:
    default_evals = [
        {"user_id": 2, "username": "dots_karimov", "name": "Dots. Karimov Jamshid Anvarovich", "assigned_category": "2. Ilmiy va innovatsion faoliyat", "role_type": "EXPERT", "deadline_date": "2026-06-25"},
        {"user_id": 1, "username": "prof_rahimov", "name": "Prof. Rahimov Ulugʻbek Shavkatovich", "assigned_category": "1. Oʻquv-uslubiy faoliyat", "role_type": "EXPERT", "deadline_date": "2026-06-25"},
        {"user_id": 3, "username": "mudir_ermatov", "name": "Dots. Ermatov Sanjar Qodirovich", "assigned_category": "Dasturiy injiniring kafedrasi", "role_type": "HEAD_OF_DEPT", "deadline_date": "2026-06-25"}
    ]
    for de in default_evals:
        saved = db_add_evaluator(de)
        EVALUATORS_DB.append(Evaluator(**saved))

# SQLite doimiy xotirasidan yuklash va sinxronlash
existing_db_users = db_load_users()
if existing_db_users:
    USERS_DB.update(existing_db_users)
else:
    for u_name, u_data in USERS_DB.items():
        db_save_user(u_name, u_data)

# RAW_TEACHERS dagi o'qituvchilarga USERS_DB dagi rasmlarni bog'lash
for t in RAW_TEACHERS:
    t_name_clean = t.get("name", "").strip().lower().replace("dots.", "").replace("prof.", "").strip()
    for u in USERS_DB.values():
        if not u.get("image"):
            continue
        u_name_clean = u.get("name", "").strip().lower().replace("dots.", "").replace("prof.", "").strip()
        if (
            t.get("employee_id_number") and str(t.get("employee_id_number")) == str(u.get("username"))
            or (t_name_clean and u_name_clean and (t_name_clean == u_name_clean or t_name_clean in u_name_clean or u_name_clean in t_name_clean))
        ):
            t["image"] = u["image"]
            break

DEPT_TO_FACULTY_MAP = {
    "amaliy matematika": "Amaliy matematika fakulteti",
    "kompyuter": "Amaliy matematika fakulteti",
    "axborot tizimlari": "Amaliy matematika fakulteti",
    "biotexnologiya": "Amaliy matematika fakulteti",
    "psixologiya": "Psixologiya fakulteti",
    "oʻzbek tili": "Psixologiya fakulteti",
    "o'zbek tili": "Psixologiya fakulteti",
    "ijtimoiy": "Psixologiya fakulteti",
    "iqtisodiyot": "Psixologiya fakulteti",
    "turizm": "Psixologiya fakulteti",
    "xorijiy tillar": "Psixologiya fakulteti",
    "ingliz": "Psixologiya fakulteti",
    "sirtqi": "Sirtqi fakultet"
}

def resolve_faculty_from_dept(dept_name: Optional[str]) -> str:
    if not dept_name:
        return "Amaliy matematika fakulteti"
    d_clean = dept_name.lower()
    for k, fac in DEPT_TO_FACULTY_MAP.items():
        if k in d_clean:
            return fac
    return "Amaliy matematika fakulteti"

# USERS_DB va RAW_TEACHERS da fakultet nomlarini kafedrasiga muvofiq to'ldirish
for u in USERS_DB.values():
    if not u.get("faculty") or u.get("faculty") in ["Filial fakultetlari", "Filial tuzilmasi", "Fakultet koʻrsatilmagan"]:
        u["faculty"] = resolve_faculty_from_dept(u.get("department"))
        if u.get("username"):
            db_save_user(u["username"].lower(), u)

for t in RAW_TEACHERS:
    if not t.get("faculty") or t.get("faculty") in ["Filial fakultetlari", "Filial tuzilmasi"]:
        t["faculty"] = resolve_faculty_from_dept(t.get("department"))



existing_db_submissions = db_load_submissions()
if existing_db_submissions:
    SUBMISSIONS_DB = [Submission(**s) for s in existing_db_submissions]
else:
    for s in SUBMISSIONS_DB:
        db_save_submission(s.dict())

# System Settings doimiy saqlash
existing_settings = db_load_settings()
if existing_settings:
    SYSTEM_SETTINGS = SystemSettings(**existing_settings)
else:
    db_save_settings(SYSTEM_SETTINGS.dict())

# Indicators doimiy saqlash
existing_indicators = db_load_indicators()
if existing_indicators and len(existing_indicators) >= 40:
    INDICATORS_DB = [Indicator(**i) for i in existing_indicators]
else:
    for ind in INDICATORS_DB:
        db_save_indicator(ind.dict())

# Barcha doimiy foydalanuvchilarni SQLite bazasidan yuklab olish
db_saved_users = db_load_users()
if db_saved_users:
    USERS_DB.update(db_saved_users)

# ==========================================
# REST API ENDPOINTS
# ==========================================

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".zip", ".rar", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE_MB = 15

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    KPI daliliy hujjatlarini xavfsiz qabul qilish va diskka saqlash.
    Maksimal hajm: 15 MB. Ruxsat etilgan formatlar: PDF, DOCX, ZIP, PNG, JPG.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Faqat quyidagi formatlardagi fayllarni yuklash mumkin: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    unique_filename = f"{uuid.uuid4().hex[:12]}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Hajmni tekshirib oqim orqali yozish
    size = 0
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):  # 1MB bo'laklar
            size += len(chunk)
            if size > MAX_FILE_SIZE_MB * 1024 * 1024:
                buffer.close()
                if os.path.exists(file_path):
                    os.remove(file_path)
                raise HTTPException(
                    status_code=400,
                    detail=f"Fayl hajmi ruxsat etilgan {MAX_FILE_SIZE_MB} MB dan oshmasligi kerak!"
                )
            buffer.write(chunk)
            
    return {
        "success": True,
        "file_name": file.filename,
        "saved_as": unique_filename,
        "size_kb": round(size / 1024, 1),
        "url": f"/api/uploads/{unique_filename}"
    }

@app.get("/api/uploads/{filename}")
def get_uploaded_file(filename: str):
    """Yuklangan daliliy hujjatni xavfsiz yuklab olish"""
    # Path traversal xavfsizligi
    clean_filename = os.path.basename(filename)
    full_path = os.path.join(UPLOAD_DIR, clean_filename)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Fayl topilmadi")
    return FileResponse(full_path, filename=clean_filename)

@app.post("/api/auth/login", response_model=LoginResponse)
def login(creds: LoginRequest, request: Request):
    client_ip = get_client_ip(request)
    username = creds.username.strip().lower()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 1. Rate limiting va hisob bloklanishini tekshirish
    check_login_rate_limit(client_ip, username)

    # Haqiqiy SQLite ma'lumotlar bazasidan foydalanuvchini olish
    db_u = db_get_user(username)
    if db_u:
        user_record = db_u
        if username in USERS_DB:
            USERS_DB[username].update(db_u)
        else:
            USERS_DB[username] = db_u
    else:
        user_record = USERS_DB.get(username)

    # Hisob faolligini tekshirish
    if user_record and not user_record.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hisobingiz administrator tomonidan faolsizlantirilgan (bloklangan)."
        )

    # 2. Agar foydalanuvchi topilmasa yoki parol noto'g'ri bo'lsa
    if not user_record or user_record["password"] != creds.password:
        counts = record_failed_login(client_ip, username)
        u_count = counts["user_count"]
        ip_count = counts["ip_count"]

        if ip_count >= MAX_FAILED_PER_IP:
            lockout_msg = f"XAVFSIZLIK: Ushbu IP ({client_ip}) dan 20 marta xato login urinishi kuzatildi va IP 15 daqiqaga bloklandi!"
            db_save_audit_log(now_str, "SYSTEM", lockout_msg)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Xavfsizlik tizimi: Ushbu IP manzildan xato soʻrovlar juda koʻp yuborilgani sababli kirish 15 daqiqaga bloklandi!"
            )

        if u_count >= MAX_FAILED_PER_ACCOUNT:
            lockout_msg = f"XAVFSIZLIK: '{username}' hisobiga 5 marta notoʻgʻri parol kiritildi va hisob 15 daqiqaga bloklandi! (IP: {client_ip})"
            db_save_audit_log(now_str, username or "unknown", lockout_msg)
            AUDIT_LOGS.insert(0, {
                "id": len(AUDIT_LOGS) + 1,
                "time": now_str,
                "user": username or "unknown",
                "action": lockout_msg
            })
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Xavfsizlik tizimi: Notoʻgʻri parol 5 marta kiritildi. '{username}' hisobi xavfsizlik maqsadida 15 daqiqaga vaqtincha bloklandi!"
            )

        remaining = MAX_FAILED_PER_ACCOUNT - u_count
        fail_msg = f"Muvaffaqiyatsiz kirish urinishi (IP: {client_ip}, Urinish: {u_count}/{MAX_FAILED_PER_ACCOUNT})"
        db_save_audit_log(now_str, username or "unknown", fail_msg)
        AUDIT_LOGS.insert(0, {
            "id": len(AUDIT_LOGS) + 1,
            "time": now_str,
            "user": username or "unknown",
            "action": fail_msg
        })
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Foydalanuvchi nomi yoki maxfiy parol notoʻgʻri. Qolgan urinishlar: {remaining} ta (5 tadan soʻng hisob 15 daqiqaga bloklanadi)."
        )

    # 3. Muvaffaqiyatli kirish - xato urinishlar hisoblagichini tozalash
    reset_failed_login(client_ip, username)

    must_change = user_record.get("must_change_password", False)

    user_img = user_record.get("image")
    if not user_img:
        for t in RAW_TEACHERS:
            if t.get("name") and user_record.get("name") and t["name"].strip().lower() == user_record["name"].strip().lower():
                user_img = t.get("image")
                break

    profile = UserProfile(
        id=user_record["id"],
        username=username,
        name=user_record["name"],
        role=user_record["role"],
        department=user_record.get("department"),
        faculty=user_record.get("faculty"),
        position=user_record.get("position"),
        degree=user_record.get("degree"),
        fte=user_record.get("fte", 1.0),
        employee_id_number=user_record.get("employee_id_number"),
        image=user_img,
        must_change_password=must_change
    )

    success_msg = f"Tizimga muvaffaqiyatli kirdi (IP: {client_ip}, Rol: {user_record['role']}, Birlamchi parol holati: {'Almashtirish shart' if must_change else 'Faol'})"
    db_save_audit_log(now_str, username, success_msg)
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": now_str,
        "user": username,
        "action": success_msg
    })

    return LoginResponse(
        success=True,
        access_token=f"jwt_token_for_{username}_secure",
        user=profile
    )

@app.post("/api/auth/change-password")
def change_password(req: ChangePasswordRequest):
    """
    Birlamchi HEMIS ID parolini yangi mustahkam maxfiy parolga almashtirish:
    - Foydalanuvchi birinchi marta kirganda yangi parol oʻrnatmagunicha tizim toʻliq ochilmaydi;
    - Yangi parol HEMIS ID parolidan mutlaqo farq qilishi shart;
    - Minimal uzunlik 6 ta belgi.
    """
    username = req.username.strip().lower()
    user_record = db_get_user(username) or USERS_DB.get(username)

    if not user_record:
        raise HTTPException(status_code=404, detail="Foydalanuvchi hisobi topilmadi")

    if user_record["password"] != req.current_password:
        raise HTTPException(status_code=400, detail="Joriy (birlamchi) parol notoʻgʻri kiritildi")

    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Yangi parol va uning tasdigʻi bir-biriga mos kelmadi")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Yangi maxfiy parol kamida 6 ta belgidan iborat boʻlishi lozim")

    if req.new_password == req.current_password or req.new_password == username:
        raise HTTPException(status_code=400, detail="Yangi parol birlamchi HEMIS ID paroli bilan bir xil boʻlishi mumkin emas!")

    # Parolni yangilash (SQLite va xotirada)
    user_record["password"] = req.new_password
    user_record["must_change_password"] = False
    if username in USERS_DB:
        USERS_DB[username]["password"] = req.new_password
        USERS_DB[username]["must_change_password"] = False
    db_update_password(username, req.new_password)

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    db_save_audit_log(now_str, username, "Birlamchi HEMIS ID paroli yangi shaxsiy parolga muvaffaqiyatli almashtirildi")
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": now_str,
        "user": username,
        "action": "Birlamchi HEMIS ID paroli yangi shaxsiy parolga muvaffaqiyatli almashtirildi"
    })

    profile = UserProfile(
        id=user_record["id"],
        username=username,
        name=user_record["name"],
        role=user_record["role"],
        department=user_record.get("department"),
        faculty=user_record.get("faculty"),
        position=user_record.get("position"),
        degree=user_record.get("degree"),
        fte=user_record.get("fte", 1.0),
        employee_id_number=user_record.get("employee_id_number"),
        must_change_password=False
    )

    return {
        "success": True,
        "message": "Maxfiy parol muvaffaqiyatli oʻrnatildi. Shaxsiy kabinetingiz toʻliq faollashtirildi.",
        "user": profile
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "JBNUU KPI Backend API", "version": "2.0.0"}

@app.get("/api/structure/hierarchy")
def get_structure_hierarchy():
    """
    Filial tashkiliy ierarxiyasi: Filial -> Fakultetlar -> Kafedralar -> O'qituvchilar va Dekanlar
    """
    faculties = [
        {
            "id": 1,
            "name": "Amaliy matematika fakulteti",
            "code": "401-101",
            "dean": "Dots. Alimov Salohiddin Hikmat oʻgʻli (Dekan muovini)",
            "dean_fte": 1.50,
            "departments": [
                {
                    "id": 34,
                    "name": "Amaliy matematika",
                    "code": "401-101-04",
                    "head": "Dots. Sharipova Sadoqat Fazliddinovna",
                    "head_fte": 1.50,
                    "teachers_count": 24,
                    "avg_score": 93.3
                },
                {
                    "id": 5,
                    "name": "Kompyuter ilmlari va dasturlashtirish",
                    "code": "401-101-01",
                    "head": "Dots. Kuvandikov Joʻra Tursunbayevich",
                    "head_fte": 1.50,
                    "teachers_count": 28,
                    "avg_score": 88.5
                },
                {
                    "id": 31,
                    "name": "Axborot tizimlari va texnologiyalari",
                    "code": "401-101-03",
                    "head": "Dots. Hafizov Erkin Alimboy oʻgʻli",
                    "head_fte": 1.50,
                    "teachers_count": 22,
                    "avg_score": 82.7
                },
                {
                    "id": 6,
                    "name": "Biotexnologiya",
                    "code": "401-101-02",
                    "head": "Dots. Karimov Jamshid Anvarovich",
                    "head_fte": 1.0,
                    "teachers_count": 16,
                    "avg_score": 79.4
                }
            ]
        },
        {
            "id": 2,
            "name": "Psixologiya fakulteti",
            "code": "401-102",
            "dean": "Dots. Aliqulov Saloxiddin Turdimuratovich (Dekan)",
            "dean_fte": 1.25,
            "departments": [
                {
                    "id": 77,
                    "name": "Psixologiya kafedrasi",
                    "code": "401-102-09",
                    "head": "Dots. Umarova Dilfuza Mahmudovna",
                    "head_fte": 1.0,
                    "teachers_count": 26,
                    "avg_score": 85.0
                },
                {
                    "id": 76,
                    "name": "O'zbek tili va ijtimoiy fanlar kafedrasi",
                    "code": "401-102-08",
                    "head": "Dots. Nasirov Bunyod Uralovich",
                    "head_fte": 1.50,
                    "teachers_count": 25,
                    "avg_score": 77.2
                },
                {
                    "id": 64,
                    "name": "Iqtisodiyot va turizm",
                    "code": "401-102-07",
                    "head": "Prof. Soy Marina Petrovna",
                    "head_fte": 1.50,
                    "teachers_count": 23,
                    "avg_score": 96.0
                },
                {
                    "id": 33,
                    "name": "Xorijiy tillar",
                    "code": "401-102-04",
                    "head": "Joʻrayev Muxammadraximxon Murod oʻgʻli",
                    "head_fte": 1.50,
                    "teachers_count": 35,
                    "avg_score": 72.8
                }
            ]
        },
        {
            "id": 3,
            "name": "Sirtqi fakultet",
            "code": "401-105",
            "dean": "Dots. Halimov Oʻktam Haydarovich (Dekan)",
            "dean_fte": 1.50,
            "departments": [
                {
                    "id": 38,
                    "name": "Sirtqi (maxsus sirtqi) boʻlimi",
                    "code": "401-223",
                    "head": "Dots. Halimov Oʻktam Haydarovich",
                    "head_fte": 1.50,
                    "teachers_count": 25,
                    "avg_score": 84.1
                }
            ]
        }
    ]
    return {
        "branch_name": "Oʻzbekiston Milliy universiteti Jizzax filiali",
        "total_faculties": len(faculties),
        "total_departments": sum(len(f["departments"]) for f in faculties),
        "total_teachers_hemis": 199,
        "faculties": faculties
    }

@app.get("/api/indicators", response_model=List[Indicator])
def get_indicators(block: Optional[str] = None, include_inactive: bool = False):
    res = INDICATORS_DB
    if not include_inactive:
        res = [ind for ind in res if getattr(ind, "is_active", True)]
    if block and block != "ALL":
        res = [ind for ind in res if ind.block == block]
    return res

@app.post("/api/indicators", response_model=Indicator)
def create_indicator(item: IndicatorCreate):
    global INDICATORS_DB
    exists = any(ind.id.strip().lower() == item.id.strip().lower() for ind in INDICATORS_DB)
    if exists:
        raise HTTPException(status_code=400, detail=f"'{item.id}' kodli mezon tizimda allaqachon mavjud!")
    
    new_ind = Indicator(
        id=item.id.strip(),
        block=item.block.upper(),
        name=item.name.strip(),
        max_ball=item.max_ball,
        validity=item.validity.strip(),
        dept=item.dept.strip(),
        description=item.description,
        is_active=item.is_active
    )
    INDICATORS_DB.append(new_ind)
    db_save_indicator(new_ind.dict())
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": "2026-10-01 21:44",
        "user": "admin",
        "action": f"Yangi mezon kiritildi: {new_ind.id} - {new_ind.name} ({new_ind.max_ball} ball)"
    })
    return new_ind

@app.put("/api/indicators/{indicator_id}", response_model=Indicator)
def update_indicator(indicator_id: str, update: IndicatorUpdate):
    global INDICATORS_DB
    ind = next((i for i in INDICATORS_DB if i.id.strip().lower() == indicator_id.strip().lower()), None)
    if not ind:
        raise HTTPException(status_code=404, detail="Bunday mezon topilmadi")
    
    if update.name is not None: ind.name = update.name.strip()
    if update.block is not None: ind.block = update.block.upper()
    if update.max_ball is not None: ind.max_ball = update.max_ball
    if update.validity is not None: ind.validity = update.validity.strip()
    if update.dept is not None: ind.dept = update.dept.strip()
    if update.is_active is not None: ind.is_active = update.is_active

    db_save_indicator(ind.dict())
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": "2026-10-01 21:44",
        "user": "admin",
        "action": f"Mezon parametrlari tahrirlandi: {ind.id} (Yangi ball: {ind.max_ball}, Faol: {ind.is_active})"
    })
    return ind

@app.delete("/api/indicators/{indicator_id}")
def delete_indicator(indicator_id: str):
    global INDICATORS_DB
    ind = next((i for i in INDICATORS_DB if i.id.strip().lower() == indicator_id.strip().lower()), None)
    if not ind:
        raise HTTPException(status_code=404, detail="Bunday mezon topilmadi")
    
    # Soft delete: tarixiy ma'lumotlar saqlanishi uchun arxivlanadi
    ind.is_active = False
    db_save_indicator(ind.dict())
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": "2026-10-01 21:44",
        "user": "admin",
        "action": f"Mezon arxivlandi (faolsizlantirildi): {ind.id}"
    })
    return {"success": True, "message": f"'{ind.id}' mezoni muvaffaqiyatli arxivlandi (nofaol holatga oʻtkazildi)"}

@app.get("/api/teachers", response_model=List[Teacher])
def get_teachers():
    result = []
    for t in RAW_TEACHERS:
        detail = calculate_kpi(t["oqv"], t["ilm"], t["xal"], t["man"], t["jarima"], t["fte"], t["is_first_year"])
        result.append(Teacher(
            id=t["id"],
            name=t["name"],
            faculty=t["faculty"],
            department=t["department"],
            position=t["position"],
            degree=t["degree"],
            fte=t["fte"],
            track=t["track"],
            is_first_year=t["is_first_year"],
            is_head_of_dept=t["is_head_of_dept"],
            image=t.get("image"),
            scores=detail
        ))
    return result

@app.get("/api/submissions", response_model=List[Submission])
def get_submissions(teacher_id: Optional[int] = None, status: Optional[str] = None):
    res = SUBMISSIONS_DB
    if teacher_id:
        res = [s for s in res if s.teacher_id == teacher_id]
    if status:
        res = [s for s in res if s.status == status]
    return res

@app.post("/api/submissions", response_model=Submission)
def create_submission(sub_in: SubmissionCreate):
    global SYSTEM_SETTINGS
    if not SYSTEM_SETTINGS.submissions_open:
        raise HTTPException(
            status_code=400,
            detail=f"Hozirda KPI hujjatlarini qabul qilish muddati yakunlangan yoki administrator tomonidan vaqtincha yopilgan. Belgilangan muddat: {SYSTEM_SETTINGS.deadline_date}"
        )

    teacher = next((t for t in RAW_TEACHERS if t["id"] == sub_in.teacher_id), None)
    if not teacher:
        for u in USERS_DB.values():
            if u.get("id") == sub_in.teacher_id or str(u.get("id")) == str(sub_in.teacher_id) or str(u.get("employee_id_number")) == str(sub_in.teacher_id):
                teacher = u
                break
    if not teacher:
        raise HTTPException(status_code=404, detail="Oʻqituvchi topilmadi")
    
    ind = next((i for i in INDICATORS_DB if i.id == sub_in.indicator_id), None)
    default_ball = ind.max_ball if ind else 2.0
    
    # O'qituvchi o'ziga da'vo qilayotgan ball (kiritilmagan bo'lsa default mezon bali)
    claimed = float(sub_in.claimed_ball) if sub_in.claimed_ball is not None else float(default_ball)

    new_sub = Submission(
        id=len(SUBMISSIONS_DB) + 101,
        teacher_id=sub_in.teacher_id,
        teacher_name=teacher["name"],
        indicator_id=sub_in.indicator_id,
        title=sub_in.title.strip(),
        doi=sub_in.doi.strip() if sub_in.doi else None,
        authors_count=sub_in.authors_count,
        submitted_date=sub_in.submitted_date,
        status="pending",
        claimed_ball=claimed,
        ball=claimed,
        file_name=sub_in.file_name,
        dept=ind.dept if ind else "Oʻquv-uslubiy boshqarma",
        description=sub_in.description.strip() if sub_in.description else None
    )
    SUBMISSIONS_DB.append(new_sub)
    db_save_submission(new_sub.dict())

    audit_now = datetime.now().strftime("%Y-%m-%d %H:%M")
    audit_msg = f"Yangi KPI faoliyat natijasi yuklandi (#{new_sub.id}, Mezon: {new_sub.indicator_id}, Daʻvo qilingan ball: {new_sub.claimed_ball} ball)"
    db_save_audit_log(audit_now, teacher["name"], audit_msg)
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": audit_now,
        "user": teacher["name"],
        "action": audit_msg
    })

    return new_sub

@app.put("/api/submissions/{sub_id}", response_model=Submission)
def update_submission(sub_id: int, update_data: SubmissionUpdate):
    sub = next((s for s in SUBMISSIONS_DB if s.id == sub_id), None)
    if not sub:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    if sub.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Faqat baholanmagan (kutilayotgan) holatdagi arizalarni tahrirlash mumkin. Baholangan arizalar boʻyicha apellyatsiya berilishi kerak."
        )

    if update_data.indicator_id is not None:
        sub.indicator_id = update_data.indicator_id
        ind = next((i for i in INDICATORS_DB if i.id == update_data.indicator_id), None)
        if ind:
            sub.dept = ind.dept
    if update_data.title is not None and update_data.title.strip():
        sub.title = update_data.title.strip()
    if update_data.doi is not None:
        sub.doi = update_data.doi.strip() if update_data.doi else None
    if update_data.authors_count is not None and update_data.authors_count > 0:
        sub.authors_count = update_data.authors_count
    if update_data.claimed_ball is not None:
        sub.claimed_ball = float(update_data.claimed_ball)
        sub.ball = float(update_data.claimed_ball)
    if update_data.file_name is not None and update_data.file_name.strip():
        sub.file_name = update_data.file_name.strip()
    if update_data.description is not None:
        sub.description = update_data.description.strip() if update_data.description else None

    db_save_submission(sub.dict())

    audit_now = datetime.now().strftime("%Y-%m-%d %H:%M")
    audit_msg = f"KPI arizasi tahrirlandi (#{sub.id}, '{sub.title}', Mezon: {sub.indicator_id})"
    db_save_audit_log(audit_now, sub.teacher_name, audit_msg)
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": audit_now,
        "user": sub.teacher_name,
        "action": audit_msg
    })
    return sub

@app.delete("/api/submissions/{sub_id}")
def delete_submission(sub_id: int):
    global SUBMISSIONS_DB
    sub = next((s for s in SUBMISSIONS_DB if s.id == sub_id), None)
    if not sub:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    if sub.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Faqat baholanmagan (kutilayotgan) holatdagi arizalarni oʻchirish mumkin. Baholangan arizalar boʻyicha apellyatsiya berilishi kerak."
        )

    SUBMISSIONS_DB = [s for s in SUBMISSIONS_DB if s.id != sub_id]
    db_delete_submission(sub_id)

    audit_now = datetime.now().strftime("%Y-%m-%d %H:%M")
    audit_msg = f"KPI arizasi oʻchirildi (#{sub.id}, '{sub.title}')"
    db_save_audit_log(audit_now, sub.teacher_name, audit_msg)
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": audit_now,
        "user": sub.teacher_name,
        "action": audit_msg
    })
    return {"message": "Ariza muvaffaqiyatli oʻchirildi", "id": sub_id}

@app.post("/api/submissions/{sub_id}/verify")
def verify_submission(sub_id: int, action: VerificationAction):
    sub = next((s for s in SUBMISSIONS_DB if s.id == sub_id), None)
    if not sub:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    
    # 1. Manfaatlar to'qnashuvi (Conflict of Interest) qat'iy himoyasi
    rev_name_clean = (action.reviewer_name or "").lower().replace("dots.", "").replace("prof.", "").strip()
    author_name_clean = (sub.teacher_name or "").lower().replace("dots.", "").replace("prof.", "").strip()
    
    if (sub.teacher_id == action.reviewer_id) or (rev_name_clean and author_name_clean and (rev_name_clean == author_name_clean or rev_name_clean in author_name_clean or author_name_clean in rev_name_clean)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manfaatlar toʻqnashuvi taqiqlanadi: Baholovchi oʻzining arizasini oʻzi tasdiqlashi yoki rad etishi mutlaqo mumkin emas. Ushbu ariza Fakultet Dekani yoki Universitet Ilmiy Komissiyasi tomonidan baholanadi."
        )

    # 2. Baholash muddati va bosqich tekshiruvi
    s_settings = db_load_settings()
    if s_settings:
        c_stage = s_settings.get("current_stage", "ALL_OPEN")
        r_deadline = s_settings.get("review_deadline")
        if c_stage == "CLOSED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Baholash kampaniyasi rasman yakunlangan. Hozirda arizalarni qayta baholash imkonsiz."
            )
        elif r_deadline and c_stage not in ["ALL_OPEN", "REVIEW_STAGE"]:
            try:
                deadline_dt = datetime.strptime(r_deadline, "%Y-%m-%d").date()
                if datetime.now().date() > deadline_dt:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Baholash muddati ({r_deadline}) tugagan. Kechiktirilgan baholash uchun Rektorat/Administratsiyaga murojaat qiling."
                    )
            except ValueError:
                pass

    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    sub.reviewer_name = action.reviewer_name
    sub.reviewed_date = current_time_str

    if action.status == "rejected":
        # Rad etilganda rad etish sababi majburiy!
        reason = action.rejection_reason.strip() if action.rejection_reason else ""
        if len(reason) < 5:
            raise HTTPException(
                status_code=400,
                detail="Arizani rad etishda rad etish sababini aniq va batafsil kiritish SHART (kamida 5 ta belgi)!"
            )
        sub.status = "rejected"
        sub.ball = 0.0
        sub.rejection_reason = reason
        sub.reviewer_comment = action.comment.strip() if action.comment else None
        db_save_submission(sub.dict())

        rej_msg = f"#{sub.id} arizasi rad etildi (Muallif: {sub.teacher_name}). Rad etish sababi: «{reason}»"
        db_save_audit_log(current_time_str, action.reviewer_name, rej_msg)
        AUDIT_LOGS.insert(0, {
            "id": len(AUDIT_LOGS) + 1,
            "time": current_time_str,
            "user": action.reviewer_name,
            "action": rej_msg
        })
        return {
            "success": True,
            "message": f"Ariza muvaffaqiyatli rad etildi. Sababi oʻqituvchi profilida koʻrsatiladi.",
            "submission": sub
        }

    elif action.status == "approved":
        sub.status = "approved"
        # Tekshiruvchi qo'lda belgilagan ball yoki o'qituvchi da'vo qilgan ball
        if action.score is not None and action.score >= 0:
            final_ball = float(action.score)
        else:
            final_ball = float(sub.claimed_ball)
        
        sub.ball = final_ball
        sub.rejection_reason = None
        sub.reviewer_comment = action.comment.strip() if action.comment else "Ekspert komissiyasi tomonidan tekshirilib tasdiqlandi"
        db_save_submission(sub.dict())

        # O'qituvchining jami ballari blokini yangilash
        teacher = next((t for t in RAW_TEACHERS if t["id"] == sub.teacher_id), None)
        ind = next((i for i in INDICATORS_DB if i.id == sub.indicator_id), None)
        if teacher and ind:
            block_key = ind.block.lower()
            if block_key in teacher:
                teacher[block_key] = round((teacher[block_key] + final_ball) * 10) / 10

        app_msg = f"#{sub.id} arizasi tasdiqlandi (Muallif: {sub.teacher_name}, Qoʻyilgan ball: {final_ball} ball)"
        db_save_audit_log(current_time_str, action.reviewer_name, app_msg)
        AUDIT_LOGS.insert(0, {
            "id": len(AUDIT_LOGS) + 1,
            "time": current_time_str,
            "user": action.reviewer_name,
            "action": app_msg
        })
        return {
            "success": True,
            "message": f"Ariza tasdiqlandi va {final_ball} ball belgilandi.",
            "submission": sub
        }
    else:
        raise HTTPException(status_code=400, detail="Notoʻgʻri holat tanlandi")

@app.post("/api/doi/lookup")
def lookup_doi(req: DoiLookupRequest):
    doi_clean = req.doi.strip()
    if not doi_clean:
        raise HTTPException(status_code=400, detail="DOI kiritilmadi")

    return {
        "found": True,
        "doi": doi_clean,
        "title": "Deep Learning Frameworks for Academic Performance Optimization in Higher Education",
        "journal": "Expert Systems with Applications",
        "issn": "0957-4174",
        "quartile": "Q1",
        "authors": [
            "Prof. Rahimov Ulugʻbek",
            "Dr. Jamshid Karimov",
            "A. V. Smirnov"
        ],
        "authors_count": 3,
        "suggested_indicator": "2.3",
        "calculated_ball": 8.0
    }

# ==========================================
# APPEALS (APELLYATSIYA) ENDPOINTS
# ==========================================

@app.get("/api/appeals", response_model=List[Appeal])
def get_appeals(teacher_id: Optional[int] = None):
    db_items = db_load_appeals()
    all_appeals = [Appeal(**a) for a in db_items] if db_items else APPEALS_DB
    if teacher_id is not None:
        return [a for a in all_appeals if a.teacher_id == teacher_id]
    return all_appeals

@app.post("/api/appeals", response_model=Appeal)
def create_appeal(appeal_in: AppealCreate):
    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    appeal_id = f"AP-2026-{uuid.uuid4().hex[:6].upper()}"
    
    # Ariza ma'lumotlarini qidirish
    sub_title = appeal_in.title or ""
    claimed = appeal_in.claimed_ball or 0.0
    reviewed = appeal_in.reviewed_ball or 0.0
    if appeal_in.submission_id:
        sub = next((s for s in SUBMISSIONS_DB if s.id == appeal_in.submission_id), None)
        if sub:
            sub_title = sub_title or sub.title
            claimed = claimed or sub.claimed_ball
            reviewed = reviewed or sub.ball
            if not appeal_in.initial_reviewer:
                appeal_in.initial_reviewer = sub.reviewer_name or "Kafedra mudiri"
            if not appeal_in.initial_rejection_reason:
                appeal_in.initial_rejection_reason = sub.rejection_reason or sub.reviewer_comment

    new_appeal_data = {
        "id": appeal_id,
        "submission_id": appeal_in.submission_id or 0,
        "teacher_id": appeal_in.teacher_id,
        "teacher_name": appeal_in.teacher_name,
        "indicator_id": appeal_in.indicator_id,
        "title": sub_title,
        "claimed_ball": claimed,
        "reviewed_ball": reviewed,
        "initial_reviewer": appeal_in.initial_reviewer or "Kafedra mudiri",
        "initial_rejection_reason": appeal_in.initial_rejection_reason or "Koʻrib chiqishda rad etilgan",
        "appeal_reason": appeal_in.reason,
        "reason": appeal_in.reason,
        "evidence_file": appeal_in.evidence_file or appeal_in.file_name,
        "submitted_date": datetime.now().strftime("%Y-%m-%d"),
        "status": "Jarayonda",
        "decision": "Apellyatsiya komissiyasida koʻrib chiqilmoqda",
        "commission_member": None,
        "commission_comment": None,
        "decision_date": None,
        "awarded_ball": 0.0,
        "created_at": current_time_str
    }
    db_save_appeal(new_appeal_data)
    created_obj = Appeal(**new_appeal_data)
    APPEALS_DB.insert(0, created_obj)

    audit_msg = f"Yangi apellyatsiya berildi ({appeal_id}, Muallif: {appeal_in.teacher_name}, Mezon: {appeal_in.indicator_id})"
    db_save_audit_log(current_time_str, appeal_in.teacher_name, audit_msg)
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": current_time_str,
        "user": appeal_in.teacher_name,
        "action": audit_msg
    })
    return created_obj

@app.put("/api/appeals/{appeal_id}/review", response_model=Appeal)
def review_appeal(appeal_id: str, review_in: AppealReviewRequest):
    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Status konvertatsiyasi
    status_map = {
        "ACCEPTED": "Qanoatlantirildi",
        "PARTIALLY_ACCEPTED": "Qisman qanoatlantirildi",
        "REJECTED": "Rad etildi"
    }
    disp_status = status_map.get(review_in.status.upper(), review_in.status)

    decision_data = {
        "status": disp_status,
        "commission_member": review_in.commission_member or "Apellyatsiya Komissiyasi",
        "commission_comment": review_in.commission_comment,
        "decision_date": current_time_str,
        "awarded_ball": review_in.awarded_ball or 0.0
    }

    updated = db_review_appeal(appeal_id, decision_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Apellyatsiya topilmadi")

    # In-memory xotirani ham sinxronlash
    for i, a in enumerate(APPEALS_DB):
        if a.id == appeal_id:
            for k, v in updated.items():
                if hasattr(a, k):
                    setattr(a, k, v)
            a.status = disp_status
            a.decision = review_in.commission_comment
            break

    # Agar qanoatlantirilgan bo'lsa, submissions xotirasini ham sinxronlash
    if review_in.status.upper() in ["ACCEPTED", "PARTIALLY_ACCEPTED"]:
        sub_id = updated.get("submission_id")
        if sub_id:
            sub = next((s for s in SUBMISSIONS_DB if s.id == sub_id), None)
            if sub:
                sub.status = "approved"
                sub.ball = float(review_in.awarded_ball or 0.0)
                sub.reviewer_comment = f"Apellyatsiya komissiyasi qarori: {review_in.commission_comment}"

    audit_msg = f"Apellyatsiya koʻrib chiqildi ({appeal_id}, Holati: {disp_status}, Qoʻyilgan ball: {review_in.awarded_ball})"
    db_save_audit_log(current_time_str, review_in.commission_member or "Komissiya", audit_msg)
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": current_time_str,
        "user": review_in.commission_member or "Komissiya",
        "action": audit_msg
    })
    return Appeal(**updated)

# ==========================================
# BAHOLOVCHILAR VA EKSPERTLAR (EVALUATORS)
# ==========================================

@app.get("/api/evaluators", response_model=List[Evaluator])
def get_evaluators():
    db_evals = db_load_evaluators()
    if db_evals:
        return [Evaluator(**e) for e in db_evals]
    return EVALUATORS_DB

@app.post("/api/evaluators", response_model=Evaluator)
def add_evaluator(eval_in: EvaluatorCreate):
    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    eval_dict = eval_in.dict()
    saved = db_add_evaluator(eval_dict)
    eval_obj = Evaluator(**saved)
    EVALUATORS_DB.append(eval_obj)

    audit_msg = f"Yangi baholovchi/ekspert tayinlandi ({eval_obj.name}, Mezon yoʻnalishi: {eval_obj.assigned_category})"
    db_save_audit_log(current_time_str, eval_in.assigned_by or "ADMIN", audit_msg)
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": current_time_str,
        "user": eval_in.assigned_by or "ADMIN",
        "action": audit_msg
    })
    return eval_obj

@app.delete("/api/evaluators/{eval_id}")
def delete_evaluator_endpoint(eval_id: int):
    global EVALUATORS_DB
    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    db_delete_evaluator(eval_id)
    EVALUATORS_DB = [e for e in EVALUATORS_DB if e.id != eval_id]
    
    audit_msg = f"Baholovchi/ekspert roʻyxatdan chiqarildi (ID: #{eval_id})"
    db_save_audit_log(current_time_str, "ADMIN", audit_msg)
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": current_time_str,
        "user": "ADMIN",
        "action": audit_msg
    })
    return {"success": True, "message": "Ekspert muvaffaqiyatli oʻchirildi", "id": eval_id}

# ==========================================
# BAHOLASH MUDDATLARI VA BOSQICHLARI (PERIOD)
# ==========================================

@app.get("/api/evaluation-period")
def get_evaluation_period():
    s = db_load_settings() or SYSTEM_SETTINGS.dict()
    return {
        "academic_year": s.get("academic_year", "2025/2026-oʻquv yili"),
        "submissions_open": s.get("submissions_open", True),
        "submission_deadline": s.get("submission_deadline", "2026-06-15"),
        "review_deadline": s.get("review_deadline", "2026-06-25"),
        "appeal_deadline": s.get("appeal_deadline", "2026-07-05"),
        "current_stage": s.get("current_stage", "ALL_OPEN"),
        "budget_cap_monthly": s.get("budget_cap_monthly", 150000000.0)
    }

@app.put("/api/evaluation-period")
def update_evaluation_period(period_in: EvaluationPeriodUpdate):
    global SYSTEM_SETTINGS
    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    current = db_load_settings() or SYSTEM_SETTINGS.dict()
    for k, v in period_in.dict(exclude_unset=True).items():
        if v is not None:
            current[k] = v
    db_save_settings(current)

    SYSTEM_SETTINGS = SystemSettings(**current)

    audit_msg = f"Baholash davri va muddatlari yangilandi (Bosqich: {current.get('current_stage')}, Ariza: {current.get('submission_deadline')}, Baholash: {current.get('review_deadline')}, Apellyatsiya: {current.get('appeal_deadline')})"
    db_save_audit_log(current_time_str, "ADMIN", audit_msg)
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": current_time_str,
        "user": "ADMIN",
        "action": audit_msg
    })
    return current

# ==========================================
# ADMIN ENDPOINTS
# ==========================================

@app.get("/api/settings", response_model=SystemSettings)
@app.get("/api/admin/settings", response_model=SystemSettings)
def get_system_settings():
    s = db_load_settings()
    if s:
        return SystemSettings(**s)
    return SYSTEM_SETTINGS

@app.post("/api/admin/settings", response_model=SystemSettings)
def update_system_settings(new_settings: SystemSettings):
    global SYSTEM_SETTINGS
    SYSTEM_SETTINGS = new_settings
    db_save_settings(new_settings.dict())
    return SYSTEM_SETTINGS

@app.get("/api/admin/users")
def get_admin_users(q: Optional[str] = None, role: Optional[str] = None):
    """
    Foydalanuvchilar va rollar reyestri:
    - Qidiruv (F.I.Sh., login, kafedra);
    - Rol boʻyicha saralash;
    - Umumiy statistik koʻrsatkichlar.
    """
    items = []
    stats = {
        "total": len(USERS_DB),
        "teacher": 0,
        "dean": 0,
        "head_of_dept": 0,
        "rectorate": 0,
        "admin": 0
    }

    for k, v in USERS_DB.items():
        u_role = v.get("role", "TEACHER")
        if u_role == "ADMIN": stats["admin"] += 1
        elif u_role == "DEAN": stats["dean"] += 1
        elif u_role == "HEAD_OF_DEPT": stats["head_of_dept"] += 1
        elif u_role == "RECTORATE": stats["rectorate"] += 1
        else: stats["teacher"] += 1

        # Filtrlash
        if role and role != "ALL" and u_role != role:
            continue

        search_target = f"{k} {v.get('name', '')} {v.get('department', '')} {v.get('position', '')}".lower()
        if q and q.strip().lower() not in search_target:
            continue

        items.append({
            "username": k,
            "name": v.get("name", ""),
            "role": u_role,
            "department": v.get("department", "—"),
            "position": v.get("position", "—"),
            "fte": v.get("fte", 1.0),
            "must_change_password": v.get("must_change_password", False),
            "is_active": v.get("is_active", True),
            "employee_id_number": v.get("employee_id_number", k)
        })

    items.sort(key=lambda x: x["name"])
    return {
        "stats": stats,
        "total_filtered": len(items),
        "items": items
    }

@app.put("/api/admin/users/{username}/role")
def update_user_role(username: str, body: AdminUserRoleUpdate):
    """Foydalanuvchining tizimdagi rolini oʻzgartirish"""
    u_key = username.strip().lower()
    user = USERS_DB.get(u_key)
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi hisobi topilmadi")

    old_role = user.get("role", "TEACHER")
    user["role"] = body.role.upper()
    db_update_user_role(u_key, body.role.upper())

    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": "2026-10-01 21:45",
        "user": "admin",
        "action": f"Foydalanuvchi roli oʻzgartirildi: {username} ({old_role} -> {user['role']})"
    })
    return {"success": True, "message": f"Foydalanuvchi roli '{user['role']}' deb muvaffaqiyatli yangilandi", "user": user}

@app.post("/api/admin/users/{username}/reset-password")
def reset_user_password(username: str):
    """
    Foydalanuvchining parolini dastlabki HEMIS ID ga qaytarish:
    - Oʻqituvchi parolini unutganda administrator bitta tugma bilan tiklab beradi;
    - Tizimga qayta kirganda yana majburiy yangi parol soʻraladi.
    """
    u_key = username.strip().lower()
    user = USERS_DB.get(u_key)
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi hisobi topilmadi")

    initial_pass = user.get("employee_id_number") or u_key
    user["password"] = initial_pass
    user["must_change_password"] = True
    db_reset_user_password(u_key, initial_pass)

    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": "2026-10-01 21:45",
        "user": "admin",
        "action": f"Foydalanuvchi paroli birlamchi HEMIS ID ga tiklandi: {username}"
    })
    return {"success": True, "message": f"{user.get('name', username)} xodimining paroli birlamchi HEMIS ID ga tiklandi"}

@app.post("/api/admin/users/{username}/toggle-status")
def toggle_user_status(username: str):
    """Foydalanuvchi hisobini vaqtincha bloklash yoki qayta faollashtirish"""
    u_key = username.strip().lower()
    user = USERS_DB.get(u_key)
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi hisobi topilmadi")

    current_status = user.get("is_active", True)
    user["is_active"] = not current_status
    db_toggle_user_status(u_key, user["is_active"])

    status_name = "faollashtirildi" if user["is_active"] else "bloklandi"
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": "2026-10-01 21:45",
        "user": "admin",
        "action": f"Foydalanuvchi hisobi {status_name}: {username}"
    })
    return {"success": True, "is_active": user["is_active"], "message": f"Foydalanuvchi hisobi muvaffaqiyatli {status_name}"}

@app.post("/api/admin/users")
def create_admin_user(data: AdminUserCreate):
    """Administrator tomonidan yangi foydalanuvchi qoʻshish"""
    u_key = data.username.strip().lower()
    if u_key in USERS_DB:
        raise HTTPException(status_code=400, detail="Ushbu loginli foydalanuvchi allaqachon mavjud")

    init_pass = data.password.strip() if data.password else u_key
    USERS_DB[u_key] = {
        "id": len(USERS_DB) + 1000,
        "username": u_key,
        "name": data.name.strip(),
        "role": data.role.upper(),
        "department": data.department.strip() if data.department else "Kafedra koʻrsatilmagan",
        "position": data.position.strip() if data.position else "Xodim",
        "fte": data.fte,
        "password": init_pass,
        "must_change_password": True,
        "is_active": True,
        "employee_id_number": u_key
    }
    db_save_user(u_key, USERS_DB[u_key], overwrite_auth=True)

    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": "2026-10-01 21:45",
        "user": "admin",
        "action": f"Yangi foydalanuvchi yaratildi: {u_key} ({data.name}, Rol: {data.role})"
    })
    return {"success": True, "message": "Yangi foydalanuvchi muvaffaqiyatli roʻyxatdan oʻtkazildi", "user": USERS_DB[u_key]}

@app.get("/api/admin/logs")
def get_admin_logs():
    return AUDIT_LOGS

# ==========================================
# HEMIS AXBOROT TIZIMI INTEGRATSIYASI
# ==========================================

def get_hemis_headers():
    return {
        "Accept": "application/json",
        "Authorization": f"Bearer {HEMIS_API_TOKEN}"
    }

@app.get("/api/hemis/status")
def hemis_status():
    """HEMIS API ulanishini va token yaroqliligini tekshirish"""
    try:
        url = f"{HEMIS_BASE_URL}/data/department-list?limit=1"
        res = requests.get(url, headers=get_hemis_headers(), timeout=5)
        if res.status_code == 200:
            data = res.json()
            total_depts = data.get("data", {}).get("pagination", {}).get("totalCount", 0)
            return {
                "connected": True,
                "base_url": HEMIS_BASE_URL,
                "total_departments": total_depts,
                "message": "HEMIS axborot tizimiga muvaffaqiyatli ulandi"
            }
        else:
            return {
                "connected": False,
                "base_url": HEMIS_BASE_URL,
                "error": f"HEMIS HTTP xatolik kodi: {res.status_code}",
                "message": "HEMIS tokeni yaroqsiz yoki server javob bermadi"
            }
    except Exception as e:
        return {
            "connected": False,
            "base_url": HEMIS_BASE_URL,
            "error": str(e),
            "message": "HEMIS serveriga ulanishda xatolik yuz berdi"
        }

@app.get("/api/hemis/departments")
def get_hemis_departments():
    """HEMIS dan kafedralar va tuzilmalar roʻyxatini yuklash"""
    try:
        url = f"{HEMIS_BASE_URL}/data/department-list?limit=100"
        res = requests.get(url, headers=get_hemis_headers(), timeout=10)
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail="HEMIS dan kafedralarni yuklab boʻlmadi")

        raw_data = res.json().get("data", {}).get("items", [])
        # Faqat zarur bo'lgan xizmat ma'lumotlarini qoldiramiz
        departments = [
            {
                "id": d.get("id"),
                "name": d.get("name"),
                "code": d.get("code"),
                "structure_type": d.get("structureType", {}).get("name", "Boshqa"),
                "is_department": d.get("structureType", {}).get("code") == "12",
                "active": d.get("active", True)
            }
            for d in raw_data
            if d.get("active", True)
        ]
        return {"total": len(departments), "items": departments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HEMIS API xatoligi: {str(e)}")

def parse_fte(staff_str: Any) -> float:
    """HEMIS shtat matnidan raqamli stavkani aniqlash"""
    if not staff_str:
        return 1.0
    s = str(staff_str).strip()
    if "0,25" in s or "0.25" in s:
        return 0.25
    if "0,50" in s or "0.5" in s:
        return 0.50
    if "0,75" in s or "0.75" in s:
        return 0.75
    if "1,50" in s or "1.5" in s:
        return 1.50
    if "1,00" in s or "1.0" in s:
        return 1.0
    return 1.0

def fetch_all_hemis_raw_employees(employee_type: str = "teacher") -> List[Dict[str, Any]]:
    """HEMIS API barcha sahifalaridan xom maʼlumotlarni yuklab olish"""
    all_items: List[Dict[str, Any]] = []
    page = 1
    while True:
        url = f"{HEMIS_BASE_URL}/data/employee-list?type={employee_type}&page={page}&limit=100"
        try:
            res = requests.get(url, headers=get_hemis_headers(), timeout=15)
            if res.status_code != 200:
                break
            data = res.json().get("data", {})
            items = data.get("items", [])
            if not items:
                break
            all_items.extend(items)
            page_count = data.get("pagination", {}).get("pageCount", 1)
            if page >= page_count:
                break
            page += 1
        except Exception:
            break
    return all_items

def is_teaching_contract(r: Dict[str, Any]) -> bool:
    """
    Shartnoma pedagogik (professor-oʻqituvchilik) faoliyatiga tegishlimi?
    - employeeType 'teacher' / 'professor' / 'oʻqituvchi'
    - yoki staffPosition nomi 'oʻqituvchi', 'dotsent', 'professor', 'assistent', 'stajer', 'kafedra mudiri'
    - yoki kafedraga biriktirilgan boʻlishi
    """
    emp_type = str(r.get("employeeType", {}).get("name", "")).lower()
    staff_pos = str(r.get("staffPosition", {}).get("name", "")).lower()
    dept_type = str(r.get("department", {}).get("structureType", {}).get("name", "")).lower()
    dept_name = str(r.get("department", {}).get("name", "")).lower()

    if "professor" in emp_type or "o‘qituvchi" in emp_type or "teacher" in emp_type:
        return True
    teaching_kw = ["professor", "dotsent", "o‘qituvchi", "oqituvchi", "o'qituvchi", "assistent", "stajer", "mudir", "dekan"]
    if any(kw in staff_pos for kw in teaching_kw):
        return True
    if "kafedra" in dept_type or "kafedra" in dept_name:
        return True
    return False

def deduplicate_and_clean_hemis_employees(raw_items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    HEMIS maʼlumotlarini qatʼiy deduplikatsiya qilish va KPI mezonlariga moslash:
    1. Butunlay ishlamaydigan (boʻshagan) shaxslar chiqarib tashlanadi;
    2. Faqat oʻqituvchilik (pedagogik) faoliyati bor xodimlar qoldiriladi. Oʻqituvchi boʻlmagan xodimlar chetlatiladi;
    3. Agar xodim maʼmuriy lavozimda (masalan, 1.0 stavka) ishlab, ayni paytda oʻqituvchilik qilsa (masalan, 0.5 stavka),
       KPI hisobi aynan uning PEDAGOGIK STAVKASI (0.5 stavka) boʻyicha olib boriladi;
    4. Barcha faol oʻqituvchilar uchun HEMIS ID raqami boʻyicha birlamchi login va parol yaratiladi;
    5. Shaxsga doir nozik maʼlumotlar (pasport, manzil, tugʻilgan sana, hash) mutlaqo saqlanmaydi.
    """
    global USERS_DB
    grouped: Dict[str, List[Dict[str, Any]]] = {}

    for item in raw_items:
        emp_key = (item.get("employee_id_number") or item.get("full_name") or str(item.get("id"))).strip()
        if emp_key not in grouped:
            grouped[emp_key] = []
        grouped[emp_key].append(item)

    clean_employees: List[Dict[str, Any]] = []
    totally_fired_count = 0
    non_teaching_count = 0
    multi_contract_count = 0

    for emp_key, records in grouped.items():
        # 1. Faqat hozirda 'Ishlamoqda' bo'lgan faol shartnomalar
        active_records = [
            r for r in records
            if r.get("employeeStatus", {}).get("name") == "Ishlamoqda" and r.get("active", True)
        ]

        if not active_records:
            totally_fired_count += 1
            continue

        # 2. Pedagogik (o'qituvchilik) shartnomalarini ajratib olish
        teaching_records = [r for r in active_records if is_teaching_contract(r)]
        non_teaching_records = [r for r in active_records if not is_teaching_contract(r)]

        # Agar xodimda umuman o'qituvchilik shartnomasi bo'lmasa -> KPI dan chetlatiladi
        if not teaching_records:
            non_teaching_count += 1
            continue

        # 3. Asosiy pedagogik yozuvni tanlash
        primary_record = None
        for r in teaching_records:
            form_code = str(r.get("employmentForm", {}).get("code", ""))
            form_name = str(r.get("employmentForm", {}).get("name", "")).lower()
            if form_code == "11" or "asosiy" in form_name:
                primary_record = r
                break

        if not primary_record:
            # Agar asosiy ish joyi ma'muriy bo'lsa, eng yuqori pedagogik stavka olinadi
            primary_record = max(teaching_records, key=lambda x: parse_fte(x.get("employmentStaff", {}).get("name")))

        # 4. Aynan PEDAGOGIK faoliyat bo'yicha jami stavkani hisoblash
        teaching_fte = 0.0
        additional_positions = []

        for r in teaching_records:
            s_fte = parse_fte(r.get("employmentStaff", {}).get("name"))
            teaching_fte += s_fte
            if r.get("id") != primary_record.get("id"):
                pos_title = r.get("staffPosition", {}).get("name", "Oʻqituvchi")
                form_title = r.get("employmentForm", {}).get("name", "Oʻrindosh")
                dept_title = r.get("department", {}).get("name", "")
                additional_positions.append(f"{pos_title} ({s_fte} stavka, {form_title}, {dept_title})")

        # Ma'muriy/boshqa lavozimi bo'lsa qo'shimcha ma'lumot sifatida kiritamiz
        for r in non_teaching_records:
            s_fte = parse_fte(r.get("employmentStaff", {}).get("name"))
            pos_title = r.get("staffPosition", {}).get("name", "Xodim")
            form_title = r.get("employmentForm", {}).get("name", "Asosiy xizmat")
            dept_title = r.get("department", {}).get("name", "")
            additional_positions.append(f"{pos_title} ({s_fte} stavka, {form_title}, {dept_title})")

        if len(active_records) > 1:
            multi_contract_count += 1

        final_fte = round(min(1.5, teaching_fte), 2)

        emp_id = str(primary_record.get("employee_id_number") or "").strip()

        clean_item = {
            "id": primary_record.get("id"),
            "full_name": primary_record.get("full_name"),
            "short_name": primary_record.get("short_name"),
            "employee_id_number": emp_id,
            "image": primary_record.get("image"),
            "department": primary_record.get("department", {}).get("name", "Kafedra koʻrsatilmagan"),
            "department_id": primary_record.get("department", {}).get("id"),
            "position": primary_record.get("staffPosition", {}).get("name", "Oʻqituvchi"),
            "degree": primary_record.get("academicDegree", {}).get("name", "Darajasiz"),
            "rank": primary_record.get("academicRank", {}).get("name", "Unvonsiz"),
            "fte": final_fte,
            "teaching_fte": final_fte,
            "raw_fte_sum": round(teaching_fte, 2),
            "active_contracts_count": len(active_records),
            "had_fired_contracts": any(r.get("employeeStatus", {}).get("name") != "Ishlamoqda" for r in records),
            "additional_positions": "; ".join(additional_positions) if additional_positions else None,
            "employment_form": primary_record.get("employmentForm", {}).get("name", "Asosiy ish joy"),
            "employee_type": primary_record.get("employeeType", {}).get("name", "Professor-oʻqituvchi xodim"),
            "specialty": primary_record.get("specialty", "")
        }
        clean_employees.append(clean_item)

        # 5. Har bir o'qituvchiga hisob yaratish yoki ma'lumotlar bazasidagi shaxsiy parolini saqlash
        if emp_id:
            u_id = emp_id.lower()
            existing_user = db_get_user(u_id)
            if existing_user:
                # Bazada mavjud foydalanuvchi: saqlangan parol, rol va must_change_password o'zgarmaydi!
                USERS_DB[u_id] = existing_user
                if clean_item.get("image") and not existing_user.get("image"):
                    existing_user["image"] = clean_item["image"]
                db_save_user(u_id, existing_user, overwrite_auth=False)
            elif u_id not in USERS_DB:
                is_head = "mudir" in clean_item["position"].lower()
                new_account = {
                    "id": clean_item["id"],
                    "username": emp_id,
                    "password": emp_id,  # Birlamchi parol = HEMIS ID
                    "must_change_password": True,  # Birinchi kirishda majburiy o'zgartirish
                    "name": clean_item["full_name"],
                    "role": "HEAD_OF_DEPT" if is_head else "TEACHER",
                    "department": clean_item["department"],
                    "faculty": resolve_faculty_from_dept(clean_item["department"]),
                    "position": clean_item["position"],
                    "degree": clean_item["degree"],
                    "fte": clean_item["fte"],
                    "employee_id_number": emp_id,
                    "image": clean_item.get("image"),
                    "is_active": True
                }
                USERS_DB[u_id] = new_account
                db_save_user(u_id, new_account, overwrite_auth=True)
            else:
                if clean_item.get("image") and not USERS_DB[u_id].get("image"):
                    USERS_DB[u_id]["image"] = clean_item["image"]
                db_save_user(u_id, USERS_DB[u_id], overwrite_auth=False)

    clean_employees.sort(key=lambda x: x["full_name"])

    return {
        "raw_total_records": len(raw_items),
        "total_fired_excluded": totally_fired_count,
        "non_teaching_excluded": non_teaching_count,
        "total_unique_active": len(clean_employees),
        "multi_contracts_merged": multi_contract_count,
        "items": clean_employees
    }

@app.get("/api/hemis/employees")
def get_hemis_employees(type: str = "teacher", page: int = 1, limit: int = 50):
    """
    HEMIS dan xodimlarni olish:
    - Butunlay ishlamaydigan (boʻshagan) shaxslar chiqarib tashlangan;
    - Dublikat yozuvlar (bir shaxsning bir nechta shartnomalari) birlashtirilgan;
    - Shaxsga doir nozik maʼlumotlar (pasport, manzil, tugʻilgan sana, hash) qatʼiy saqlanmaydi!
    """
    try:
        raw_items = fetch_all_hemis_raw_employees(employee_type=type)
        dedup_result = deduplicate_and_clean_hemis_employees(raw_items)

        # Sahifalash (Pagination)
        all_clean = dedup_result["items"]
        start_idx = (page - 1) * limit
        paged_items = all_clean[start_idx : start_idx + limit]

        return {
            "success": True,
            "raw_total_records": dedup_result["raw_total_records"],
            "total_fired_excluded": dedup_result["total_fired_excluded"],
            "non_teaching_excluded": dedup_result.get("non_teaching_excluded", 0),
            "total_unique_active": dedup_result["total_unique_active"],
            "multi_contracts_merged": dedup_result["multi_contracts_merged"],
            "page": page,
            "limit": limit,
            "total_pages": (len(all_clean) + limit - 1) // limit,
            "items": paged_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HEMIS xodimlar tahlili xatoligi: {str(e)}")

@app.post("/api/hemis/sync")
def sync_hemis_teachers():
    """
    HEMIS dan faol professor-oʻqituvchilarni KPI tizimiga import qilish va sinxronlashtirish:
    - Dublikatlar toʻliq tozalanadi;
    - Butunlay ishlamaydigan (boʻshagan) shaxslar KPI tizimidan chiqarib tashlanadi;
    - Bir nechta faol stavkalar jamlanadi ($K_{shtat}$ hisobida);
    - Faqat faol ishlayotgan noyob oʻqituvchilar saqlanadi.
    """
    global RAW_TEACHERS, AUDIT_LOGS
    try:
        raw_items = fetch_all_hemis_raw_employees(employee_type="teacher")
        dedup_result = deduplicate_and_clean_hemis_employees(raw_items)
        active_clean = dedup_result["items"]

        # 1. Hozirda faol bo'lgan o'qituvchilarning xizmat kodlari va ismlari
        active_keys = {
            (c.get("employee_id_number") or c.get("full_name")).strip()
            for c in active_clean
        }

        # 2. Mavjud RAW_TEACHERS dan butunlay ishlamaydigan (HEMIS da bo'shagan)larni tozalash
        # (Faqat dastlabki tizim mudirlari va faol HEMIS o'qituvchilari qoladi)
        filtered_teachers = []
        for t in RAW_TEACHERS:
            # Agar o'qituvchi HEMIS faol ro'yxatida bo'lsa yoki dastlabki mudir bo'lsa qoldiramiz
            t_name = t.get("name", "")
            is_active_in_hemis = any(
                c["full_name"].lower() in t_name.lower() or t_name.lower() in c["full_name"].lower()
                for c in active_clean
            )
            if is_active_in_hemis or t.get("id") in [1, 2]:
                filtered_teachers.append(t)

        RAW_TEACHERS = filtered_teachers

        # 3. Faol tozalangan o'qituvchilarni sinxronlashtirish
        synced_count = 0
        existing_names = {t["name"].lower() for t in RAW_TEACHERS}

        for emp in active_clean:
            emp_name = emp["full_name"]
            pos_name = emp["position"]
            dept_name = emp["department"]
            degree_name = emp["degree"]
            fte_val = emp["fte"]

            # Agar mavjud bo'lsa yangilaymiz
            found = False
            for t in RAW_TEACHERS:
                if t["name"].lower() == emp_name.lower() or t.get("id") == emp["id"]:
                    t["department"] = dept_name
                    t["position"] = pos_name
                    t["fte"] = fte_val
                    t["degree"] = degree_name
                    if emp.get("image"):
                        t["image"] = emp.get("image")
                    found = True
                    break

            # Agar yangi bo'lsa qo'shamiz
            if not found:
                new_teacher = {
                    "id": emp["id"],
                    "name": emp_name,
                    "faculty": resolve_faculty_from_dept(dept_name),
                    "department": dept_name,
                    "position": pos_name,
                    "degree": degree_name,
                    "fte": fte_val,
                    "track": "Umumiy pedagogik",
                    "is_first_year": False,
                    "is_head_of_dept": "mudir" in pos_name.lower(),
                    "image": emp.get("image"),
                    "oqv": 0.0,
                    "ilm": 0.0,
                    "xal": 0.0,
                    "man": 0.0,
                    "jarima": 0.0
                }
                RAW_TEACHERS.append(new_teacher)
                existing_names.add(emp_name.lower())
                synced_count += 1

        # Audit jurnaliga yozish
        audit_msg = (
            f"HEMIS tozalash va sinxronizatsiya: {dedup_result['total_fired_excluded']} nafar boʻshagan xodim "
            f"chiqarib tashlandi, {dedup_result['multi_contracts_merged']} nafar xodimning oʻrindoshligi birlashtirildi, "
            f"jami {len(RAW_TEACHERS)} nafar faol oʻqituvchi KPI tizimida qoldi."
        )
        AUDIT_LOGS.insert(0, {
            "id": len(AUDIT_LOGS) + 1,
            "time": "2026-10-01 21:20",
            "user": "admin",
            "action": audit_msg
        })

        return {
            "success": True,
            "raw_total_records": dedup_result["raw_total_records"],
            "total_fired_excluded": dedup_result["total_fired_excluded"],
            "multi_contracts_merged": dedup_result["multi_contracts_merged"],
            "total_active_unique": len(active_clean),
            "synced_new_count": synced_count,
            "total_teachers_in_kpi": len(RAW_TEACHERS),
            "message": (
                f"Sinxronizatsiya muvaffaqiyatli yakunlandi: {dedup_result['total_fired_excluded']} nafar boʻshagan xodim "
                f"chiqarildi, dublikatlar birlashtirildi. Faol {len(RAW_TEACHERS)} nafar pedagog tasdiqlandi."
            )
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sinxronizatsiya xatoligi: {str(e)}")



@app.on_event("startup")
def init_hemis_teachers_on_startup():
    """Server ishga tushganda HEMIS dan barcha faol pedagoglarni USERS_DB ga avtomatik toʻldirish"""
    try:
        raw_items = fetch_all_hemis_raw_employees(employee_type="teacher")
        dedup_result = deduplicate_and_clean_hemis_employees(raw_items)
        print(f"[STARTUP] HEMIS dan {dedup_result['total_unique_active']} nafar pedagog yuklandi. Jami foydalanuvchilar: {len(USERS_DB)}")
    except Exception as e:
        print(f"[STARTUP WARNING] HEMIS yuklashda xatolik: {e}")

@app.get("/api/download/nizom")
def download_nizom():
    file_path = "/Users/macbookprom1/Documents/KPI JBNUU/O_zMU_Jizzax_filiali_KPI_Nizomi_2026.docx"
    if os.path.exists(file_path):
        return FileResponse(
            path=file_path,
            filename="O_zMU_Jizzax_filiali_KPI_Nizomi_2026.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    raise HTTPException(status_code=404, detail="Nizom hujjati topilmadi")

# ==========================================
# EXCEL FORMATLANGAN EKSPORT XIZMATLARI (.XLSX)
# ==========================================

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

@app.get("/api/export/kpi-excel")
def export_kpi_excel():
    """
    Professor-oʻqituvchilar KPI reytingi va Svetafor koʻrsatkichlarini
    yuqori sifatli, professional formatlangan Excel (.xlsx) fayliga eksport qilish:
    - OʻzMU Jizzax filiali rasmiy header banneri;
    - Svetafor mezonlari boʻyicha avtomatik ranglar (Yashil, Sariq, Qizil);
    - Ustunlar kengligini avtomatik moslash;
    - Toʻliq chegaralar va oylik ustama miqdorlari.
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "KPI Reyting 2026"
    ws.views.sheetView[0].showGridLines = True

    # Shriftlar va uslublar
    font_main_title = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
    font_sub_title = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    font_meta = Font(name="Calibri", size=9, italic=True, color="475569")
    font_header = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    font_data = Font(name="Calibri", size=10, color="0F172A")
    font_data_bold = Font(name="Calibri", size=10, bold=True, color="0F172A")
    
    # Ranglar (Fills)
    fill_main_title = PatternFill(start_color="0F2942", end_color="0F2942", fill_type="solid")
    fill_sub_title = PatternFill(start_color="1B365D", end_color="1B365D", fill_type="solid")
    fill_meta = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
    fill_header = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    
    # Svetafor ranglari
    fill_green = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid") # Yashil fon
    font_green = Font(name="Calibri", size=10, bold=True, color="166534") # Yashil matn
    
    fill_yellow = PatternFill(start_color="FEF9C3", end_color="FEF9C3", fill_type="solid") # Sariq fon
    font_yellow = Font(name="Calibri", size=10, bold=True, color="854D0E") # Sariq matn
    
    fill_red = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid") # Qizil fon
    font_red = Font(name="Calibri", size=10, bold=True, color="991B1B") # Qizil matn

    # Chegaralar (Borders)
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    # 1. Asosiy sarlavha qatori
    ws.merge_cells("A1:P1")
    ws["A1"] = "OʻZBEKISTON MILLIY UNIVERSITETI JIZZAX FILIALI"
    ws["A1"].font = font_main_title
    ws["A1"].fill = fill_main_title
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 28

    # 2. Ichki sarlavha qatori
    ws.merge_cells("A2:P2")
    ws["A2"] = "PROFESSOR-OʻQITUVCHILAR KPI REYTINGI VA SVETAFOR TAHLILI (2025/2026-OʻQUV YILI)"
    ws["A2"].font = font_sub_title
    ws["A2"].fill = fill_sub_title
    ws["A2"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 22

    # 3. Meta axborot qatori
    ws.merge_cells("A3:P3")
    ws["A3"] = "Hujjat shakllantirilgan sana: 2026-yil 1-oktyabr | Tasdiqlangan KPI Nizomi talablari asosida avtomatik hisoblangan"
    ws["A3"].font = font_meta
    ws["A3"].fill = fill_meta
    ws["A3"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[3].height = 18

    # 4. Bo'sh oraliq qator
    ws.row_dimensions[4].height = 8

    # 5. Jadval ustunlari sarlavhasi
    headers = [
        "T/r",
        "HEMIS ID",
        "Professor-oʻqituvchi F.I.Sh.",
        "Kafedra / Boʻlinma",
        "Lavozimi",
        "Ilmiy darajasi",
        "Shtat (Kshtat)",
        "1-blok: Oʻquv (30)",
        "2-blok: Ilmiy (45)",
        "3-blok: Xalqaro (15)",
        "4-blok: Maʼnaviy (10)",
        "Jarima bali",
        "Jami xom ball",
        "Yakuniy ball (Syakuniy)",
        "Svetafor toifasi",
        "Belgilangan oylik ustama miqdori"
    ]

    header_row = 5
    ws.row_dimensions[header_row].height = 36

    for col_idx, h_text in enumerate(headers, start=1):
        cell = ws.cell(row=header_row, column=col_idx, value=h_text)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border

    # O'qituvchilarni hisoblash va tartiblash (Yakuniy ball bo'yicha kamayish tartibida)
    processed_teachers = []
    for t in RAW_TEACHERS:
        detail = calculate_kpi(t["oqv"], t["ilm"], t["xal"], t["man"], t["jarima"], t["fte"], t["is_first_year"])
        processed_teachers.append({
            "id": t["id"],
            "name": t["name"],
            "department": t.get("department", "—"),
            "position": t.get("position", "Oʻqituvchi"),
            "degree": t.get("degree", "Darajasiz"),
            "fte": t.get("fte", 1.0),
            "detail": detail
        })

    # Yakuniy ball bo'yicha saralash
    processed_teachers.sort(key=lambda x: x["detail"].normalized_score, reverse=True)

    current_row = 6
    for idx, t in enumerate(processed_teachers, start=1):
        d = t["detail"]
        s_yakuniy = d.normalized_score
        category = d.svetafor_zone  # "green", "yellow", "red"
        
        if category == "green":
            cat_fill = fill_green
            cat_font = font_green
        elif category == "yellow":
            cat_fill = fill_yellow
            cat_font = font_yellow
        else:
            cat_fill = fill_red
            cat_font = font_red

        cat_label = d.svetafor_label
        ustama_text = d.bonus_label

        # Qatordagi ma'lumotlar
        row_values = [
            idx,
            t["id"],
            t["name"],
            t["department"],
            t["position"],
            t["degree"],
            t["fte"],
            round(d.oqv, 1),
            round(d.ilm, 1),
            round(d.xal, 1),
            round(d.man, 1),
            round(d.jarima, 1),
            round(d.raw_total, 1),
            round(s_yakuniy, 1),
            cat_label,
            ustama_text
        ]

        ws.row_dimensions[current_row].height = 22

        for col_idx, val in enumerate(row_values, start=1):
            cell = ws.cell(row=current_row, column=col_idx, value=val)
            cell.font = font_data
            cell.border = thin_border

            # Hizalanish va maxsus ranglar
            if col_idx in [1, 2]: # T/r, ID
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in [3, 4]: # Ism, Kafedra
                cell.alignment = Alignment(horizontal="left", vertical="center")
            elif col_idx in [5, 6]: # Lavozim, Daraja
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in [7, 8, 9, 10, 11, 12, 13]: # Ballar va shtat
                cell.alignment = Alignment(horizontal="right", vertical="center")
            elif col_idx == 14: # Yakuniy ball
                cell.alignment = Alignment(horizontal="right", vertical="center")
                cell.font = font_data_bold
            elif col_idx == 15: # Svetafor toifasi
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.fill = cat_fill
                cell.font = cat_font
            elif col_idx == 16: # Ustama
                cell.alignment = Alignment(horizontal="left", vertical="center")
                cell.font = font_data_bold

        current_row += 1

    # Avtomatik ustun kengligi (Auto-fit column width)
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        # Sarlavha qatorlarini (1-3) hisobga olmaymiz chunki ular merge qilingan
        for cell in col[4:]:
            if cell.value:
                val_str = str(cell.value)
                max_len = max(max_len, len(val_str))
        ws.column_dimensions[col_letter].width = max(max_len + 4, 11)

    # Birinchi ustun kengligi
    ws.column_dimensions["A"].width = 6
    ws.column_dimensions["B"].width = 12
    ws.column_dimensions["C"].width = 32
    ws.column_dimensions["D"].width = 28
    ws.column_dimensions["P"].width = 34

    # BytesIO ga saqlab qaytarish
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    filename = "KPI_Reyting_OzMU_Jizzax_2026.xlsx"
    headers_resp = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers_resp
    )

@app.get("/api/export/hemis-excel")
def export_hemis_excel():
    """
    HEMIS axborot tizimidan sinxronlashtirilgan va saralangan toza professor-oʻqituvchilar
    roʻyxatini professional Excel (.xlsx) formatida eksport qilish:
    - Boʻshagan va dublikatlar chiqarib tashlangan;
    - Oʻrindoshlik shartnomalari yagona pedagogik stavkaga keltirilgan.
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "HEMIS Oʻqituvchilar Bazasi"
    ws.views.sheetView[0].showGridLines = True

    # Shriftlar va uslublar
    font_main_title = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
    font_sub_title = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    font_meta = Font(name="Calibri", size=9, italic=True, color="475569")
    font_header = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    font_data = Font(name="Calibri", size=10, color="0F172A")
    font_data_bold = Font(name="Calibri", size=10, bold=True, color="0F172A")

    fill_main = PatternFill(start_color="0F2942", end_color="0F2942", fill_type="solid")
    fill_sub = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    fill_meta = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
    fill_header = PatternFill(start_color="0284C7", end_color="0284C7", fill_type="solid")

    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    # Sarlavhalar
    ws.merge_cells("A1:J1")
    ws["A1"] = "OʻZBEKISTON MILLIY UNIVERSITETI JIZZAX FILIALI"
    ws["A1"].font = font_main_title
    ws["A1"].fill = fill_main
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 28

    ws.merge_cells("A2:J2")
    ws["A2"] = "HEMIS AXBOROT TIZIMI: TOZALANGAN PROFESSOR-OʻQITUVCHILAR REYESTRI"
    ws["A2"].font = font_sub_title
    ws["A2"].fill = fill_sub
    ws["A2"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 22

    ws.merge_cells("A3:J3")
    ws["A3"] = "Boʻshaganlar chetlatilgan | Oʻrindoshlik stavkalari birlashtirilgan | Eksport: 2026-10-01"
    ws["A3"].font = font_meta
    ws["A3"].fill = fill_meta
    ws["A3"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[3].height = 18

    ws.row_dimensions[4].height = 8

    col_headers = [
        "T/r",
        "HEMIS ID",
        "Professor-oʻqituvchi F.I.Sh.",
        "Kafedra / Boʻlim",
        "Lavozimi",
        "Ilmiy daraja",
        "Ilmiy unvon",
        "Pedagogik stavka",
        "Asosiy ish shakli",
        "Qoʻshimcha oʻrindoshlik / lavozimlar"
    ]

    ws.row_dimensions[5].height = 32
    for col_idx, h_text in enumerate(col_headers, start=1):
        cell = ws.cell(row=5, column=col_idx, value=h_text)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border

    # HEMIS dan yuklash
    raw_items = fetch_all_hemis_raw_employees(employee_type="teacher")
    dedup = deduplicate_and_clean_hemis_employees(raw_items)
    employees = dedup["items"]

    current_row = 6
    for idx, emp in enumerate(employees, start=1):
        ws.row_dimensions[current_row].height = 20
        row_vals = [
            idx,
            emp.get("employee_id_number") or emp.get("id"),
            emp.get("full_name"),
            emp.get("department"),
            emp.get("position"),
            emp.get("degree"),
            emp.get("rank"),
            emp.get("fte"),
            emp.get("employment_form"),
            emp.get("additional_positions") or "Mavjud emas"
        ]

        for col_idx, val in enumerate(row_vals, start=1):
            cell = ws.cell(row=current_row, column=col_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            if col_idx in [1, 2]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in [3, 4, 10]:
                cell.alignment = Alignment(horizontal="left", vertical="center")
            elif col_idx in [5, 6, 7, 9]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx == 8:
                cell.alignment = Alignment(horizontal="right", vertical="center")
                cell.font = font_data_bold

        current_row += 1

    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col[4:]:
            if cell.value:
                val_str = str(cell.value)
                max_len = max(max_len, len(val_str))
        ws.column_dimensions[col_letter].width = max(max_len + 3, 11)

    ws.column_dimensions["A"].width = 6
    ws.column_dimensions["B"].width = 12
    ws.column_dimensions["C"].width = 34
    ws.column_dimensions["D"].width = 28
    ws.column_dimensions["J"].width = 40

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    filename = "HEMIS_Oqituvchilar_OzMU_Jizzax_2026.xlsx"
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)

