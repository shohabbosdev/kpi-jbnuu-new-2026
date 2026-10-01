// OʻzMU Jizzax filiali KPI axborot tizimi maʼlumotlari

export const INDICATORS = [
  // I. O'quv va o'quv-uslubiy faoliyat (30 ball)
  { id: '1.1', block: 'oqv', name: 'Nashr etilgan darslik (vazirlik yoki OTM grifi, ISBN raqami bilan)', maxBall: 6, validity: '2 yil', dept: 'Oʻquv-uslubiy boshqarma' },
  { id: '1.2', block: 'oqv', name: 'Nashr etilgan oʻquv qoʻllanma (ISBN raqami bilan)', maxBall: 4, validity: '1 yil', dept: 'Oʻquv-uslubiy boshqarma' },
  { id: '1.3', block: 'oqv', name: 'TOP-300 xorijiy OTM adabiyotlarini oʻzga tillardan tarjima qilganlik', maxBall: 6, validity: '2 yil', dept: 'Oʻquv boshqarma, Xalqaro boʻlim' },
  { id: '1.4', block: 'oqv', name: 'Videodars va virtual laboratoriya ishlab chiqqanlik (Jalingo studiyasi)', maxBall: 3, validity: '1 yil', dept: 'Raqamli taʼlim texnologiyalari markazi' },
  { id: '1.5', block: 'oqv', name: 'HEMIS axborot tizimiga sifatli oʻquv kontentlarini toʻliq yuklaganlik', maxBall: 2, validity: '1 yil', dept: 'Oʻquv-uslubiy boshqarma' },
  { id: '1.6', block: 'oqv', name: 'TOP-300 dasturi asosida yangi fan dasturi va sillabus ishlab chiqqanlik', maxBall: 3, validity: '1 yil', dept: 'Oʻquv-uslubiy boshqarma' },
  { id: '1.7', block: 'oqv', name: 'Namunali ochiq dars mashgʻulotlarini oʻtkazganlik', maxBall: 1, validity: '1 yil', dept: 'Taʼlim sifatini nazorat qilish boʻlimi' },
  { id: '1.8', block: 'oqv', name: 'Respublika tarmoq markazlarida malaka oshirganlik (144 soat)', maxBall: 2, validity: '3 yil', dept: 'Oʻquv-uslubiy boshqarma' },
  { id: '1.9', block: 'oqv', name: 'Talabalar va hamkasblar oʻrtasidagi soʻrovnoma natijalari', maxBall: 4, validity: '1 yil', dept: 'Taʼlim sifatini nazorat qilish boʻlimi' },
  { id: '1.10', block: 'oqv', name: 'HEMIS tizimida talabalar davomatini kunlik namunali yuritganlik', maxBall: 2, validity: '1 yil', dept: 'Oʻquv boʻlimi' },

  // II. Ilmiy-tadqiqot va innovatsion faoliyat (40 ball)
  { id: '2.1', block: 'ilm', name: 'Falsafa doktori (PhD) yoki fan doktori (DSc) ilmiy darajasi mavjudligi', maxBall: 3, validity: 'Doimiy', dept: 'Ilmiy boʻlim, Kadrlar boʻlimi' },
  { id: '2.2', block: 'ilm', name: 'Ilmiy rahbarligida PhD yoki maslahatchiligida DSc kadr tayyorlaganlik', maxBall: 3, validity: '1 yil', dept: 'Ilmiy-tadqiqotlar boʻlimi' },
  { id: '2.3', block: 'ilm', name: 'Scopus va Web of Science (Q1, Q2 kvartildagi jurnallarda maqola)', maxBall: 8, validity: '1 yil', dept: 'Ilmiy-tadqiqotlar boʻlimi' },
  { id: '2.4', block: 'ilm', name: 'Scopus va Web of Science (Q3, Q4 kvartildagi jurnallarda maqola)', maxBall: 6, validity: '1 yil', dept: 'Ilmiy-tadqiqotlar boʻlimi' },
  { id: '2.5', block: 'ilm', name: 'Scopus/WoS indeksatsiyalangan xalqaro konferensiyalarda maqola nashri', maxBall: 4, validity: '1 yil', dept: 'Ilmiy-tadqiqotlar boʻlimi' },
  { id: '2.6', block: 'ilm', name: 'Scopus va Web of Science bazalaridagi Xirsh indeksi (h-index)', maxBall: 5, validity: '1 yil', dept: 'Ilmiy-tadqiqotlar boʻlimi' },
  { id: '2.7', block: 'ilm', name: 'OAK roʻyxatidagi xorijiy va mahalliy ilmiy jurnallarda maqola chop etish', maxBall: 4, validity: '1 yil', dept: 'Ilmiy-tadqiqotlar boʻlimi' },
  { id: '2.8', block: 'ilm', name: 'Monografiya yozganlik va lugʻat tuzganlik (ISBN raqami bilan)', maxBall: 4, validity: '1 yil', dept: 'Ilmiy-tadqiqotlar boʻlimi' },
  { id: '2.9', block: 'ilm', name: 'Ilmiy-tadqiqot samaradorligi: patent (ixtiro, sanoat namunasi)', maxBall: 5, validity: '1 yil', dept: 'Tijoratlashtirish boʻlimi' },
  { id: '2.10', block: 'ilm', name: 'Dasturiy vositalar uchun mualliflik guvohnomasi (DGU) olish', maxBall: 3, validity: '1 yil', dept: 'Tijoratlashtirish boʻlimi' },
  { id: '2.11', block: 'ilm', name: 'Sohalar buyurtmalari (xoʻjalik shartnomalari) asosida tushgan mablagʻ', maxBall: 6, validity: '1 yil', dept: 'Tijoratlashtirish boʻlimi' },
  { id: '2.12', block: 'ilm', name: 'Davlat ilmiy-texnika dasturlari va grantlariga rahbarlik qilish', maxBall: 8, validity: 'Loyiha muddati', dept: 'Ilmiy boʻlim, Tijoratlashtirish' },

  // III. Xalqaro hamkorlik faoliyati (20 ball)
  { id: '3.1', block: 'xal', name: 'TOP-1000 xorijiy OTMlarda oʻquv mashgʻulotlari (maʼruzalar) oʻtkazganlik', maxBall: 4, validity: '1 yil', dept: 'Xalqaro hamkorlik boʻlimi' },
  { id: '3.2', block: 'xal', name: 'Xalqaro ilmiy loyihalarda (Erasmus+, Horizon, KOICA) rahbarlik yoki aʼzolik', maxBall: 4, validity: 'Loyiha muddati', dept: 'Xalqaro hamkorlik boʻlimi' },
  { id: '3.3', block: 'xal', name: 'Xorijiy tilni bilish boʻyicha xalqaro sertifikat (IELTS, TOEFL, CEFR B2/C1)', maxBall: 3, validity: 'Sertifikat muddati', dept: 'Xalqaro hamkorlik boʻlimi' },
  { id: '3.4', block: 'xal', name: 'Mutaxassislik fanlarini toʻliq chet tilida oʻqitish', maxBall: 2, validity: '6 oy', dept: 'Oʻquv boshqarma, Xalqaro boʻlim' },
  { id: '3.5', block: 'xal', name: 'Xorijiy nufuzli OTMda malaka oshirish yoki stajirovka oʻtaganlik', maxBall: 4, validity: '1 yil', dept: 'Xalqaro hamkorlik boʻlimi' },
  { id: '3.6', block: 'xal', name: 'Xorijiy investitsiya va grant mablagʻlarini filial hisobiga jalb etganlik', maxBall: 3, validity: '1 yil', dept: 'Xalqaro boʻlim, Buxgalteriya' },
  { id: '3.7', block: 'xal', name: 'Taʼlim eksportini amalga oshirganlik (xorijiy fuqarolarni jalb qilish)', maxBall: 2, validity: '1 yil', dept: 'Xalqaro hamkorlik boʻlimi' },

  // IV. Ijtimoiy-ma'naviy faoliyat va bandlik (10 ball)
  { id: '4.1', block: 'man', name: 'Bitiruvchi shogirdlarni mutaxassisligi boʻyicha ishga joylashtirish (YAMMT)', maxBall: 4, validity: '1 yil', dept: 'Marketing va bandlik boʻlimi' },
  { id: '4.2', block: 'man', name: 'Korxonalar bilan bitiruvchilarni ishga olish boʻyicha 3 tomonlama shartnomalar', maxBall: 2, validity: '1 yil', dept: 'Marketing va bandlik boʻlimi' },
  { id: '4.3', block: 'man', name: 'Ijtimoiy, maʼnaviy va maʼrifiy tadbirlarni namunali tashkil etganlik', maxBall: 2, validity: '1 yil', dept: 'Yoshlar bilan ishlash boʻlimi' },
  { id: '4.4', block: 'man', name: 'Talabalar oʻrtasida doimiy ishlovchi fan va ijodiy toʻgaraklar rahbarligi', maxBall: 2, validity: '1 yil', dept: 'Yoshlar bilan ishlash boʻlimi' },
  { id: '4.5', block: 'man', name: 'Akademik guruh murabbiyi sifatida talabalar davomatini (90%+) taʼminlash', maxBall: 2, validity: '1 yil', dept: 'Yoshlar bilan ishlash boʻlimi' },
  { id: '4.6', block: 'man', name: 'Markaziy ommaviy axborot vositalarida tahliliy maqolalar bilan chiqish qilish', maxBall: 1, validity: '1 yil', dept: 'Matbuot xizmati' },
];

export const TEACHERS_DATA = [
  {
    id: 1,
    name: 'Prof. Rahimov Ulugʻbek Shavkatovich',
    faculty: 'Axborot texnologiyalari fakulteti',
    department: 'Dasturiy injiniring kafedrasi',
    position: 'Kafedra mudiri, professor',
    degree: 'Fan doktori (DSc)',
    fte: 1.0,
    track: 'Tadqiqotchi',
    isFirstYear: false,
    isHeadOfDept: true,
    scores: { oqv: 26, ilm: 40, xal: 18, man: 8, jarima: 0 },
    rawIlm: 48,
    bonusMonthly: '100 foiz oylik ustama'
  },
  {
    id: 2,
    name: 'Dots. Karimov Jamshid Anvarovich',
    faculty: 'Axborot texnologiyalari fakulteti',
    department: 'Amaliy matematika va informatika kafedrasi',
    position: 'Dotsent',
    degree: 'Falsafa doktori (PhD)',
    fte: 1.0,
    track: 'Tadqiqotchi',
    isFirstYear: false,
    isHeadOfDept: false,
    scores: { oqv: 22, ilm: 38, xal: 16, man: 6, jarima: 0 },
    rawIlm: 38,
    bonusMonthly: '70 foiz oylik ustama'
  },
  {
    id: 3,
    name: 'Sobirova Nilufar Rustamovna',
    faculty: 'Axborot texnologiyalari fakulteti',
    department: 'Dasturiy injiniring kafedrasi',
    position: 'Katta oʻqituvchi',
    degree: 'Magistr',
    fte: 1.0,
    track: 'Pedagog-metodist',
    isFirstYear: false,
    isHeadOfDept: false,
    scores: { oqv: 28, ilm: 18, xal: 8, man: 10, jarima: 0 },
    rawIlm: 18,
    bonusMonthly: '40 foiz oylik ustama'
  },
  {
    id: 4,
    name: 'Abdullayev Sardor Ikrom oʻgʻli',
    faculty: 'Axborot texnologiyalari fakulteti',
    department: 'Dasturiy injiniring kafedrasi',
    position: 'Assistent',
    degree: 'Magistr',
    fte: 0.5,
    track: 'Pedagog-metodist',
    isFirstYear: true,
    isHeadOfDept: false,
    scores: { oqv: 14, ilm: 4, xal: 3, man: 4, jarima: 0 },
    rawIlm: 4,
    bonusMonthly: '40 foiz oylik ustama'
  },
  {
    id: 5,
    name: 'Toshev Rustam Erkinovich',
    faculty: 'Iqtisodiyot va tabiiy fanlar fakulteti',
    department: 'Iqtisodiyot kafedrasi',
    position: 'Oʻqituvchi',
    degree: 'Magistr',
    fte: 1.0,
    track: 'Pedagog-metodist',
    isFirstYear: false,
    isHeadOfDept: false,
    scores: { oqv: 18, ilm: 8, xal: 2, man: 4, jarima: -6 },
    rawIlm: 8,
    bonusMonthly: 'Belgilanmagan'
  },
  {
    id: 6,
    name: 'Dots. Umarova Dilfuza Mahmudovna',
    faculty: 'Pedagogika va gumanitar fanlar fakulteti',
    department: 'Xorijiy tillar kafedrasi',
    position: 'Dotsent',
    degree: 'Falsafa doktori (PhD)',
    fte: 1.0,
    track: 'Pedagog-metodist',
    isFirstYear: false,
    isHeadOfDept: false,
    scores: { oqv: 27, ilm: 24, xal: 18, man: 8, jarima: 0 },
    rawIlm: 24,
    bonusMonthly: '70 foiz oylik ustama'
  }
];

export const RECENT_SUBMISSIONS = [
  {
    id: 101,
    teacherId: 3,
    teacherName: 'Sobirova Nilufar Rustamovna',
    indicatorId: '1.4',
    title: '«Algoritmlarni loyihalash» fani boʻyicha 12 ta videodarslar toʻplami',
    submittedAt: '2026-09-28',
    status: 'pending',
    ball: 3,
    files: 'videodarslar_dalolatnomasi.pdf',
    dept: 'Raqamli taʼlim texnologiyalari markazi'
  },
  {
    id: 102,
    teacherId: 1,
    teacherName: 'Prof. Rahimov Ulugʻbek Shavkatovich',
    indicatorId: '2.3',
    title: 'Expert Systems with Applications (Scopus Q1) jurnalida ilmiy maqola',
    submittedAt: '2026-09-29',
    status: 'approved',
    ball: 8,
    files: 'scopus_q1_maqola_doi_10_1016.pdf',
    dept: 'Ilmiy-tadqiqotlar boʻlimi'
  },
  {
    id: 103,
    teacherId: 4,
    teacherName: 'Abdullayev Sardor Ikrom oʻgʻli',
    indicatorId: '3.3',
    title: 'IELTS 7.0 xalqaro til sertifikati (yosh mutaxassis koeffitsiyenti)',
    submittedAt: '2026-09-30',
    status: 'pending',
    ball: 3,
    files: 'ielts_7_sertifikati.pdf',
    dept: 'Xalqaro hamkorlik boʻlimi'
  }
];
