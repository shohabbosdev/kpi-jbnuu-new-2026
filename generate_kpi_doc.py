import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_margins(cell, top=90, bottom=90, left=110, right=110):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex):
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading)

def set_table_borders(table, color="B0B0B0", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_p(doc, text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, bold=False, italic=False, size=14, space_after=4, line_spacing=1.15, first_line_indent=Inches(0.4)):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.line_spacing = line_spacing
    p.paragraph_format.space_after = Pt(space_after)
    if first_line_indent and align == WD_ALIGN_PARAGRAPH.JUSTIFY:
        p.paragraph_format.first_line_indent = first_line_indent
    
    if text:
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        run.font.name = 'Times New Roman'
        run.font.size = Pt(size)
        run.font.color.rgb = RGBColor(0, 0, 0)
    return p

def add_heading_p(doc, text, space_before=10, space_after=6, size=14, align=WD_ALIGN_PARAGRAPH.CENTER):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.bold = True
    run.font.name = 'Times New Roman'
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor(0, 0, 0)
    return p

def style_cell(cell, text, bold=False, italic=False, size=9, align=WD_ALIGN_PARAGRAPH.LEFT, bg_color=None):
    if bg_color:
        set_cell_shading(cell, bg_color)
    set_cell_margins(cell)
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p = cell.paragraphs[0]
    p.text = ""
    p.alignment = align
    p.paragraph_format.line_spacing = 1.05
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.first_line_indent = Inches(0)
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.name = 'Times New Roman'
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor(0, 0, 0)

def generate_unified_kpi_doc():
    doc = docx.Document()

    # Sahifa chegaralari (Davlat standarti: Chap 3.0 cm, O'ng 1.5 cm, Yuqori 2.0 cm, Pastki 2.0 cm)
    for section in doc.sections:
        section.top_margin = Inches(0.79)
        section.bottom_margin = Inches(0.79)
        section.left_margin = Inches(1.18)
        section.right_margin = Inches(0.59)

    # ==========================================
    # RASMIY BUYRUQ
    # ==========================================
    add_heading_p(doc, "OʻZBEKISTON RESPUBLIKASI OLIY TAʼLIM, FAN VA INNOVATSIYALAR VAZIRLIGI", space_before=0, space_after=2)
    add_heading_p(doc, "MIRZO ULUGʻBEK NOMIDAGI OʻZBEKISTON MILLIY UNIVERSITETI JIZZAX FILIALI", space_before=0, space_after=6)
    add_heading_p(doc, "FILIAL DIREKTORINING BUYRUGʻI (LOYIHA)", space_before=4, space_after=12)

    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.line_spacing = 1.15
    p_meta.paragraph_format.space_after = Pt(12)
    r_date = p_meta.add_run("2026-yil «___» __________\t\t\t\t___-sonli\t\t\t\tJizzax shahri")
    r_date.bold = True
    r_date.font.name = 'Times New Roman'
    r_date.font.size = Pt(14)

    add_heading_p(doc, "Mirzo Ulugʻbek nomidagi Oʻzbekiston Milliy universiteti Jizzax filiali professor-oʻqituvchilari faoliyatini asosiy samaradorlik koʻrsatkichlari (KPI) mezonlari asosida baholash va ragʻbatlantirish toʻgʻrisida", space_before=8, space_after=12)

    add_p(doc, "Oʻzbekiston Respublikasi Prezidentining oliy taʼlim tizimini transformatsiya qilish va taʼlim sifatini oshirishga oid farmon va qarorlari, Oʻzbekiston Respublikasi Vazirlar Mahkamasining 2019-yil 24-dekabrdagi 1030-sonli qarori talablari asosida filialda ilmiy-tadqiqot (40%), oʻquv-uslubiy (30%), xalqaro integratsiya (20%) hamda maʼnaviy-tarbiyaviy va bitiruvchilar bandligi (10%) yoʻnalishlarida professor-oʻqituvchilar faoliyatini xolis, adolatli va differensiatsiyalashgan holda baholash tizimini joriy etish maqsadida filial Kengashining 2026-yil «___» ____________dagi ___-sonli yigʻilishi qaroriga asosan:")

    add_heading_p(doc, "B U Y U R A M A N:", space_before=8, space_after=8)

    add_p(doc, "1. Mirzo Ulugʻbek nomidagi Oʻzbekiston Milliy universiteti Jizzax filiali professor-oʻqituvchilari faoliyatini asosiy samaradorlik koʻrsatkichlari (KPI) asosida baholash va ragʻbatlantirish toʻgʻrisidagi takomillashtirilgan Nizom 1-ilovaga muvofiq tasdiqlansin.")
    add_p(doc, "2. Filial professor-oʻqituvchilari faoliyatining 100 ballik integratsiyalashgan KPI mezonlari, indikatorlarning amal qilish muddati, dasturiy kiritish maydonlari, masʼul tasdiqlovchi boʻlimlar hamda jarimalar jadvali 2-ilovaga muvofiq tasdiqlansin.")
    add_p(doc, "3. Filial professor-oʻqituvchilari faoliyatini baholash boʻyicha Ekspert komissiyasi tarkibi 3-ilovaga muvofiq tasdiqlansin.")
    add_p(doc, "4. Baholash natijalari boʻyicha nizoli vaziyatlarni koʻrib chiquvchi Apellyatsiya komissiyasi tarkibi 4-ilovaga muvofiq tasdiqlansin.")
    add_p(doc, "5. KPI baholash natijalari asosida professor-oʻqituvchilarni moddiy va maʼnaviy ragʻbatlantirish shkalasi 5-ilovaga muvofiq tasdiqlansin.")
    add_p(doc, "6. Shtatlar kesimi (K_shtat), lavozim toifalari va akademik traektoriyalar taqsimot matritsasi 6-ilovaga muvofiq tasdiqlansin.")
    add_p(doc, "7. Raqamli taʼlim texnologiyalari markaziga: HEMIS axborot tizimi bilan toʻliq integratsiyalashgan, Scopus/Web of Science API va YAMMT elektron maʼlumotlari orqali natijalarni avtomatik verifikatsiya qiluvchi «JBNUU KPI» elektron tizimini amaliyotga joriy etish vazifasi yuklatilsin. Muddat: 2026-yil «___» __________.")
    add_p(doc, "8. Mazkur buyruq ijrosining nazorati filial direktori zimmasida qoldirilsin.")

    p_sign = doc.add_paragraph()
    p_sign.paragraph_format.line_spacing = 1.15
    p_sign.paragraph_format.space_before = Pt(20)
    p_sign.paragraph_format.space_after = Pt(12)
    r_s = p_sign.add_run("Filial direktori\t\t\t\t\t\t\t\t__________________")
    r_s.bold = True
    r_s.font.name = 'Times New Roman'
    r_s.font.size = Pt(14)

    # ==========================================
    # 1-ILOVA: NIZOM (13 TA BOB)
    # ==========================================
    doc.add_page_break()
    p_il1 = doc.add_paragraph()
    p_il1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_il1 = p_il1.add_run("OʻzMU Jizzax filiali direktorining\n2026-yil «___» _________dagi\n___-sonli buyrugʻiga 1-ilova")
    r_il1.font.name = 'Times New Roman'
    r_il1.font.size = Pt(12)
    r_il1.italic = True

    add_heading_p(doc, "MIRZO ULUGʻBEK NOMIDAGI OʻZBEKISTON MILLIY UNIVERSITETI JIZZAX FILIALI PROFESSOR-OʻQITUVCHILARI FAOLIYATINI ASOSIY SAMARADORLIK KOʻRSATKICHLARI (KPI) ASOSIDA BAHOLASH VA RAGʻBATLANTIRISH TOʻGʻRISIDA", space_before=10, space_after=4)
    add_heading_p(doc, "N I Z O M", space_before=0, space_after=14)

    add_heading_p(doc, "I BOB. UMUMIY QOIDALAR", space_before=10, space_after=6)
    add_p(doc, "1.1. Mazkur Nizom Mirzo Ulugʻbek nomidagi Oʻzbekiston Milliy universiteti Jizzax filiali (keyingi oʻrinlarda – Filial) professor-oʻqituvchilarining oʻquv-uslubiy, ilmiy-tadqiqot, xalqaro integratsiya, maʼnaviy-maʼrifiy faoliyati, mehnat intizomi hamda bitiruvchilar bandligini taʼminlash boʻyicha erishgan amaliy natijalarini Asosiy samaradorlik koʻrsatkichlari (KPI – Key Performance Indicators) asosida xolis, adolatli va differensiatsiyalashgan tartibda baholash hamda ularni moddiy ragʻbatlantirish mexanizmini belgilaydi.")
    add_p(doc, "1.2. KPI baholash tizimi qonuniylik, akademik halollik, xolislik, shaffoflik, teng imkoniyatlar va mehnat natijadorligini munosib eʼtirof etish tamoyillariga tayanadi.")
    add_p(doc, "1.3. VM 1030-son qarori bilan dublyajni taqiqlash: Oʻzbekiston Respublikasi Vazirlar Mahkamasining 2019-yil 24-dekabrdagi 1030-sonli qaroriga asosan oylik maoshiga doimiy ustama belgilangan natijalar ushbu KPI tizimiga takroran kiritilmaydi.")
    add_p(doc, "1.4. Indikatorlarning amal qilish muddati (Life-time): Mezonlar jadvalida har bir indikatorning oʻziga xos amal qilish muddati belgilanadi. Masalan, nashr etilgan darsliklar va tarjimalar 2 yil, malaka oshirish sertifikati 3 yil, ilmiy daraja (PhD/DSc) doimiy, joriy ilmiy maqolalar esa kalendar yili oxirigacha amal qiladi.")

    add_heading_p(doc, "II BOB. KPI TIZIMINING STRUKTURAVIY BALANSI VA CHEGARALARI", space_before=10, space_after=6)
    add_p(doc, "2.1. Filialning ilmiy salohiyatini keskin yuksaltirish maqsadida 100 ballik tizim quyidagi optimal vazn taqsimoti asosida shakllantiriladi:")
    add_p(doc, "a) Oʻquv va oʻquv-uslubiy faoliyat – maksimal 30 ball;")
    add_p(doc, "b) Ilmiy-tadqiqot va innovatsion faoliyat – maksimal 40 ball (universitet nufuzining asosiy tayanchi);")
    add_p(doc, "d) Xalqaro hamkorlik va integratsiya – maksimal 20 ball;")
    add_p(doc, "e) Ijtimoiy-maʼnaviy faoliyat, intizom va bitiruvchilar bandligi – maksimal 10 ball.")
    add_p(doc, "2.2. Jarima ballari (chegirmalar): Funksional vazifalar, dars intizomi, davomat va akademik etikani buzganlik uchun jarima ballari toʻplangan ijobiy ballardan chegirib tashlanadi.")

    add_heading_p(doc, "III BOB. SHTAT BIRLIKLARI KESIMIDA BAHOLASH (SHTAT KOEFFITSIYENTI)", space_before=10, space_after=6)
    add_p(doc, "3.1. Toʻliq boʻlmagan stavkalarda (0.25, 0.5, 0.75 shtat) ishlovchi xodimlar faoliyatini 1.0 shtatdagilar bilan tenglashtirish va adolatni taʼminlash maqsadida «Shtat koeffitsiyenti» ($K_{shtat}$) qoʻllaniladi.")
    add_p(doc, "3.2. Formula: Ball_yakuniy = Ball_amalda / Shtat_birligi.")
    add_p(doc, "Misol: 0.5 shtatda ishlovchi oʻqituvchi amalda 40 ball toʻplasa, uning yakuniy hisobiy bali 40 / 0.5 = 80 ball boʻladi va u oʻzining 0.5 stavka oylik maoshiga nisbatan 70% ustama oladi.")
    add_p(doc, "3.3. 1.5 shtat ishlovchi xodimlar asosiy 1.0 shtat boʻyicha toʻliq 100 ballik mezon asosida baholanadi.")

    add_heading_p(doc, "IV BOB. LAVOZIMLAR VA ILMIY DARAJALAR BOʻYICHA TABAQALASHTIRILGAN BAHOLASH", space_before=10, space_after=6)
    add_p(doc, "4.1. Pedagog xodimlar 3 ta toifaga ajratiladi:")
    add_p(doc, "– I toifa: Professorlar, dotsentlar, fan doktorlari (DSc) va falsafa doktorlari (PhD);")
    add_p(doc, "– II toifa: Katta oʻqituvchilar (ilmiy darajasiz, tajribali mutaxassislar);")
    add_p(doc, "– III toifa: Assistentlar va oʻqituvchi-stajyorlar.")
    add_p(doc, "4.2. I toifaga ilmiy-tadqiqot (Scopus, grant, shogird, Xirsh indeksi) va xalqaro faoliyat boʻyicha yuqori talab qoʻyiladi; III toifaga esa oʻquv kontentlari, HEMIS tizimi, ochiq darslar, toʻgaraklar va til sertifikatlari ustuvor qilib belgilanadi.")

    add_heading_p(doc, "V BOB. BIRINCHI YIL ISHLAYOTGAN YOSH MUTAXASSISLAR UCHUN MOSLASHUV IMTIYOZLARI", space_before=10, space_after=6)
    add_p(doc, "5.1. Dastlabki 1 yilda faoliyat boshlagan yosh oʻqituvchilarga darslik, monografiya yoki xalqaro grant talablari yuklatilmaydi.")
    add_p(doc, "5.2. Ularning til sertifikatlari va axborot texnologiyalari kurslari 1.5 baravar koeffitsiyent bilan ragʻbatlantiriladi.")
    add_p(doc, "5.3. Yosh mutaxassislar uchun ustama olish chegarasi 45 balldan etib belgilanadi (45–60 ball toʻplasa, 40% ustama oladi).")

    add_heading_p(doc, "VI BOB. AKADEMIK TRAEKTORIYALAR VA «YUTUQLAR KOMPENSATSIYASI» (FLEX QOIDASI)", space_before=10, space_after=6)
    add_p(doc, "6.1. Filialda 3 ta Akademik traektoriya amal qiladi: «Tadqiqotchi» (Research), «Pedagog-metodist» (Teaching) va «Amaliyotchi/Innovator» (Industry).")
    add_p(doc, "6.2. «Yutuqlar kompensatsiyasi» (Bonus Transfer): Agar olim Scopus Q1/Q2 jurnalida maqola chiqarsa, xalqaro grant yutsa, ixtiro patenti olsa yoki yuqori Xirsh indeksiga ega boʻlsa, uning Ilmiy blok boʻyicha 40 ballik chegaradan ortiqcha toʻplagan ballari uning yetishmayotgan Maʼnaviy-maʼrifiy blokdagi ballarini toʻliq qoplab beradi.")
    add_p(doc, "6.3. Olimlar uchun majburiy talab: auditoriya darslarini oʻz vaqtida oʻtish, davomatni HEMISga kiritish va mehnat intizomini buzmaslik.")

    add_heading_p(doc, "VII BOB. DAVOMAT VA MEHNAT INTIZOMINI NAZORAT QILISH TARTIBI", space_before=10, space_after=6)
    add_p(doc, "7.1. Oʻqituvchining darslarga kirish davomati dars jadvali, HEMIS log-yozuvlari va Taʼlim sifati monitoringi orqali nazorat qilinadi. Sababsiz dars qoldirilganda -2 ball, darsga kechikilganda -1 ball jarima qoʻllaniladi.")
    add_p(doc, "7.2. Talabalar davomatini HEMIS tizimiga oʻz vaqtida kunlik kiritgan xodimlarga ragʻbat, muntazam kechiktirganlarga esa jarima beriladi.")
    add_p(doc, "7.3. Akademik guruhida yillik davomat koʻrsatkichini 90 foizdan yuqori taʼminlagan murabbiyga ragʻbatlantiruvchi ball beriladi.")

    add_heading_p(doc, "VIII BOB. BITIRUVCHILARNI ISHGA JOYLASHTIRISH VA BANDLIK MEZONI", space_before=10, space_after=6)
    add_p(doc, "8.1. Oʻzi rahbarlik qilgan bakalavriat (BMI) yoki magistrlik dissertatsiyasi shogirdining mutaxassisligi boʻyicha YAMMT (mehnat.uz) orqali rasmiy ishga joylashishi taʼminlanganda – har bir talaba uchun 2 ball beriladi.")
    add_p(doc, "8.2. Korxonalar bilan bitiruvchilarni ishga olish boʻyicha 3 tomonlama shartnomalar tuzganlik uchun 3 ball taqdim etiladi.")

    add_heading_p(doc, "IX BOB. KAFEDRA MUDIRLARI VA BOSHQARUV KADRLARINI BAHOLASH (MANAGEMENT KPI)", space_before=10, space_after=6)
    add_p(doc, "9.1. Kafedra mudirlarining KPIsi: 50% shaxsiy faoliyatidan, 50% boshqaruv samaradorligidan (kafedra oʻrtacha bali oʻsishi, bitiruvchilar bandligi, dars intizomi) shakllanadi.")

    add_heading_p(doc, "X BOB. AKADEMIK HALOLLIK, PLAGIAT VA SOXTA JURNALLARGA QARSHI KURASH", space_before=10, space_after=6)
    add_p(doc, "10.1. Soxta va «yirtqich» (predatory) jurnallarda chop etilgan ishlar rad etiladi.")
    add_p(doc, "10.2. Plagiat holati aniqlanganda: 0 ball qoʻyiladi, umumiy balldan -20 ball chegiriladi va xodim 1 yilga barcha ustamalardan mahrum etiladi.")
    add_p(doc, "10.3. Hammualliflikda ball teng boʻlinadi; Scopus/WoSda birinchi muallifga 60%, boshqalarga 40% beriladi.")

    add_heading_p(doc, "XI BOB. BAHOLASH BOSQICHLARI, EKSPERT VA APELLYATSIYA KOMISSIYASI", space_before=10, space_after=6)
    add_p(doc, "11.1. Jarayon 5 bosqichda oʻtkaziladi: 1) Shaxsiy kabinetga hujjat yuklash (30-maygacha); 2) Kafedra mudiri tekshiruvi (5-iyungacha); 3) Ekspert komissiyasi baholashi (20-iyungacha); 4) Apellyatsiya arizalarini 3 ish kunida koʻrib chiqish; 5) Filial Kengashida tasdiqlash.")

    add_heading_p(doc, "XII BOB. MODDIY RAGʻBATLANTIRISH SHKALASI VA BYUDJET CHEGARASI (BUDGET CAP)", space_before=10, space_after=6)
    add_p(doc, "12.1. Yakuniy reyting natijalariga binoan: 86–100 ball: 100% ustama; 71–85 ball: 70% ustama; 56–70 ball: 40% ustama; 40–55 ball: bir martalik mukofot (yoshlar uchun 45–60 ballga 40% ustama); 40 balldan past: ustama yoʻq.")
    add_p(doc, "12.2. Budget Cap: Ustamalar tasdiqlangan jamgʻarma doirasida toʻlanadi. Mablagʻ yetishmagan holatda umumiy reytingning yuqori kvotasi boʻyicha adolatli taqsimlanadi.")

    add_heading_p(doc, "XIII BOB. IJTIMOIY KAFOLATLAR VA YAKUNIY QOIDALAR", space_before=10, space_after=6)
    add_p(doc, "13.1. Dekret taʼtili, uzoq muddatli xastalik yoki stajirovkadagi pedagoglarning huquqlari toʻliq saqlab qolinadi.")

    # ==========================================
    # 2-ILOVA: BIRLASHTIRILGAN 100 BALLIK KPI JADVALI
    # Ustunlar: T/r | Ko'rsatkich | Amal qilish muddati | Ball | Kiritish maydonlari (Input fields) | Mas'ul tasdiqlovchi bo'lim
    # ==========================================
    doc.add_page_break()
    p_il2 = doc.add_paragraph()
    p_il2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_il2 = p_il2.add_run("OʻzMU Jizzax filiali direktorining\n2026-yil «___» _________dagi\n___-sonli buyrugʻiga 2-ilova")
    r_il2.font.name = 'Times New Roman'
    r_il2.font.size = Pt(12)
    r_il2.italic = True

    add_heading_p(doc, "MIRZO ULUGʻBEK NOMIDAGI OʻZBEKISTON MILLIY UNIVERSITETI JIZZAX FILIALI PROFESSOR-OʻQITUVCHILARI SAMARADORLIGINI BAHOLASHNING BIRLASHTIRILGAN KPI MEZONLARI, AMAL QILISH MUDDATI VA TASDIQLOVCHI BOʻLIMLAR JADVALI", space_before=8, space_after=12)

    headers_u = ["T/r", "Samaradorlik koʻrsatkichi va mezon mazmuni", "Amal qilish muddati", "Ball / Chegara", "Elektron platforma uchun maʼlumotlar kiritish maydoni (Fields)", "Masʼul tasdiqlovchi boʻlim"]
    widths_u = [Inches(0.4), Inches(2.2), Inches(0.9), Inches(0.9), Inches(2.0), Inches(1.2)]

    # 1-BLOK: O'quv-metodik (30 ball)
    add_heading_p(doc, "I. OʻQUV VA OʻQUV-USLUBIY FAOLIYAT – MAKSIMAL 30 BALL", space_before=6, space_after=6, size=12)
    t1 = doc.add_table(rows=1, cols=6)
    t1.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t1)
    for i, title in enumerate(headers_u):
        t1.rows[0].cells[i].width = widths_u[i]
        style_cell(t1.rows[0].cells[i], title, bold=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="E9ECEF")

    data1_u = [
        ("1.1", "Nashr etilgan DARSLIK (Vazirlik/OTM grifi, ISBN raqami bilan)", "2 kalendar yili", "6 ball (mualliflar ulushiga teng boʻlinadi)", "1. Nomi\n2. Nashr vaqti\n3. Mualliflar soni\n4. Tili\n5. Nashriyot, sahifasi\n6. Kengash qarori\n7. ISBN raqami\n8. Asoslovchi PDF", "Oʻquv-uslubiy boshqarma"),
        ("1.2", "Nashr etilgan OʻQUV QOʻLLANMA (Vazirlik/OTM kengashi tavsiyasi, ISBN)", "Kalendar yili oxirigacha", "4 ball (mualliflar soniga boʻlinadi)", "1. Nomi\n2. Nashr vaqti\n3. Mualliflar soni\n4. Tili\n5. Nashriyot, sahifasi\n6. Kengash qarori\n7. ISBN raqami\n8. Asoslovchi PDF", "Oʻquv-uslubiy boshqarma"),
        ("1.3", "TOP-300 xorijiy OTM oʻquv adabiyotlarini OʻZGA TILLARDAN TARJIMA qilganlik", "2 kalendar yili", "6 ball (mualliflar soniga boʻlinadi)", "1. Kitob nomi\n2. Muallif ruxsat xati\n3. Original tili\n4. Nashriyot, sahifasi\n5. Kengash qarori\n6. ISBN\n7. Asoslovchi PDF", "Oʻquv boshqarma, Xalqaro boʻlim"),
        ("1.4", "VIDEODARS VA VIRTUAL LABORATORIYA tayyorlaganlik (Jalingo studiyasi, tan olingan resurslar)", "1 yil", "3 ballgacha", "1. Fan nomi\n2. Mualliflar soni\n3. Tasdiqlangan sana\n4. Video platforma nomi\n5. Internet havolasi\n6. Ekspertiza PDF", "Raqamli taʼlim texnologiyalari markazi"),
        ("1.5", "HEMIS axborot tizimiga sifatli OʻQUV KONTENTLARIni toʻliq yuklaganlik va yangilaganlik", "Kalendar yili oxirigacha", "2 ball (toʻliq boʻlsa)", "1. Fan nomi\n2. Taʼlim yoʻnalishi\n3. Mashgʻulot turlari\n4. Topshiriqlar soni\n5. HEMIS tizimi skrinshoti PDF", "Oʻquv-uslubiy boshqarma"),
        ("1.6", "TOP-300 xorijiy OTM dasturi asosida yangi FAN DASTURI va SILLABUS ishlab chiqqanlik", "1 yil", "Yangi fan: 3 ball; mavjud fanga: 1-2 ball", "1. Fan nomi\n2. Xorijiy OTM nomi\n3. Kengash tasdiq sanasi\n4. Dastur nusxasi PDF", "Oʻquv-uslubiy boshqarma"),
        ("1.7", "Namunali OCHIQ DARS mashgʻulotlarini oʻtkazganlik va saytda yoritganlik", "Kalendar yili oxirigacha", "1 ball (yiliga 2 tadan oshmasligi kerak)", "1. Mavzu nomi\n2. Guruh va sana\n3. Dars tahlili xulosasi\n4. Rangli fotolavha va sayt havolasi PDF", "Taʼlim sifatini nazorat qilish boʻlimi"),
        ("1.8", "Respublika tarmoq markazlarida yoki BIMMda MALAKA OSHIRGANlik (144 soat)", "3 yil", "144 soatlik – 2 ball; boshqa – 1 ball", "1. Kurs turi\n2. Oʻtkazilgan joyi\n3. Sertifikat raqami va sanasi\n4. Asoslovchi sertifikat PDF", "Oʻquv-uslubiy boshqarma"),
        ("1.9", "Oʻqitish sifati boʻyicha talabalar va hamkasblar oʻrtasidagi SOʻROVNOMA natijasi", "1 yil", "4 ballgacha (oʻrtacha ball asosida)", "1. Baholash platformasi xulosasi\n2. Talabalar qoniqish indeksi\n3. Sifat nazorati maʼlumotnomasi", "Taʼlim sifatini nazorat qilish boʻlimi"),
        ("1.10", "HEMIS tizimida talabalar davomatini kunlik va darslarni oʻz vaqtida namunali yuritganlik", "1 yil", "2 ball", "1. HEMIS log-tahlil maʼlumotnomasi\n2. 100% oʻz vaqtida yuritilganlik tasdiqnomasi", "Oʻquv boʻlimi, Dekanat"),
    ]
    for row_data in data1_u:
        row = t1.add_row()
        for idx, text in enumerate(row_data):
            row.cells[idx].width = widths_u[idx]
            style_cell(row.cells[idx], text, bold=(idx==0), size=8, align=WD_ALIGN_PARAGRAPH.CENTER if idx in [0,2,3] else WD_ALIGN_PARAGRAPH.LEFT)

    r_sum1 = t1.add_row()
    style_cell(r_sum1.cells[0], "", bg_color="D1ECF1")
    style_cell(r_sum1.cells[1], "I BLOK BOʻYICHA JAMI CHEKLOV", bold=True, size=9, bg_color="D1ECF1")
    style_cell(r_sum1.cells[2], "Maksimal chegara", italic=True, size=8, bg_color="D1ECF1")
    style_cell(r_sum1.cells[3], "30 ball", bold=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="D1ECF1")
    style_cell(r_sum1.cells[4], "Ortiqcha ball boshqa bloklarga oʻtmaydi", italic=True, size=8, bg_color="D1ECF1")
    style_cell(r_sum1.cells[5], "Oʻquv boshqarma", bold=True, size=8, bg_color="D1ECF1")

    # 2-BLOK: Ilmiy-innovatsion (40 ball)
    add_heading_p(doc, "II. ILMIY-INNOVATSION FAOLIYAT – MAKSIMAL 40 BALL (UNIVERSITET NAFOSATI)", space_before=14, space_after=6, size=12)
    t2 = doc.add_table(rows=1, cols=6)
    t2.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t2)
    for i, title in enumerate(headers_u):
        t2.rows[0].cells[i].width = widths_u[i]
        style_cell(t2.rows[0].cells[i], title, bold=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="E9ECEF")

    data2_u = [
        ("2.1", "FALSAFA DOKTORI (PhD) yoki FAN DOKTORI (DSc) ilmiy darajasiga ega ekanligi", "Doimiy", "PhD – 2 ball;\nDSc – 3 ball (bir marta qoʻyiladi)", "1. Diplom raqami\n2. Ixtisoslik shifri\n3. Berilgan sana\n4. HEMIS ID\n5. Diplom nusxasi PDF", "Ilmiy boʻlim, Kadrlar boʻlimi"),
        ("2.2", "Ilmiy rahbarligida PhD yoki ilmiy maslahatchiligida DSc kadr tayyorlaganlik", "Kalendar yili oxirigacha", "PhD – 2 ball;\nDSc – 3 ball (umumiy 4 ballgacha)", "1. Shogird F.I.Sh.\n2. Shogird ish joyi\n3. Ixtisoslik shifri\n4. OAK diplomi nusxasi PDF", "Ilmiy-tadqiqotlar va ilmiy kadrlar boʻlimi"),
        ("2.3", "SCOPUS va WEB OF SCIENCE bazalaridagi Q1 va Q2 kvartildagi jurnallarda maqola nashr etish", "Kalendar yili oxirigacha", "Q1 – 8 ball;\nQ2 – 6 ball (1-muallifga 60%, qolganlarga 40%)", "1. Jurnal nomi\n2. Xalqaro baza nomi\n3. Maqola nomi\n4. DOI havola\n5. Kvartil tasdiqnomasi\n6. Mualliflar soni\n7. Maqola PDF", "Ilmiy-tadqiqotlar va innovatsiyalar boʻlimi"),
        ("2.4", "SCOPUS va WEB OF SCIENCE bazalaridagi Q3 va Q4 kvartildagi jurnallarda maqola nashr etish", "Kalendar yili oxirigacha", "1 ta – 3 ball;\n2 ta va undan yuqori – 6 ball", "1. Jurnal nomi\n2. Xalqaro baza nomi\n3. Maqola nomi va DOI\n4. Mualliflar soni\n5. Maqola PDF", "Ilmiy-tadqiqotlar va innovatsiyalar boʻlimi"),
        ("2.5", "Scopus va Web of Science indekslangan XALQARO KONFERENSIYALARDA maqola nashr etish", "Kalendar yili oxirigacha", "1 ta – 2 ball;\n2 ta va undan ortiq – 4 ball", "1. Konferensiya nomi\n2. Baza nomi\n3. Maqola nomi va havolasi\n4. Maqola PDF", "Ilmiy-tadqiqotlar va innovatsiyalar boʻlimi"),
        ("2.6", "«SCOPUS» va «WEB OF SCIENCE» bazalaridagi XIRSH INDEKSI (h-index)", "Kalendar yili oxirigacha", "Har 1 Xirsh indeksi uchun 1 ball (chegaralanmagan holda qoʻshiladi)", "1. Baza nomi\n2. Profil internet manzili\n3. Xirsh indeksi soni\n4. Baza skrinshoti PDF", "Ilmiy-tadqiqotlar va innovatsiyalar boʻlimi"),
        ("2.7", "OAK ROʻYXATIDAGI xorijiy va mahalliy ilmiy jurnallarda maqola chop etish (1030-sondan tashqari)", "Kalendar yili oxirigacha", "Har bir maqola uchun 2 ball (maksimal 6 ball)", "1. Jurnal nomi\n2. OAK roʻyxati yili\n3. Maqola nomi\n4. Nashr parametri\n5. Maqola PDF", "Ilmiy-tadqiqotlar va innovatsiyalar boʻlimi"),
        ("2.8", "MONOGRAFIYA yozganligi va LUGʻAT tuzganligi (Kengash qarori, ISBN bilan)", "Kalendar yili oxirigacha", "1 ta – 2 ball;\n2 ta va undan yuqori – 4 ball", "1. Monografiya nomi\n2. Mualliflar soni\n3. Nashriyot, sahifasi\n4. Kengash qarori\n5. ISBN\n6. Asoslovchi PDF", "Ilmiy-tadqiqotlar va innovatsiyalar boʻlimi"),
        ("2.9", "Ilmiy-tadqiqot ishlari samaradorligi: PATENT (ixtiro, foydali model, sanoat namunasi)", "Kalendar yili oxirigacha", "1 ta va undan yuqori – 5 ball", "1. Nomi\n2. Turi (ixtiro/model)\n3. Egalari soni\n4. Qayd raqami\n5. Davlat patenti nusxasi PDF", "Ilmiy ishlanmalarni tijoratlashtirish boʻlimi"),
        ("2.10", "Dasturiy mahsulotlar va maʼlumotlar bazasi uchun DGU GUVOHNOMASI olish", "Kalendar yili oxirigacha", "Har bir dasturiy vosita uchun 3 ball (maksimal 6 ball)", "1. Dastur nomi\n2. Qayd raqami va sanasi\n3. Mualliflar soni\n4. DGU guvohnomasi PDF", "Ilmiy ishlanmalarni tijoratlashtirish boʻlimi"),
        ("2.11", "SOHALAR BUYURTMALARI asosida (xoʻjalik shartnomalari orqali) ishlab topilgan MABLAGʻ", "Kalendar yili oxirigacha", "3 mln soʻmga 1 ball, keyingi har 1 mln soʻmga 0.2 ball (maksimal 8 ball)", "1. Shartnoma nomi\n2. Buyurtmachi tashkilot\n3. Shartnoma summasi\n4. Filial hisobiga tushgan toʻlov topshiriqnomasi PDF", "Ilmiy ishlanmalarni tijoratlashtirish boʻlimi"),
        ("2.12", "DAVLAT GRANTLARI (fundamental, amaliy, innovatsion) loyihalarida RAHBARLIK yoki ISHTIROK", "Loyiha tugagunga qadar", "Rahbarlik – 8 ball;\nAsosiy aʼzolik – 4 ball", "1. Loyiha nomi va shifri\n2. Shartnoma raqami\n3. Tushgan mablagʻ summasi\n4. Loyiha shartnomasi PDF", "Ilmiy boʻlim, Tijoratlashtirish boʻlimi"),
        ("2.13", "Iqtidorli talabalarni Respublika va xalqaro tanlovlarga tayyorlash (stipendiat, olimpiada)", "Kalendar yili oxirigacha", "Har bir gʻolib talaba uchun 2 ball (maksimal 6 ball)", "1. Talaba F.I.Sh.\n2. Tanlov nomi va oʻrni\n3. Buyruq va diplom nusxasi PDF", "Ilmiy boʻlim, Oʻquv boshqarma"),
        ("2.14", "Ixtisoslashgan ilmiy kengashlar va ilmiy seminarlarda faoliyat yuritish", "Kengash faoliyati davrida", "Rais/kotib – 3 ball;\nAʼzo – 1 ball", "1. Ilmiy kengash shifri\n2. OAK buyrugʻi\n3. Tasdiqlovchi hujjat PDF", "Ilmiy kengash kotibi"),
    ]
    for row_data in data2_u:
        row = t2.add_row()
        for idx, text in enumerate(row_data):
            row.cells[idx].width = widths_u[idx]
            style_cell(row.cells[idx], text, bold=(idx==0), size=8, align=WD_ALIGN_PARAGRAPH.CENTER if idx in [0,2,3] else WD_ALIGN_PARAGRAPH.LEFT)

    r_sum2 = t2.add_row()
    style_cell(r_sum2.cells[0], "", bg_color="D1ECF1")
    style_cell(r_sum2.cells[1], "II BLOK BOʻYICHA JAMI CHEKLOV", bold=True, size=9, bg_color="D1ECF1")
    style_cell(r_sum2.cells[2], "Maksimal chegara", italic=True, size=8, bg_color="D1ECF1")
    style_cell(r_sum2.cells[3], "40 ball", bold=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="D1ECF1")
    style_cell(r_sum2.cells[4], "Ortiqcha ball maʼnaviy blok yetishmovchiligini qoplaydi (Flex)", italic=True, size=8, bg_color="D1ECF1")
    style_cell(r_sum2.cells[5], "Ilmiy boshqarma", bold=True, size=8, bg_color="D1ECF1")

    # 3-BLOK: Xalqaro hamkorlik (20 ball)
    add_heading_p(doc, "III. XALQARO HAMKORLIK FAOLIYATI – MAKSIMAL 20 BALL", space_before=14, space_after=6, size=12)
    t3 = doc.add_table(rows=1, cols=6)
    t3.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t3)
    for i, title in enumerate(headers_u):
        t3.rows[0].cells[i].width = widths_u[i]
        style_cell(t3.rows[0].cells[i], title, bold=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="E9ECEF")

    data3_u = [
        ("3.1", "Dunyoning nufuzli TOP-1000 xorijiy OTMlarida oʻquv mashgʻulotlari (maʼruza/trening) oʻtkazganlik", "Kalendar yili oxirigacha", "Har bir maʼruza/kurs uchun 2 ball (maksimal 4 ball)", "1. Xorijiy davlat va OTM\n2. Mashgʻulot turi\n3. Chaqiruv xati va rektor buyrugʻi\n4. Sertifikat va hisobot PDF", "Xalqaro hamkorlik boʻlimi"),
        ("3.2", "XALQARO ILMIY LOYIHALARda (Erasmus+, Horizon, KOICA, JICA) rahbarlik yoki aʼzolik", "Loyiha tugagunga qadar", "Loyiha rahbari – 4 ball;\nLoyiha aʼzosi – 2 ball", "1. Loyiha nomi va xalqaro kodi\n2. Shartnoma summasi\n3. Filialga tushgan mablagʻ\n4. Loyiha shartnomasi PDF", "Xalqaro hamkorlik boʻlimi"),
        ("3.3", "XORIJIY TILNI BILISH sertifikatiga ega ekanligi (IELTS 6.5+, TOEFL, CEFR B2, C1) (tilchilardan tashqari)", "Sertifikat muddati tugaguncha", "C1 daraja – 3 ball;\nB2 daraja – 2 ball (Yoshlarga 1.5x)", "1. Xorijiy til nomi\n2. Sertifikat turi va seriyasi\n3. Olgan balli/darajasi\n4. Asoslovchi sertifikat PDF", "Xalqaro hamkorlik boʻlimi"),
        ("3.4", "Mutaxassislik fanlarini toʻliq CHET TILIda oʻqitish (til fanlaridan tashqari)", "6 oy", "Har bir fan uchun 2 ball", "1. Fan nomi va taʼlim bosqichi\n2. Chet tili nomi\n3. Chet tilidagi sillabus\n4. Buyruq nusxasi PDF", "Oʻquv boshqarma, Xalqaro boʻlim"),
        ("3.5", "Xorijiy nufuzli OTM yoki ilmiy markazlarda MALAKA OSHIRISH yoki STAJIROVKA oʻtaganlik", "Kalendar yili oxirigacha", "1 oydan ortiq – 4 ball;\nKamida 72 soat – 2 ball", "1. Xorijiy davlat va OTM\n2. Stajirovka muddati\n3. Filial buyrugʻi\n4. Xalqaro sertifikat PDF", "Xalqaro hamkorlik boʻlimi"),
        ("3.6", "Xorijiy investitsiya va grant mablagʻlarini filial balansiga jalb etganlik", "Kalendar yili oxirigacha", "Har 1000 AQSH dollari yoki uskuna uchun 3 ball", "1. Jalb qilingan vosita turi\n2. Kirim dalolatnomasi\n3. Shartnoma va buyruq PDF", "Xalqaro boʻlim, Buxgalteriya"),
        ("3.7", "TAʼLIM EKSPORTINI amalga oshirganlik (xorijiy talabalarni jalb qilish, yozgi/qishki maktablar)", "Kalendar yili oxirigacha", "Har bir jalb etilgan talaba yoki dastur uchun 2 ball", "1. Xorijiy fuqaro maʼlumotlari\n2. Shartnoma va toʻlov kvitansiyasi\n3. Qabul buyrugʻi nusxasi PDF", "Xalqaro hamkorlik boʻlimi"),
    ]
    for row_data in data3_u:
        row = t3.add_row()
        for idx, text in enumerate(row_data):
            row.cells[idx].width = widths_u[idx]
            style_cell(row.cells[idx], text, bold=(idx==0), size=8, align=WD_ALIGN_PARAGRAPH.CENTER if idx in [0,2,3] else WD_ALIGN_PARAGRAPH.LEFT)

    r_sum3 = t3.add_row()
    style_cell(r_sum3.cells[0], "", bg_color="D1ECF1")
    style_cell(r_sum3.cells[1], "III BLOK BOʻYICHA JAMI CHEKLOV", bold=True, size=9, bg_color="D1ECF1")
    style_cell(r_sum3.cells[2], "Maksimal chegara", italic=True, size=8, bg_color="D1ECF1")
    style_cell(r_sum3.cells[3], "20 ball", bold=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="D1ECF1")
    style_cell(r_sum3.cells[4], "Ortiqcha ball boshqa bloklarga oʻtmaydi", italic=True, size=8, bg_color="D1ECF1")
    style_cell(r_sum3.cells[5], "Xalqaro boʻlim", bold=True, size=8, bg_color="D1ECF1")

    # 4-BLOK: Ma'naviy-ma'rifiy, intizom va bandlik (10 ball)
    add_heading_p(doc, "IV. IJTIMOIY-MAʼNAVIY FAOLIYAT, INTIZOM VA BITIRUVCHILAR BANDLIGI – MAKSIMAL 10 BALL", space_before=14, space_after=6, size=12)
    t4 = doc.add_table(rows=1, cols=6)
    t4.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t4)
    for i, title in enumerate(headers_u):
        t4.rows[0].cells[i].width = widths_u[i]
        style_cell(t4.rows[0].cells[i], title, bold=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="E9ECEF")

    data4_u = [
        ("4.1", "Bitiruvchi talabalarni (BMI/dissertatsiya shogirdlarini) mutaxassisligi boʻyicha ISHGA JOYLASHTIRISH", "Kalendar yili oxirigacha", "Rahbarlik qilgan har bir ishga joylashgan talaba uchun 2 ball", "1. Talaba F.I.Sh.\n2. YAMMT (mehnat.uz) tasdiqnomasi\n3. Ish joyi va lavozimi\n4. Mehnat shartnomasi PDF", "Marketing va bandlik boʻlimi"),
        ("4.2", "Korxona va tashkilotlar bilan bitiruvchilarni ishga qabul qilish boʻyicha 3 TOMONLAMA SHARTNOMALAR", "Kalendar yili oxirigacha", "Har bir natijali shartnoma uchun 2 ball", "1. Korxona nomi\n2. Shartnoma raqami\n3. Qabul qilinadigan mutaxassislar\n4. Shartnoma PDF", "Marketing va bandlik boʻlimi"),
        ("4.3", "Turli ijtimoiy, maʼnaviy va MAʼRIFIY TADBIRLARni yuqori saviyada tashkil etganlik (kamida 60 talaba)", "6 oy – 1 yil", "Har bir sifatli tadbir uchun 1 ball (maksimal 2 ball)", "1. Tadbir nomi va ssenariysi\n2. Qatnashuvchilar soni (60+)\n3. Dekan tasdiqlagan fotohisobot PDF", "Yoshlar bilan ishlash, maʼnaviyat boʻlimi"),
        ("4.4", "Talabalar oʻrtasida doimiy ishlovchi fan, ijodiy va sport TOʻGARAKLARI tashkil etganlik va rahbarlik", "1 yil", "Doimiy toʻgarak uchun 2 ball", "1. Toʻgarak nizomi va jadvali\n2. Aʼzolar roʻyxati (kamida 30)\n3. 6 ta dars bayonnomasi va fotolavha", "Yoshlar bilan ishlash, maʼnaviyat boʻlimi"),
        ("4.5", "Akademik guruh murabbiyi sifatida talabalar davomatini namunali (90%+) taʼminlaganlik", "1 yil", "Namunali murabbiyga 2 ball", "1. Guruh raqami\n2. HEMIS yillik davomat tahlili\n3. Tyutor va yoshlar boʻlimi xulosasi", "Yoshlar bilan ishlash, maʼnaviyat boʻlimi"),
        ("4.6", "Markaziy OAV va nufuzli ijtimoiy tarmoqlarda OTM islohotlari boʻyicha tahliliy chiqishlar qilish", "1 yil", "Har bir chiqish uchun 1 ball (maksimal 2 ball)", "1. OAV nomi va mavzu\n2. Chiqish sanasi\n3. Nashr sahifasi yoki video havola PDF", "Matbuot xizmati, Yoshlar boʻlimi"),
    ]
    for row_data in data4_u:
        row = t4.add_row()
        for idx, text in enumerate(row_data):
            row.cells[idx].width = widths_u[idx]
            style_cell(row.cells[idx], text, bold=(idx==0), size=8, align=WD_ALIGN_PARAGRAPH.CENTER if idx in [0,2,3] else WD_ALIGN_PARAGRAPH.LEFT)

    r_sum4 = t4.add_row()
    style_cell(r_sum4.cells[0], "", bg_color="D1ECF1")
    style_cell(r_sum4.cells[1], "IV BLOK BOʻYICHA JAMI CHEKLOV", bold=True, size=9, bg_color="D1ECF1")
    style_cell(r_sum4.cells[2], "Maksimal chegara", italic=True, size=8, bg_color="D1ECF1")
    style_cell(r_sum4.cells[3], "10 ball", bold=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="D1ECF1")
    style_cell(r_sum4.cells[4], "Ortiqcha ball boshqa bloklarga oʻtmaydi", italic=True, size=8, bg_color="D1ECF1")
    style_cell(r_sum4.cells[5], "Yoshlar boʻlimi, Marketing", bold=True, size=8, bg_color="D1ECF1")

    # UMUMIY IJOBIY YIG'INDI
    p_tot_u = doc.add_paragraph()
    p_tot_u.paragraph_format.line_spacing = 1.15
    p_tot_u.paragraph_format.space_before = Pt(8)
    p_tot_u.paragraph_format.space_after = Pt(12)
    r_tu = p_tot_u.add_run("BARCHA IJOBIY BLOKLAR BOʻYICHA MAKSIMAL BALL: 100 BALL (Oʻquv: 30 + Ilmiy: 40 + Xalqaro: 20 + Maʼnaviy/Bandlik: 10)")
    r_tu.bold = True
    r_tu.font.name = 'Times New Roman'
    r_tu.font.size = Pt(11)

    # JARIMALAR JADVALI
    add_heading_p(doc, "V. FUNKSIONAL VAZIFALAR, MEHNAT INTIZOMI, DAVOMAT VA AKADEMIK HALOLLIKNI BUZGANLIK UCHUN JARIMA BALLARI (CHEGIRMALAR)", space_before=14, space_after=6, size=12)
    t5 = doc.add_table(rows=1, cols=6)
    t5.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t5, color="E0A899")
    headers_jp = ["T/r", "Kamchilik va qoidabuzarlik turi", "Amal qilish muddati", "Jarima bali", "Aniqlash mexanizmi va asoslovchi hujjat", "Masʼul nazorat boʻlimi"]
    for i, title in enumerate(headers_jp):
        t5.rows[0].cells[i].width = widths_u[i]
        style_cell(t5.rows[0].cells[i], title, bold=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="F8D7DA")

    data5_u = [
        ("5.1", "Oʻquv yuklamasini (auditoriya soatlarini) sababsiz bajarmaganlik yoki mashgʻulotni qoldirganlik", "Oʻquv yili oxirigacha", "-5 ballgacha", "Har bir sababsiz qoldirilgan dars uchun -2 ball (HEMIS monitoringi)", "Oʻquv-uslubiy boshqarma"),
        ("5.2", "Dars mashgʻulotlariga oʻqituvchining sababsiz kechikib kelishi yoki vaqtidan oldin tugatishi", "Oʻquv yili oxirigacha", "-3 ballgacha", "Har bir qayd etilgan holat uchun -1 ball (Dalolatnoma)", "Taʼlim sifatini nazorat qilish boʻlimi"),
        ("5.3", "HEMIS tizimida talabalar davomati va baholash jurnallarini oʻz vaqtida yuritmaslik", "Semestr davomida", "-5 ballgacha", "Muntazam 3 kundan ortiq kechiktirilganda -2 ball; qaydnomani yopmaganlik uchun -3 ball", "Dekanat, Oʻquv boshqarma"),
        ("5.4", "HEMIS va Moodle tizimiga fan boʻyicha oʻquv majmualarini toʻliq joylashtirmaganlik", "Oʻquv yili oxirigacha", "-5 ballgacha", "Oʻquv yili boshlanishidan 10 kundan ortiq kechiktirilganda", "Oʻquv boshqarma, RTTM"),
        ("5.5", "Yillik nashr rejasini asossiz bajarmaganlik (rejalashtirilgan kitob/qoʻllanmani chiqarmaganlik)", "1 yil", "-5 ballgacha", "Yillik reja bajarilmagan har bir holat uchun -2.5 ball", "ARM, Ilmiy boʻlim"),
        ("5.6", "Talabalar oʻrtasida oʻtkazilgan «Oʻqituvchi talaba nigohida» soʻrovnomasida qoniqarsiz baholanish", "1 yil", "-5 ballgacha", "Soʻrovnomada 60 balldan past baholangan oʻqituvchiga", "Taʼlim sifatini nazorat qilish boʻlimi"),
        ("5.7", "Shaxsiy ish rejasidagi ilmiy va maʼrifiy bandlarning uzrsiz bajarilmaganlik holati", "1 yil", "-5 ballgacha", "Bajarilmagan har bir reja bandi uchun -2 ball", "Kafedra mudiri, Ilmiy boʻlim"),
        ("5.8", "Kafedra va filial umumiy yigʻilishlari hamda jamoat tadbirlariga sababsiz qatnashmaslik", "1 yil", "-3 ballgacha", "Har bir sababsiz qatnashmagan majlis uchun -1 ball", "Kadrlar boʻlimi, Nazorat boʻlimi"),
        ("5.9", "Akademik vijdonsizlik, plagiat yoki soxta («yirtqich» / predatory) jurnallarda maqola taqdim etish", "1 yil", "-20 ball", "Har bir holat uchun -20 ball va 1 yil davomida barcha ustamalardan toʻliq mahrum qilish", "Ekspert komissiyasi, Odob-axloq komissiyasi"),
    ]
    for row_data in data5_u:
        row = t5.add_row()
        for idx, text in enumerate(row_data):
            row.cells[idx].width = widths_u[idx]
            style_cell(row.cells[idx], text, bold=(idx==0), size=8, align=WD_ALIGN_PARAGRAPH.CENTER if idx in [0,2,3] else WD_ALIGN_PARAGRAPH.LEFT)

    # ==========================================
    # 3-ILOVA: EKSPERT KOMISSIYASI
    # ==========================================
    doc.add_page_break()
    p_il3 = doc.add_paragraph()
    p_il3.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_il3 = p_il3.add_run("OʻzMU Jizzax filiali direktorining\n2026-yil «___» _________dagi\n___-sonli buyrugʻiga 3-ilova")
    r_il3.font.name = 'Times New Roman'
    r_il3.font.size = Pt(12)
    r_il3.italic = True

    add_heading_p(doc, "MIRZO ULUGʻBEK NOMIDAGI OʻZBEKISTON MILLIY UNIVERSITETI JIZZAX FILIALI PROFESSOR-OʻQITUVCHILARI FAOLIYATINI BAHOLASH BOʻYICHA EKSPERT KOMISSIYASI TARKIBI", space_before=8, space_after=12)

    t_com = doc.add_table(rows=1, cols=4)
    t_com.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_com)
    headers_c = ["T/r", "Komissiya aʼzosining F.I.Sh.", "Egallab turgan asosiy lavozimi", "Komissiyadagi vazifasi"]
    col_widths_c = [Inches(0.6), Inches(2.5), Inches(2.6), Inches(1.5)]
    for i, title in enumerate(headers_c):
        t_com.rows[0].cells[i].width = col_widths_c[i]
        style_cell(t_com.rows[0].cells[i], title, bold=True, size=10, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="E9ECEF")

    data_c = [
        ("1.", "Filial direktori", "Filial direktori", "Komissiya raisi"),
        ("2.", "Oʻquv va tarbiyaviy ishlar boʻyicha direktor oʻrinbosari", "Direktor oʻrinbosari", "Komissiya raisi oʻrinbosari"),
        ("3.", "Ilmiy ishlar va innovatsiyalar boʻyicha direktor oʻrinbosari", "Direktor oʻrinbosari", "Komissiya aʼzosi"),
        ("4.", "Yoshlar masalalari va maʼnaviy-maʼrifiy ishlar boʻyicha masʼul", "Boʻlim boshligʻi", "Komissiya aʼzosi"),
        ("5.", "Taʼlim sifatini nazorat qilish boʻlimi boshligʻi", "Boʻlim boshligʻi", "Komissiya aʼzosi"),
        ("6.", "Oʻquv-uslubiy boʻlim boshligʻi", "Boʻlim boshligʻi", "Komissiya aʼzosi"),
        ("7.", "Ilmiy-tadqiqotlar va innovatsiyalar boʻlimi boshligʻi", "Boʻlim boshligʻi", "Komissiya aʼzosi"),
        ("8.", "Xalqaro hamkorlik boʻyicha masʼul mutaxassis", "Masʼul xodim", "Komissiya aʼzosi"),
        ("9.", "Marketing va talabalar amaliyoti (bandlik) boʻlimi boshligʻi", "Boʻlim boshligʻi", "Komissiya aʼzosi"),
        ("10.", "Raqamli taʼlim texnologiyalari markazi boshligʻi", "Markaz boshligʻi", "Texnik kotib"),
        ("11.", "Filial Kasaba uyushmasi qoʻmitasi raisi", "Kasaba uyushmasi raisi", "Mustaqil aʼzo"),
    ]
    for row_data in data_c:
        row = t_com.add_row()
        for idx, text in enumerate(row_data):
            row.cells[idx].width = col_widths_c[idx]
            style_cell(row.cells[idx], text, bold=(idx==0), size=9, align=WD_ALIGN_PARAGRAPH.CENTER if idx in [0,3] else WD_ALIGN_PARAGRAPH.LEFT)

    # ==========================================
    # 4-ILOVA: APELLYATSIYA
    # ==========================================
    doc.add_page_break()
    p_il4 = doc.add_paragraph()
    p_il4.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_il4 = p_il4.add_run("OʻzMU Jizzax filiali direktorining\n2026-yil «___» _________dagi\n___-sonli buyrugʻiga 4-ilova")
    r_il4.font.name = 'Times New Roman'
    r_il4.font.size = Pt(12)
    r_il4.italic = True

    add_heading_p(doc, "KPI BAHOLASH NATIJALARI BOʻYICHA NIZOLI VAZIYATLARNI KOʻRIB CHIQISH VA APELLYATSIYA REGLAMENTI", space_before=8, space_after=12)
    add_p(doc, "1. Apellyatsiya komissiyasi filial professor-oʻqituvchilarining KPI ballarini hisoblash jarayonida yuzaga keladigan eʼtirozlari, baholashdagi noaniqliklar va nizolarni xolis hamda tezkor koʻrib chiqish maqsadida tuziladi.")
    add_p(doc, "2. Apellyatsiya komissiyasi tarkibi 5 kishidan (Ekspert komissiyasiga kirmagan yetakchi professorlar, yuridik xizmat masʼuli va kasaba uyushmasi vakili) iborat tarkibda direktor buyrugʻi bilan tasdiqlanadi.")
    add_p(doc, "3. Apellyatsiya berish tartibi:")
    add_p(doc, "a) Dastlabki reyting natijalari «JBNUU KPI» tizimida eʼlon qilingan kundan boshlab 3 (uch) ish kuni mobaynida professor-oʻqituvchi shaxsiy kabinet orqali elektron asoslantirilgan ariza beradi;")
    add_p(doc, "b) Ariza bilan birgalikda eʼtirozga sabab boʻlgan hujjatning asl nusxasi yoki elektron dalili va Nizomning aniq bandi koʻrsatilgan asosnoma ilova qilinishi shart;")
    add_p(doc, "d) Belgilangan muddatdan kechikib berilgan yoki dalil ilova qilinmagan arizalar koʻrib chiqilmaydi.")
    add_p(doc, "4. Apellyatsiya komissiyasi arizani kelib tushgan kundan eʼtiboran 3 (uch) ish kuni ichida ariza muallifi ishtirokida koʻrib chiqadi va yakuniy xulosa qabul qiladi.")
    add_p(doc, "5. Apellyatsiya komissiyasining xulosasi yakuniy hisoblanadi va ballarga tuzatish kiritish toʻgʻrisidagi bayonnoma filial Kengashiga tasdiqlash uchun taqdim etiladi.")

    # ==========================================
    # 5-ILOVA: RAG'BATLANTIRISH SHKALASI
    # ==========================================
    doc.add_page_break()
    p_il5 = doc.add_paragraph()
    p_il5.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_il5 = p_il5.add_run("OʻzMU Jizzax filiali direktorining\n2026-yil «___» _________dagi\n___-sonli buyrugʻiga 5-ilova")
    r_il5.font.name = 'Times New Roman'
    r_il5.font.size = Pt(12)
    r_il5.italic = True

    add_heading_p(doc, "KPI NATIJALARI ASOSIDA PROFESSOR-OʻQITUVCHILARNI MODDIY VA MAʼNAVIY RAGʻBATLANTIRISH SHKALASI", space_before=8, space_after=12)

    t_rag = doc.add_table(rows=1, cols=4)
    t_rag.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_rag)
    headers_r = ["Toʻplangan ball koʻrsatkichi", "Baholash darajasi", "Oylik ustama miqdori (lavozim maoshiga nisbatan)", "Maʼnaviy va qoʻshimcha ragʻbatlantirish choralari"]
    col_widths_r = [Inches(1.8), Inches(1.5), Inches(2.0), Inches(1.9)]
    for i, title in enumerate(headers_r):
        t_rag.rows[0].cells[i].width = col_widths_r[i]
        style_cell(t_rag.rows[0].cells[i], title, bold=True, size=10, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="E9ECEF")

    data_r = [
        ("86 – 100 ball", "«Aʼlo» (Yetakchi novator pedagog)", "100 foizgacha oylik ustama", "Filial «Yilning eng yaxshi oʻqituvchisi» unvoni, faxriy yorliq, xorijiy stajirovkaga birinchi navbatda tavsiya etish"),
        ("71 – 85 ball", "«Yaxshi» (Faol tashabbuskor pedagog)", "70 foizgacha oylik ustama", "Filial direktorining faxriy yorligʻi, ilmiy konferensiya xarajatlarini toʻliq qoplash"),
        ("56 – 70 ball", "«Qoniqarli» (Namunali pedagog)", "40 foizgacha oylik ustama", "Kafedra mudirining tashakkurnomasi"),
        ("40 – 55 ball (Yosh mutaxassislar uchun: 45–60 ball)", "«Oʻrtacha» (Qoʻshimcha ragʻbat)", "Bir martalik mukofot puli (maoshning 50% gacha) yoki yosh mutaxassisga 40% oylik ustama", "Tegishli yoʻnalishlar boʻyicha faolligini oshirish tavsiyasi"),
        ("40 balldan past", "«Qoniqarsiz»", "Ustama belgilanmaydi", "Kafedra yigʻilishida faoliyati tanqidiy muhokama qilinadi, individual rivojlanish rejasi biriktiriladi"),
    ]
    for row_data in data_r:
        row = t_rag.add_row()
        for idx, text in enumerate(row_data):
            row.cells[idx].width = col_widths_r[idx]
            style_cell(row.cells[idx], text, bold=(idx==0), size=9, align=WD_ALIGN_PARAGRAPH.CENTER if idx in [0,1,2] else WD_ALIGN_PARAGRAPH.LEFT)

    # ==========================================
    # 6-ILOVA: SHTATLAR, LAVOZIMLAR VA TRAEKTORIYALAR MATRITSASI
    # ==========================================
    doc.add_page_break()
    p_il6 = doc.add_paragraph()
    p_il6.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_il6 = p_il6.add_run("OʻzMU Jizzax filiali direktorining\n2026-yil «___» _________dagi\n___-sonli buyrugʻiga 6-ilova")
    r_il6.font.name = 'Times New Roman'
    r_il6.font.size = Pt(12)
    r_il6.italic = True

    add_heading_p(doc, "SHTAT KOEFFITSIYENTLARI, LAVOZIM TOIFALARI VA AKADEMIK TRAEKTORIYALAR TAQSIMOT MATRITSASI", space_before=8, space_after=12)

    # 1. Shtat koeffitsiyentlari jadvali
    add_heading_p(doc, "1. SHTAT BIRLIKLARI VA HISOB-KITOBLAR MATRITSASI", space_before=6, space_after=4, size=12, align=WD_ALIGN_PARAGRAPH.LEFT)
    t_shtat = doc.add_table(rows=1, cols=4)
    t_shtat.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_shtat)
    hdr_sh = ["Shtat stavkasi", "Shtat koeffitsiyenti (K_shtat)", "Hisoblash formulasi", "Ustama toʻlash tartibi"]
    w_sh = [Inches(1.5), Inches(1.6), Inches(2.2), Inches(1.9)]
    for i, title in enumerate(hdr_sh):
        t_shtat.rows[0].cells[i].width = w_sh[i]
        style_cell(t_shtat.rows[0].cells[i], title, bold=True, size=10, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="E9ECEF")

    data_sh = [
        ("1.0 shtat (toʻliq)", "1.00", "Ball_yakuniy = Ball_amalda / 1.0", "Toʻliq lavozim maoshiga nisbatan foiz hisobida"),
        ("0.75 shtat", "0.75", "Ball_yakuniy = Ball_amalda / 0.75", "0.75 shtat lavozim maoshiga nisbatan foiz hisobida"),
        ("0.50 shtat", "0.50", "Ball_yakuniy = Ball_amalda / 0.50", "0.50 shtat lavozim maoshiga nisbatan foiz hisobida"),
        ("0.25 shtat", "0.25", "Ball_yakuniy = Ball_amalda / 0.25", "0.25 shtat lavozim maoshiga nisbatan foiz hisobida"),
        ("1.50 shtat", "1.00 (asosiy)", "Asosiy 1.0 shtat boʻyicha toʻliq hisob", "Asosiy maoshga nisbatan (qoʻshimcha yuklama boʻyicha Kengash qaroriga asosan)"),
    ]
    for row_data in data_sh:
        row = t_shtat.add_row()
        for idx, text in enumerate(row_data):
            row.cells[idx].width = w_sh[idx]
            style_cell(row.cells[idx], text, bold=(idx==0), size=9, align=WD_ALIGN_PARAGRAPH.CENTER if idx in [0,1] else WD_ALIGN_PARAGRAPH.LEFT)

    # 2. Lavozim toifalari bo'yicha talablar jadvali
    add_heading_p(doc, "2. LAVOZIM TOIFALARI KESIMIDA BLOKLAR VAZN TAQSIMOTI", space_before=12, space_after=4, size=12, align=WD_ALIGN_PARAGRAPH.LEFT)
    t_lav = doc.add_table(rows=1, cols=5)
    t_lav.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_lav)
    hdr_lav = ["Faoliyat bloklari", "I toifa (Professor/Dotsent, DSc/PhD)", "II toifa (Katta oʻqituvchi)", "III toifa (Assistent / Oʻqituvchi-stajyor)", "Moslashuv davridagi yosh oʻqituvchi"]
    w_lav = [Inches(2.0), Inches(1.3), Inches(1.3), Inches(1.3), Inches(1.3)]
    for i, title in enumerate(hdr_lav):
        t_lav.rows[0].cells[i].width = w_lav[i]
        style_cell(t_lav.rows[0].cells[i], title, bold=True, size=9, align=WD_ALIGN_PARAGRAPH.CENTER, bg_color="E9ECEF")

    data_lav = [
        ("Oʻquv-uslubiy ishlar", "20 ball", "35 ball", "40 ball", "45 ball"),
        ("Ilmiy-tadqiqot ishlari", "50 ball (Scopus/grant/Xirsh)", "30 ball", "15 ball", "15 ball (til sertifikati bilan)"),
        ("Xalqaro hamkorlik", "20 ball", "15 ball", "15 ball", "10 ball"),
        ("Maʼnaviy ishlar va bandlik", "10 ball", "20 ball", "30 ball", "30 ball (davomat va toʻgarak)"),
        ("Jami talab meʼyori", "100 ball", "100 ball", "100 ball", "100 ball (Ostona: 45 ball)"),
    ]
    for row_data in data_lav:
        row = t_lav.add_row()
        for idx, text in enumerate(row_data):
            row.cells[idx].width = w_lav[idx]
            style_cell(row.cells[idx], text, bold=(idx==0 or idx==4), size=9, align=WD_ALIGN_PARAGRAPH.CENTER if idx > 0 else WD_ALIGN_PARAGRAPH.LEFT)

    output_path = "/Users/macbookprom1/Documents/KPI JBNUU/O_zMU_Jizzax_filiali_KPI_Nizomi_2026.docx"
    doc.save(output_path)
    print(f"Birlashtirilgan to'liq hujjat saqlandi: {output_path}")

if __name__ == "__main__":
    generate_unified_kpi_doc()
