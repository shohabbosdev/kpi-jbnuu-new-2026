# OʻzMU Jizzax Filiali — KPI Axborot Tizimi (2026)

Oʻzbekiston Milliy universitetining Jizzax filiali professor-oʻqituvchilari va kafedralari faoliyati samaradorligini baholash (KPI), HEMIS axborot tizimi bilan toʻliq integratsiyalashgan, 41 ta mezon asosida Svetafor usulida tahlil qiluvchi va ustamalarni avtomatlashtirilgan tarzda hisoblovchi yagona platforma.

---

## 📌 Asosiy imkoniyatlar

1. **HEMIS Axborot Tizimi bilan toʻliq integratsiya:**
   - Kafedralar va xodimlar roʻyxatini HEMIS API orqali avtomatlashtirilgan sinxronlash.
   - Dublikat shartnomalarni tozalash (pedagogik shtat mezoni boʻyicha K_shtat hisobi).
   - Universitetda ishlamaydigan (boʻshagan) sobiq xodimlarni filtrlash.
   - Birlamchi login va parol sifatida HEMIS ID orqali kirish hamda birinchi kirishda majburiy yangi xavfsiz parol oʻrnatish mexanizmi.

2. **Dinamik baholash va CRUD arxitekturasi:**
   - 41 ta mezon (4 ta asosiy blok: *Oʻquv-metodik*, *Ilmiy-tadqiqot*, *Xalqaro hamkorlik*, *Maʼnaviy-maʼrifiy*).
   - Administrator uchun barcha mezonlar, foydalanuvchilar, rollar va tizim sozlamalarini toʻliq boshqarish (qoʻshish, tahrirlash, arxivlash).
   - Manfaatlar toʻqnashuvining oldini olish (Anti Self-Approval).

3. **Svetafor monitoringi va ragʻbatlantirish:**
   - **Yashil toifa (71 – 100 ball):** 70% dan 100% gacha oylik ustama.
   - **Sariq toifa (40 – 70 ball):** 40% ustama yoki bir martalik ragʻbatlantirish.
   - **Qizil toifa (40 balldan past):** Ustama belgilanmaydi (tanqidiy tahlil).

4. **Xavfsizlik va foydalanuvchi tajribasi:**
   - 30 daqiqa harakatsizlikda avtomatik sessiyani yakunlash (Auto Logout).
   - Sahifa yangilanganda (hard refresh) joriy holat, sahifa va filtrlarni saqlab qolish (`localStorage`).
   - Toʻliq qorongʻi (dark) va yorugʻ (light) rejimlar (yuqori kontrastli va charchatmaydigan ranglar palitrasi).
   - Rasmiy Nizom va qarorlarni Word (`.docx`) hamda KPI reytingini toʻliq formatlangan Excel (`.xlsx`) koʻrinishida yuklab olish.
   - Audit va xavfsizlik jurnali (barcha amallar qaydnomasi).

---

## 🏗 Arxitektura

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons.
- **Backend:** FastAPI (Python 3.12), Pydantic, Uvicorn, Python-docx, OpenPyXL.
- **Tashqi API:** HEMIS REST API v1 (`https://student.jbnuu.uz/rest/v1`).
- **Autentifikatsiya:** JWT / Session token, SHA-256 xeshlash, xavfsiz `.env` parametrlari.

---

## 🚀 Oʻrnatish va ishga tushirish

### 1. Repozitoriyni klonlash
```bash
git clone https://github.com/shohabbosdev/kpi-jbnuu-new-2026.git
cd kpi-jbnuu-new-2026
```

### 2. Backendni ishga tushirish (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn requests python-docx openpyxl python-dotenv

# Konfiguratsiyani sozlash:
cp .env.example .env
# .env fayliga HEMIS API tokenni kiriting

uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

### 3. Frontendni ishga tushirish (Next.js)
```bash
cd ../frontend
npm install
npm run build
npm run start -- -p 3000
```
### 4. Docker & Docker Compose orqali ishga tushirish (Tavsiya etiladi)

Loyiha toʻliq konteynerlashtirilgan. Barcha xizmatlarni (Frontend, Backend, Nginx) birgina buyruq bilan ishga tushirish mumkin:

```bash
# Konteynerlarni yig'ish va ishga tushirish:
docker compose up -d --build

# Konteynerlar holatini tekshirish:
docker compose ps

# Loglarni kuzatish:
docker compose logs -f
```
Platforma manzillari:
- **Asosiy tizim (Nginx orqali):** `http://localhost` (Port 80)
- **Frontend (Next.js):** `http://localhost:3000`
- **Backend API (FastAPI):** `http://localhost:8080/docs`

> **Fayl yuklash cheklovi:** Tizimda xavfsizlik va server barqarorligini taʼminlash maqsadida bitta asoslovchi hujjat hajmi **maksimal 10 MB** (PDF, DOCX, ZIP, JPG, PNG) etib belgilangan. Ushbu qoida Nginx (`client_max_body_size 10M`), FastAPI backend va Frontend formalarida qatʼiy nazorat qilinadi.

---

## 🔒 Xavfsizlik

- Shaxsga doir maxfiy maʼlumotlar (pasport seriyasi, jshshir, tugʻilgan sana, yashash manzili) bazada saqlanmaydi.
- HEMIS API tokeni faqat server muhitida `.env` orqali himoyalanadi va mijozga uzatilmaydi.
