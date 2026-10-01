import os
import io
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import requests
from dotenv import load_dotenv

# .env faylini yuklash
load_dotenv()
HEMIS_BASE_URL = os.getenv("HEMIS_BASE_URL", "https://student.jbnuu.uz/rest/v1")
HEMIS_API_TOKEN = os.getenv("HEMIS_API_TOKEN", "Qn8Jp7TVvpGdQUvWoqpBC1i0p7ukHKT0")


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
    teacher_id: int
    teacher_name: str
    indicator_id: str
    reason: str
    file_name: Optional[str] = None

class Appeal(BaseModel):
    id: str
    teacher_id: int
    teacher_name: str
    indicator_id: str
    reason: str
    submitted_date: str
    status: str
    decision: Optional[str] = None

class DoiLookupRequest(BaseModel):
    doi: str

class SystemSettings(BaseModel):
    academic_year: str
    submissions_open: bool
    deadline_date: str
    budget_cap_monthly: float

# ==========================================
# FOYDALANUVCHILAR VA XAVFSIZLIK BAZASI
# ==========================================

USERS_DB: Dict[str, Dict[str, Any]] = {
    "admin": {
        "id": 999,
        "password": "admin123",
        "name": "Tizim Administratori",
        "role": "ADMIN",
        "department": "Axborot texnologiyalari markazi",
        "faculty": "Filial maʼmuriyati",
        "position": "Bosh administrator",
        "degree": "Texnika fanlari nomzodi",
        "fte": 1.0
    },
    "mudir": {
        "id": 1,
        "password": "mudir123",
        "name": "Prof. Rahimov Ulugʻbek Shavkatovich",
        "role": "HEAD_OF_DEPT",
        "department": "Dasturiy injiniring kafedrasi",
        "faculty": "Axborot texnologiyalari fakulteti",
        "position": "Kafedra mudiri, professor",
        "degree": "Fan doktori (DSc)",
        "fte": 1.0
    },
    "oqituvchi": {
        "id": 2,
        "password": "oqituvchi123",
        "name": "Dots. Karimov Jamshid Anvarovich",
        "role": "TEACHER",
        "department": "Amaliy matematika va informatika kafedrasi",
        "faculty": "Axborot texnologiyalari fakulteti",
        "position": "Dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.0
    },
    "yosh": {
        "id": 4,
        "password": "yosh123",
        "name": "Abdullayev Sardor Ikrom oʻgʻli",
        "role": "TEACHER",
        "department": "Dasturiy injiniring kafedrasi",
        "faculty": "Axborot texnologiyalari fakulteti",
        "position": "Assistent",
        "degree": "Magistr",
        "fte": 0.5
    },
    "rektor": {
        "id": 888,
        "password": "rektor123",
        "name": "Filial Rahbariyati",
        "role": "RECTORATE",
        "department": "Filial rahbariyati",
        "faculty": "Rektorat",
        "position": "Filial direktori",
        "degree": "Professor",
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
        "name": "Prof. Rahimov Ulugʻbek Shavkatovich",
        "faculty": "Axborot texnologiyalari fakulteti",
        "department": "Dasturiy injiniring kafedrasi",
        "position": "Kafedra mudiri, professor",
        "degree": "Fan doktori (DSc)",
        "fte": 1.0,
        "track": "Tadqiqotchi",
        "is_first_year": False,
        "is_head_of_dept": True,
        "oqv": 26.0, "ilm": 48.0, "xal": 18.0, "man": 8.0, "jarima": 0.0
    },
    {
        "id": 2,
        "name": "Dots. Karimov Jamshid Anvarovich",
        "faculty": "Axborot texnologiyalari fakulteti",
        "department": "Amaliy matematika va informatika kafedrasi",
        "position": "Dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.0,
        "track": "Tadqiqotchi",
        "is_first_year": False,
        "is_head_of_dept": False,
        "oqv": 22.0, "ilm": 38.0, "xal": 16.0, "man": 6.0, "jarima": 0.0
    },
    {
        "id": 3,
        "name": "Sobirova Nilufar Rustamovna",
        "faculty": "Axborot texnologiyalari fakulteti",
        "department": "Dasturiy injiniring kafedrasi",
        "position": "Katta oʻqituvchi",
        "degree": "Magistr",
        "fte": 1.0,
        "track": "Pedagog-metodist",
        "is_first_year": False,
        "is_head_of_dept": False,
        "oqv": 28.0, "ilm": 18.0, "xal": 8.0, "man": 10.0, "jarima": 0.0
    },
    {
        "id": 4,
        "name": "Abdullayev Sardor Ikrom oʻgʻli",
        "faculty": "Axborot texnologiyalari fakulteti",
        "department": "Dasturiy injiniring kafedrasi",
        "position": "Assistent",
        "degree": "Magistr",
        "fte": 0.5,
        "track": "Pedagog-metodist",
        "is_first_year": True,
        "is_head_of_dept": False,
        "oqv": 14.0, "ilm": 4.0, "xal": 3.0, "man": 4.0, "jarima": 0.0
    },
    {
        "id": 5,
        "name": "Toshev Rustam Erkinovich",
        "faculty": "Iqtisodiyot va tabiiy fanlar fakulteti",
        "department": "Iqtisodiyot kafedrasi",
        "position": "Oʻqituvchi",
        "degree": "Magistr",
        "fte": 1.0,
        "track": "Pedagog-metodist",
        "is_first_year": False,
        "is_head_of_dept": False,
        "oqv": 18.0, "ilm": 8.0, "xal": 2.0, "man": 4.0, "jarima": -6.0
    },
    {
        "id": 6,
        "name": "Dots. Umarova Dilfuza Mahmudovna",
        "faculty": "Pedagogika va gumanitar fanlar fakulteti",
        "department": "Xorijiy tillar kafedrasi",
        "position": "Dotsent",
        "degree": "Falsafa doktori (PhD)",
        "fte": 1.0,
        "track": "Pedagog-metodist",
        "is_first_year": False,
        "is_head_of_dept": False,
        "oqv": 27.0, "ilm": 24.0, "xal": 18.0, "man": 8.0, "jarima": 0.0
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
        teacher_id=2,
        teacher_name="Dots. Karimov Jamshid Anvarovich",
        indicator_id="2.3",
        reason="Kvartil tasdiqnomasi yangilangan havola orqali ilova qilindi",
        submitted_date="2026-09-29",
        status="Jarayonda",
        decision="Ekspertiza jarayonida (Ilmiy boʻlim)"
    )
]

# ==========================================
# REST API ENDPOINTS
# ==========================================

@app.post("/api/auth/login", response_model=LoginResponse)
def login(creds: LoginRequest):
    username = creds.username.strip().lower()
    user_record = USERS_DB.get(username)

    if not user_record or user_record["password"] != creds.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Foydalanuvchi nomi (HEMIS ID) yoki maxfiy parol notoʻgʻri kiritildi"
        )

    must_change = user_record.get("must_change_password", False)

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
        must_change_password=must_change
    )

    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": "2026-10-01 21:35",
        "user": username,
        "action": f"Tizimga muvaffaqiyatli kirdi (Rol: {user_record['role']}, Birlamchi parol holati: {'Almashtirish shart' if must_change else 'Faol'})"
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
    user_record = USERS_DB.get(username)

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

    # Parolni yangilash
    user_record["password"] = req.new_password
    user_record["must_change_password"] = False

    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": "2026-10-01 21:36",
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

    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "user": teacher["name"],
        "action": f"Yangi KPI faoliyat natijasi yuklandi (#{new_sub.id}, Mezon: {new_sub.indicator_id}, Daʻvo qilingan ball: {new_sub.claimed_ball} ball)"
    })

    return new_sub

@app.post("/api/submissions/{sub_id}/verify")
def verify_submission(sub_id: int, action: VerificationAction):
    sub = next((s for s in SUBMISSIONS_DB if s.id == sub_id), None)
    if not sub:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    
    if sub.teacher_id == action.reviewer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manfaatlar toʻqnashuvi taqiqlanadi: Muallif oʻz arizasini tasdiqlashi mumkin emas. Ariza fakultet dekani yoki ilmiy boʻlimga yoʻnaltiriladi."
        )

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

        AUDIT_LOGS.insert(0, {
            "id": len(AUDIT_LOGS) + 1,
            "time": current_time_str,
            "user": action.reviewer_name,
            "action": f"#{sub.id} arizasi rad etildi (Muallif: {sub.teacher_name}). Rad etish sababi: «{reason}»"
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

        # O'qituvchining jami ballari blokini yangilash
        teacher = next((t for t in RAW_TEACHERS if t["id"] == sub.teacher_id), None)
        ind = next((i for i in INDICATORS_DB if i.id == sub.indicator_id), None)
        if teacher and ind:
            block_key = ind.block.lower()
            if block_key in teacher:
                teacher[block_key] = round((teacher[block_key] + final_ball) * 10) / 10

        AUDIT_LOGS.insert(0, {
            "id": len(AUDIT_LOGS) + 1,
            "time": current_time_str,
            "user": action.reviewer_name,
            "action": f"#{sub.id} arizasi tasdiqlandi (Muallif: {sub.teacher_name}, Qoʻyilgan ball: {final_ball} ball)"
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

@app.get("/api/appeals", response_model=List[Appeal])
def get_appeals():
    return APPEALS_DB

@app.post("/api/appeals", response_model=Appeal)
def create_appeal(appeal_in: AppealCreate):
    new_appeal = Appeal(
        id=f"AP-2026-{len(APPEALS_DB) + 10}",
        teacher_id=appeal_in.teacher_id,
        teacher_name=appeal_in.teacher_name,
        indicator_id=appeal_in.indicator_id,
        reason=appeal_in.reason,
        submitted_date="2026-10-01",
        status="Jarayonda",
        decision="Apellyatsiya komissiyasida koʻrib chiqilmoqda"
    )
    APPEALS_DB.append(new_appeal)
    return new_appeal

# ==========================================
# ADMIN ENDPOINTS
# ==========================================

@app.get("/api/settings", response_model=SystemSettings)
@app.get("/api/admin/settings", response_model=SystemSettings)
def get_system_settings():
    return SYSTEM_SETTINGS

@app.post("/api/admin/settings", response_model=SystemSettings)
def update_system_settings(new_settings: SystemSettings):
    global SYSTEM_SETTINGS
    SYSTEM_SETTINGS = new_settings
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
        "head_of_dept": 0,
        "rectorate": 0,
        "admin": 0
    }

    for k, v in USERS_DB.items():
        u_role = v.get("role", "TEACHER")
        if u_role == "ADMIN": stats["admin"] += 1
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

        # 5. Har bir o'qituvchiga HEMIS ID orqali birlamchi hisob yaratish
        if emp_id and emp_id.lower() not in USERS_DB:
            is_head = "mudir" in clean_item["position"].lower()
            USERS_DB[emp_id.lower()] = {
                "id": clean_item["id"],
                "username": emp_id,
                "password": emp_id,  # Birlamchi parol = HEMIS ID
                "must_change_password": True,  # Birinchi kirishda majburiy o'zgartirish
                "name": clean_item["full_name"],
                "role": "HEAD_OF_DEPT" if is_head else "TEACHER",
                "department": clean_item["department"],
                "faculty": "Filial fakultetlari",
                "position": clean_item["position"],
                "degree": clean_item["degree"],
                "fte": clean_item["fte"],
                "employee_id_number": emp_id
            }

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
                    found = True
                    break

            # Agar yangi bo'lsa qo'shamiz
            if not found:
                new_teacher = {
                    "id": emp["id"],
                    "name": emp_name,
                    "faculty": "Filial fakultetlari",
                    "department": dept_name,
                    "position": pos_name,
                    "degree": degree_name,
                    "fte": fte_val,
                    "track": "Umumiy pedagogik",
                    "is_first_year": False,
                    "is_head_of_dept": "mudir" in pos_name.lower(),
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

