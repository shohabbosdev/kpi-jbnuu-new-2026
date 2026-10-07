# Oʻzbekiston Milliy universiteti Jizzax filiali — KPI axborot tizimi (2026)

> **Rasmiy veb-manzil:** [https://jbnuu.uz/kpi/](https://jbnuu.uz/kpi/)  
> **Ishlab chiquvchi:** OʻzMU Jizzax filiali Axborot texnologiyalari va raqamlashtirish boʻlimi  
> **Arxitektura:** Clean Architecture, RBAC (Multi-role), Relational SQLite (WAL Mode), Next.js 16 (App Router), FastAPI (Python 3.11), E-IMZO (PKCS#7).

---

## 📋 Mundarija

1. [Loyiha haqida](#loyiha-haqida)
2. [Toʻliq bajarilgan ishlar va funksional imkoniyatlar (Ipidan ignasigacha)](#toliq-bajarilgan-ishlar)
   - [1. E-IMZO (Elektron Raqamli Imzo) integratsiyasi va aqlli interfeys](#1-e-imzo-integratsiyasi)
   - [2. Koʻp rolli (Multi-role) RBAC boshqaruvi](#2-kop-rolli-rbac)
   - [3. HEMIS axborot tizimi bilan chuqur integratsiya](#3-hemis-integratsiyasi)
   - [4. Kengashlar zanjiri: Darslik, qoʻllanma va monografiyalar](#4-nashrlar-kengashlar-zanjiri)
   - [5. Fan silabuslari va oʻquv-uslubiy majmualar ekspertizasi](#5-silabuslar-ekspertizasi)
   - [6. QR-kodli elektron verifikatsiya tizimi](#6-qr-verifikatsiya)
   - [7. Axborot xavfsizligi, kriptografiya va maʼlumotlar yaxlitligi](#7-axborot-xavfsizligi)
   - [8. Yuqori yuklama (Concurrency) va relyatsion baza meʼmori](#8-yuqori-yuklama)
   - [9. KPI reytingi, Svetafor tahlili va Excel hisobot eksporti](#9-kpi-va-excel)
3. [Texnologiyalar steki](#texnologiyalar-steki)
4. [Tizim rollari va ruxsatlar matritsasi](#tizim-rollari)
5. [Oʻrnatish va ishlab chiqarish muhitida ishga tushirish](#ornatish-va-ishga-tushirish)
6. [Xavfsizlik va shaxsga doir maʼlumotlar muhofazasi](#xavfsizlik-va-muhofaza)

---

## 🏛 Loyiha haqida

Oʻzbekiston Milliy universitetining Jizzax filiali professor-oʻqituvchilari va kafedralari faoliyati samaradorligini baholash (KPI) tizimi oliy taʼlim muassasasi Ilmiy kengashi tasdiqlagan rasmiy Nizom talablari asosida yaratilgan. Tizim oliygohdagi barcha oʻqituvchilarning oʻquv-uslubiy, ilmiy-tadqiqot, xalqaro hamkorlik hamda maʼnaviy-maʼrifiy yoʻnalishlardagi faoliyatini adolatli, shaffof va avtomatlashtirilgan tarzda baholab, oylik ustamalarni hisoblashga xizmat qiladi.

---

## 🛠 Toʻliq bajarilgan ishlar va funksional imkoniyatlar

### 1. E-IMZO (Elektron Raqamli Imzo) integratsiyasi va aqlli interfeys
- **Mahalliy E-IMZO agenti bilan toʻgʻridan-toʻgʻri aloqa:** Brauzer orqali foydalanuvchi kompyuteridagi rasmiy E-IMZO moduli (`127.0.0.1:64443`) bilan xavfsiz JSON-RPC protokoli orqali ulanish yoʻlga qoʻyildi.
- **Bir martalik tasdiq kodi (Challenge-Response):** Soxta imzolardan himoyalanish uchun backend tomonidan har bir kirish soʻrovi uchun vaqtinchalik noyob `challenge` generatsiya qilinadi.
- **PKCS#7 raqamli imzo:** Kalit paroli brauzerga kiritilmaydi; agent oʻzining himoyalangan tizimli dialog oynasida parolni soʻraydi va kriptografik imzo hosil qiladi.
- **JSHSHIR va STIR boʻyicha avtomatik autentifikatsiya:** Sertifikat ichidagi JSHSHIR (PINFL) va STIR orqali xodim tizim bazasidan bir zumda topiladi va sessiya ochiladi.
- **Aqlli Custom Dropdown Select komponenti:**
  - Foydalanuvchida bir nechta (hatto 10–20 ta) ERI kalitlari mavjud boʻlganda sahifa pastga choʻzilib ketmaydi.
  - Jonli qidiruv maydoni (Search): Ism-familiya, JSHSHIR yoki STIR raqami boʻyicha real vaqtda saralash.
  - Har bir variantda xodim F.I.Oʼsi, JSHSHIR (niqoblangan), STIR, tashkilot nomi va amal qilish muddati koʻrsatiladi.
  - Tanlov ostida ixcham **Sertifikat pasporti** mikro-kartasi va tashqariga bosilganda avtomatik yopilish (outside-click) mexanizmi joriy etildi.

---

### 2. Koʻp rolli (Multi-role) RBAC boshqaruvi
- **Bitta xodimga bir nechta rol biriktirish imkoniyati:** Amaliyotda uchraydigan holatlar (masalan, Kafedra mudiri yoki Fakultet dekani ayni paytda oʻqituvchi sifatida oʻz KPI arizalarini ham topshirishi zarurligi) toʻliq hisobga olindi.
- **Maʼmuriy boshqaruvda koʻp rolli checkboxlar:** Administrator xodim profilini tahrirlashda unga bir vaqtning oʻzida ham `HEAD_OF_DEPT`, ham `TEACHER`, yoki `DEAN` rollarini belgilay oladi.
- **Rollar oʻrtasida bir zumda almashish (Role Switcher Dropdown):** Foydalanuvchi tizimdan chiqmasdan turib, yuqori menyudagi tugma orqali faol rolini soniyalar ichida almashtira oladi.
- **Barcha rollar boʻyicha toʻliq filtr va hisoblagichlar:**
  - `Barchasi` (`ALL`);
  - `Oʻqituvchilar` (`TEACHER`);
  - `Kafedra mudirlari` (`HEAD_OF_DEPT`);
  - `Fakultet dekanlari` (`DEAN`);
  - `Filial rahbariyati` (`RECTORATE`);
  - `Administratorlar` (`ADMIN`).
  - Har bir filtr tugmasi yonida jonli son nishoni (badge) aks etadi. Koʻp rolli xodimlar oʻzlariga tegishli barcha filtrlar ostida toʻgʻri chiqadi.

---

### 3. HEMIS axborot tizimi bilan chuqur integratsiya
- **Tashkiliy ierarxiyani sinxronlash:** Oliy taʼlim muassasasining barcha 3 ta fakulteti va 9 ta kafedralari HEMIS API orqali tortib olinadi.
- **197 nafar professor-oʻqituvchilar bazasi:** HEMIS tizimidagi barcha faol pedagog xodimlar toʻliq KPI bazasiga integratsiya qilindi.
- **Dublikat shartnomalarni tozalash (Deduplication):** Bir xodimning asosiy va ichki oʻrindoshlik shartnomalari jamlanib, haqiqiy pedagogik stavkasi ($K_{shtat}: 1.0, 1.25, 1.50$) aniqlanadi.
- **Boʻshagan xodimlarni filtrlash:** Filialda rasman ishlamayotgan xodimlar avtomatik filtrlanadi.
- **Birlamchi kirish va majburiy parol almashtirish:** Xodimlar HEMIS ID raqamlari orqali tizimga birinchi marta kirganda, xavfsizlik nuqtai nazaridan yangi mustahkam shaxsiy parol oʻrnatishlari majburiy qilingan.

---

### 4. Kengashlar zanjiri: Darslik, qoʻllanma va monografiyalar
- **Toʻliq hujjatlar toʻplamini topshirish:** Oʻqituvchi oʻz nashri boʻyicha qoʻlyozma, ichki taqriz, tashqi taqriz, oʻquv dasturi, antiplagiat xulosasi va antiplagiat oʻxshashlik foizini yuklaydi.
- **4 bosqichli kengashlar ketma-ketligi:**
  1. *Kafedra yigʻilishi muhokamasi;*
  2. *Fakultet Ilmiy-uslubiy kengashi;*
  3. *Filial Oʻquv-uslubiy boshqarmasi ekspertizasi;*
  4. *Filial Kengashi yakuniy qarori.*
- **Rasmiy maʼlumotlar fiksatsiyasi:** Har bir bosqichda bayonnoma raqami, sanasi, tasdiqlovchi bayonnoma fayli hamda masʼul izohi qayd etiladi.
- **Davlat xizmatlari integratsiyasi:** Filial Kengashi tavsiyasidan soʻng, xodim my.gov.uz ariza raqami va Oliy taʼlim vazirligi grifi maʼlumotlarini kiritishi mumkin.

---

### 5. Fan silabuslari va oʻquv-uslubiy majmualar ekspertizasi
- **HEMIS oʻquv rejalari va fanlar bazasi:** Oʻquv rejasidagi fanlar, semestrlar, yuklamalar va biriktirilgan oʻqituvchilar bilan toʻliq bogʻlanish.
- **Fan dasturlarini yuklash va mudirlar ekspertizasi:** Kafedra mudiri va uslubchilar tomonidan silabuslar tekshirilib, baholanadi yoki qayta ishlash uchun asosli sabab bilan qaytariladi.

---

### 6. QR-kodli elektron verifikatsiya tizimi
- **Hujjat haqiqiyligini tekshirish:** Tasdiqlangan har bir darslik tavsiyanomasi va fan silabusiga kriptografik xavfsiz unikal `verification_token` biriktiriladi.
- **Ommaviy QR tekshiruv sahifasi:** Tashqi tashkilotlar yoki vazirlik vakillari hujjatdagi QR-kodni skaner qilganda tizimning `/api/verify/publication/{token}` yoki `/api/verify/course-doc/{token}` manzili orqali bayonnoma raqami, sanasi, antiplagiat koʻrsatkichlari va mualliflar tarkibining haqiqiyligini tekshira oladi.

---

### 7. Axborot xavfsizligi, kriptografiya va maʼlumotlar yaxlitligi
- **PBKDF2-SHA256 parollar xeshlash tizimi:**
  - Parollar ochiq matn (plaintext) holida saqlanmaydi.
  - Yangi yaratilgan [`backend/security.py`](file:///Users/macbookprom1/Documents/KPI%20JBNUU/backend/security.py) moduli orqali har bir parol 100 000 iteratsiyali PBKDF2-SHA256 va 16 baytli tasodifiy tuz (salt) bilan xeshlanadi.
  - **Shaffof avto-migratsiya:** Tizimga kirgan foydalanuvchilarning eski ochiq parollari tizim toʻxtamasdan, bir zumda avtomatik xeshga aylantiriladi.
- **Haqiqiy HMAC-SHA256 (HS256) JWT tokenlar:**
  - Login amalga oshirilganda raqamli imzolangan JWT token beriladi.
  - Frontend tokenni `localStorage` da saqlaydi va har bir soʻrovda `Authorization: Bearer <token>` sarlavhasida yuboradi.
- **IDOR va ruxsatlar nazorati (Server-side RBAC):**
  - Foydalanuvchi faqat oʻz arizasini oʻchira oladi (`/api/submissions/{id}`). Boshqalarning arizasini oʻchirishga urinish `403 Forbidden` bilan qaytariladi.
  - Arizalarni tasdiqlash (`/api/submissions/{id}/verify`) faqat vakolatli rollarga (`HEAD_OF_DEPT`, `DEAN`, `ADMIN`, `RECTORATE`) ruxsat etiladi.
  - Oʻqituvchi ariza topshirishda daʼvo qilayotgan ball mezonning maksimal chegarasidan oshib ketmasligi qatʼiy nazorat qilinadi (`min(claimed, max_ball)`).
- **Fayl yuklash himoyasi:** Path traversal xurujlarining oldi olindi (`os.path.basename` va belgilarni tozalash), ruxsat etilgan kengaytmalar roʻyxati va 10 MB hajm chegarasi kiritildi.

---

### 8. Yuqori yuklama (Concurrency) va relyatsion baza meʼmori
- **SQLite WAL (Write-Ahead Logging) rejimi:**
  - `PRAGMA journal_mode=WAL;`
  - `PRAGMA busy_timeout=10000;`
  - `PRAGMA synchronous=NORMAL;`
  - `PRAGMA foreign_keys=ON;`
  - Bir vaqtning oʻzida yuzlab oʻqituvchilar ariza yuklaganda yoki mudirlar tasdiqlaganda baza qotib qolmaydi (`database is locked` xatoligi bartaraf etildi).
- **Arizalar ID sini AUTOINCREMENT qilish:**
  - Sunʼiy `len()` formulasi oʻrniga SQLite ning tabiiy auto-increment mexanizmiga oʻtildi. Ikki foydalanuvchi bir vaqtda ariza topshirganda arizalar bir-birini ustiga yozilib ketishi (data overwrite) xavfi yoʻqotildi.

---

### 9. KPI reytingi, Svetafor tahlili va Excel hisobot eksporti
- **Jonli ballar agregatsiyasi:** Oʻqituvchilar yuklagan va tasdiqlangan arizalar 4 ta Nizom blokiga jamlanib, har bir oʻqituvchining sof va normallashtirilgan KPI ballari real vaqt rejimida hisoblab boriladi.
- **Barcha 197 nafar xodim reytingda:** Eski 12 ta mock oʻqituvchi oʻrniga filialning barcha haqiqiy pedagog xodimlari asosiy jadvalda oʻz kafedralari va stavkalari bilan chiqadi.
- **Professional formatlangan Excel eksport:** `/api/export/kpi-excel` endpointi orqali barcha 197 nafar xodimning reyting jadvali, svetafor ranglari (Yashil, Sariq, Qizil) va belgilangan oylik ustamalari koʻrsatilgan rasmiy shakldagi `.xlsx` hujjati yuklab olinadi.

---

## 💻 Texnologiyalar steki

| Qatlam | Texnologiya | Tavsifi |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4 | Yuqori unumdorlikka ega zamonaviy reaktiv SPA/SSR arxitekturasi |
| **Backend** | FastAPI, Python 3.11, Uvicorn (ASGI) | Asinxron REST API, qatʼiy Pydantic validatsiyasi va modulli tuzilma |
| **Xavfsizlik** | PBKDF2-SHA256, HMAC-SHA256 JWT, E-IMZO PKCS#7 | Kriptografik parollar muhofazasi va davlat standarti raqamli imzosi |
| **Maʼlumotlar bazasi** | SQLite 3 (WAL rejimi bilan) | ACID tranzaksiyalari, toʻliq relatsion jadvallar va avto-indekslar |
| **Hisobotlar** | OpenPyXL, Python-docx | Rasmiy qarorlar, reytinglar va Excel jadvallarini avtomatik generatsiyalash |
| **DevOps & Deploy** | Docker, Docker Compose, Nginx Reverse Proxy | Izolyatsiyalangan ishlab chiqarish konteynerlari va avtomatlashtirilgan CI/CD |

---

## 👥 Tizim rollari va ruxsatlar matritsasi

1. **Oʻqituvchi (`TEACHER`):** Oʻz shaxsiy kabinetida KPI arizalarini topshirish, rad etilgan arizalarga apellyatsiya berish, oʻz reytingi va ballari tahlilini koʻrish, nashrlar va fan silabuslarini kengashlarga taqdim etish.
2. **Kafedra mudiri (`HEAD_OF_DEPT`):** Kafedraga biriktirilgan barcha oʻqituvchilarning arizalarini tekshirish, ball qoʻyish yoki asosli sabab bilan rad etish, kafedra oʻqituvchilari reytingini monitoring qilish, 1-bosqich kengash bayonnomalarini rasmiylashtirish.
3. **Fakultet dekani (`DEAN`):** Fakultet tarkibidagi barcha kafedralar va xodimlar koʻrsatkichlarini nazorat qilish, manfaatlar toʻqnashuvi holatida kafedra mudirlarining arizalarini baholash, fakultet Ilmiy-uslubiy kengashi bosqichini tasdiqlash.
4. **Filial rahbariyati (`RECTORATE`):** Butun filial boʻyicha umumiy reyting, kafedralar va fakultetlar oʻrtasidagi qiyosiy tahlil, svetafor diagrammalari, tasdiqlangan rasmiy hisobotlarni koʻrish va eksport qilish.
5. **Administrator (`ADMIN`):** Tizim sozlamalari, baholash muddatlari va bosqichlarini belgilash, mezonlar bazasini boshqarish, foydalanuvchilar hisoblarini faollashtirish/bloklash, rollarni biriktirish, HEMIS sinxronizatsiyasi va xavfsizlik audit jurnallarini nazorat qilish.

---

## 🚀 Oʻrnatish va ishlab chiqarish muhitida ishga tushirish

### 1. Repozitoriyni klonlash
```bash
git clone https://github.com/shohabbosdev/kpi-jbnuu-new-2026.git
cd kpi-jbnuu-new-2026
```

### 2. Ishlab chiqarish (Production) serverida Docker orqali ishga tushirish
Loyiha `docker-compose.prod.yml` orqali toʻliq avtomatlashtirilgan:

```bash
# Konteynerlarni yig'ish va yangilash
docker compose -f docker-compose.prod.yml build backend frontend

# Konteynerlarni orqa fonda ishga tushirish
docker compose -f docker-compose.prod.yml up -d

# Konteynerlar holatini tekshirish
docker compose -f docker-compose.prod.yml ps
```

*Portlar xaritasi:*
- **Backend API:** `127.0.0.1:8095 -> 8080`
- **Frontend Next.js:** `127.0.0.1:3005 -> 3000`
- **Tashqi Nginx domeni:** `https://jbnuu.uz/kpi/`

---

## 🔒 Xavfsizlik va muhofaza

- **OʻRQ-547 talablariga muvofiqlik:** Xodimlarning shaxsga doir maʼlumotlari (JSHSHIR, STIR) ommaviy API javoblarida toʻliq koʻrsatilmaydi, balki `3512****21` koʻrinishida niqoblanadi (masking).
- **Brute-Force va DDoS himoyasi:** Notoʻgʻri parol 5 marta ketma-ket kiritilganda foydalanuvchi hisobi 15 daqiqaga, 1 ta IP dan 20 marta xato soʻrov yuborilganda IP manzil avtomatik bloklanadi.
- **Doimiy audit jurnali:** Tizimdagi har bir kirish, parol yangilanishi, ariza topshirilishi, baholanishi yoki rol oʻzgarishi vaqt, IP va xodim maʼlumotlari bilan birga relyatsion audit jadvalida muhrlanadi.

---
*Hujjat soʻnggi kiritilgan barcha texnik va xavfsizlik yangilanishlariga muvofiq toʻliq shakllantirildi.*
