import { INDICATORS, TEACHERS_DATA, RECENT_SUBMISSIONS } from './data.js';
import { KpiEngine } from './kpi-engine.js';

class KpiApp {
  constructor() {
    this.currentRole = 'TEACHER'; // 'TEACHER' | 'HEAD_OF_DEPT' | 'RECTORATE'
    this.currentTeacher = TEACHERS_DATA[0];
    this.teachers = [...TEACHERS_DATA];
    this.submissions = [...RECENT_SUBMISSIONS];
    this.activeSvetaforFilter = 'ALL';
    this.searchQuery = '';
    this.activeIndicatorBlock = 'ALL';
    this.activePage = 'dashboard';

    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Chap menyu sahifalarini almashtirish
    const navItems = document.querySelectorAll('.nav-menu .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        this.navigateToPage(page);
      });
    });

    // Rol almashtirgich
    const roleBtns = document.querySelectorAll('.role-btn');
    roleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetRole = e.currentTarget.dataset.role;
        this.switchRole(targetRole);
      });
    });

    // Modal ochish va yopish
    const openModalBtn = document.getElementById('btn-open-add-modal');
    if (openModalBtn) {
      openModalBtn.addEventListener('click', () => this.openAddModal());
    }

    const closeModalBtn = document.getElementById('modal-close-btn');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.closeAddModal());
    }

    const cancelModalBtn = document.getElementById('btn-cancel-modal');
    if (cancelModalBtn) {
      cancelModalBtn.addEventListener('click', () => this.closeAddModal());
    }

    // Modal arizasini topshirish
    const addForm = document.getElementById('form-add-kpi');
    if (addForm) {
      addForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Apellyatsiya arizasini topshirish
    const appealForm = document.getElementById('form-appeal');
    if (appealForm) {
      appealForm.addEventListener('submit', (e) => this.handleAppealSubmit(e));
    }

    // DOI orqali avtomatik to'ldirish
    const doiBtn = document.getElementById('btn-doi-lookup');
    if (doiBtn) {
      doiBtn.addEventListener('click', () => this.handleDoiLookup());
    }

    // Mezonlar katalogi filtri (tabs)
    const blockTabBtns = document.querySelectorAll('#indicator-filter-tabs .filter-tab-btn');
    blockTabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        blockTabBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeIndicatorBlock = e.currentTarget.dataset.block;
        this.renderIndicatorsCatalog();
      });
    });

    // Mezonlar qidiruvi
    const indSearch = document.getElementById('indicator-search-input');
    if (indSearch) {
      indSearch.addEventListener('input', () => this.renderIndicatorsCatalog());
    }

    // Modalda indikator tanlanganda izohni yangilash
    const indicatorSelect = document.getElementById('select-indicator');
    if (indicatorSelect) {
      indicatorSelect.addEventListener('change', (e) => {
        const ind = INDICATORS.find(item => item.id === e.target.value);
        const infoDiv = document.getElementById('indicator-info-hint');
        if (ind && infoDiv) {
          infoDiv.innerHTML = `Maksimal ball: <b>${ind.maxBall} ball</b> | Amal qilish muddati: <b>${ind.validity}</b> | Masʼul boʻlim: <b>${ind.dept}</b>`;
        }
      });
    }
  }

  navigateToPage(page) {
    this.activePage = page;
    document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    document.querySelectorAll('.page-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSec = document.getElementById(`section-${page}`);
    if (activeSec) {
      activeSec.classList.add('active');
    }

    const heading = document.getElementById('page-main-heading');
    if (page === 'dashboard') {
      heading.textContent = 'Professor-oʻqituvchilar faoliyatini baholash tizimi';
      this.render();
    } else if (page === 'indicators') {
      heading.textContent = 'KPI Baholash mezonlari katalogi (100 ball)';
      this.renderIndicatorsCatalog();
    } else if (page === 'svetafor') {
      heading.textContent = 'Svetafor monitoringi va moliya byudjeti';
      this.updateBudgetSummary();
    } else if (page === 'appeals') {
      heading.textContent = 'Apellyatsiya komissiyasi faoliyati';
    } else if (page === 'doc') {
      heading.textContent = 'OʻzMU JBNUU KPI Nizomi';
    }
  }

  switchRole(role) {
    this.currentRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === role);
    });

    const userLabel = document.getElementById('sidebar-user-role');
    if (role === 'TEACHER') {
      userLabel.textContent = 'Professor-oʻqituvchi';
    } else if (role === 'HEAD_OF_DEPT') {
      userLabel.textContent = 'Kafedra mudiri (Dasturiy injiniring)';
    } else {
      userLabel.textContent = 'Filial rahbariyati va ekspertlar';
    }

    if (this.activePage === 'dashboard') {
      this.render();
    }
  }

  setSvetaforFilter(filter) {
    this.activeSvetaforFilter = (this.activeSvetaforFilter === filter) ? 'ALL' : filter;
    this.render();
  }

  render() {
    this.renderSvetaforBanner();
    this.renderMainContent();
  }

  renderSvetaforBanner() {
    const stats = KpiEngine.getSvetaforStats(this.teachers);
    const bannerContainer = document.getElementById('svetafor-summary-banner');
    if (!bannerContainer) return;

    bannerContainer.innerHTML = `
      <div class="svetafor-card green-zone ${this.activeSvetaforFilter === 'green' ? 'active-filter' : ''}" id="card-filter-green">
        <div class="svetafor-header">
          <span class="svetafor-title">Yashil toifa (71 – 100 ball)</span>
          <div class="svetafor-dot"></div>
        </div>
        <div class="svetafor-metric">${stats.greenCount} nafar (${stats.greenPercent}%)</div>
        <div class="svetafor-sub">70% dan 100% gacha oylik ustama toʻlanadi</div>
      </div>

      <div class="svetafor-card yellow-zone ${this.activeSvetaforFilter === 'yellow' ? 'active-filter' : ''}" id="card-filter-yellow">
        <div class="svetafor-header">
          <span class="svetafor-title">Sariq toifa (40 – 70 ball)</span>
          <div class="svetafor-dot"></div>
        </div>
        <div class="svetafor-metric">${stats.yellowCount} nafar (${stats.yellowPercent}%)</div>
        <div class="svetafor-sub">40% oylik ustama yoki ragʻbatlantirish</div>
      </div>

      <div class="svetafor-card red-zone ${this.activeSvetaforFilter === 'red' ? 'active-filter' : ''}" id="card-filter-red">
        <div class="svetafor-header">
          <span class="svetafor-title">Qizil toifa (40 balldan past)</span>
          <div class="svetafor-dot"></div>
        </div>
        <div class="svetafor-metric">${stats.redCount} nafar (${stats.redPercent}%)</div>
        <div class="svetafor-sub">Ustama belgilanmaydi (tanqidiy koʻrib chiqiladi)</div>
      </div>
    `;

    document.getElementById('card-filter-green').addEventListener('click', () => this.setSvetaforFilter('green'));
    document.getElementById('card-filter-yellow').addEventListener('click', () => this.setSvetaforFilter('yellow'));
    document.getElementById('card-filter-red').addEventListener('click', () => this.setSvetaforFilter('red'));
  }

  renderMainContent() {
    const mainSection = document.getElementById('dynamic-role-content');
    if (!mainSection) return;

    if (this.currentRole === 'TEACHER') {
      this.renderTeacherView(mainSection);
    } else if (this.currentRole === 'HEAD_OF_DEPT') {
      this.renderHeadOfDeptView(mainSection);
    } else {
      this.renderRectorateView(mainSection);
    }
  }

  renderTeacherView(container) {
    const teacher = this.currentTeacher;
    const calc = KpiEngine.calculateTeacherScore(teacher);

    container.innerHTML = `
      <div class="personal-kpi-card">
        <div class="scorecard-header">
          <div class="scorecard-left">
            <h2>${teacher.name}</h2>
            <div class="meta-tags">
              <span class="meta-pill highlight">${teacher.department}</span>
              <span class="meta-pill">${teacher.position}</span>
              <span class="meta-pill">Shtat stavkasi: <b>${teacher.fte}</b></span>
              <span class="meta-pill">Traektoriya: <b>${teacher.track}</b></span>
              ${teacher.isFirstYear ? '<span class="meta-pill" style="background:#fef3c7; color:#92400e;">Moslashuv davridagi yosh mutaxassis</span>' : ''}
            </div>
          </div>
          <div class="score-display-box">
            <div class="total-score-badge">
              <div class="score-num ${calc.svetafor.badgeClass}">${calc.normalizedScore}</div>
              <div class="score-denom">100 ball meʼyoridan</div>
            </div>
            <div class="svetafor-pill ${calc.svetafor.badgeClass}">
              ${calc.svetafor.label}
            </div>
          </div>
        </div>

        <div class="tier-progress-section">
          <div class="tier-progress-labels">
            <span>Toʻplangan ball: <b>${calc.normalizedScore} ball</b></span>
            <span>Belgilangan miqdor: <b>${calc.svetafor.sublabel}</b> (${calc.svetafor.nextTierHint})</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill ${calc.svetafor.badgeClass}" style="width: ${calc.svetafor.progressPercent}%;"></div>
          </div>
        </div>

        <div class="blocks-grid">
          <div class="block-card">
            <div class="block-title">I. Oʻquv-metodik faoliyat</div>
            <div class="block-score-row">
              <span class="block-current-score">${calc.oqv}</span>
              <span class="block-max">/ 30 ball</span>
            </div>
            <div class="block-bar-bg"><div class="block-bar-fill" style="width: ${(calc.oqv / 30) * 100}%;"></div></div>
          </div>

          <div class="block-card">
            <div class="block-title">II. Ilmiy-innovatsion faoliyat</div>
            <div class="block-score-row">
              <span class="block-current-score">${calc.ilm}</span>
              <span class="block-max">/ 40 ball</span>
            </div>
            <div class="block-bar-bg"><div class="block-bar-fill" style="width: ${(calc.ilm / 40) * 100}%;"></div></div>
            ${teacher.rawIlm > 40 ? `<span class="flex-badge">+${teacher.rawIlm - 40} qoʻshimcha Scopus balli mavjud</span>` : ''}
          </div>

          <div class="block-card">
            <div class="block-title">III. Xalqaro hamkorlik</div>
            <div class="block-score-row">
              <span class="block-current-score">${calc.xal}</span>
              <span class="block-max">/ 20 ball</span>
            </div>
            <div class="block-bar-bg"><div class="block-bar-fill" style="width: ${(calc.xal / 20) * 100}%;"></div></div>
          </div>

          <div class="block-card">
            <div class="block-title">IV. Maʼnaviy va bandlik</div>
            <div class="block-score-row">
              <span class="block-current-score">${calc.man}</span>
              <span class="block-max">/ 10 ball</span>
            </div>
            <div class="block-bar-bg"><div class="block-bar-fill" style="width: ${(calc.man / 10) * 100}%;"></div></div>
            ${calc.flexApplied > 0 ? `<span class="flex-badge">Ilmiy blokdan +${calc.flexApplied} ball qoplandi</span>` : ''}
          </div>
        </div>
      </div>

      <div class="actions-bar">
        <h3 style="font-size: 1.15rem; font-weight: 700;">Taqdim etilgan natijalar va arizalar roʻyxati</h3>
        <button class="btn-primary" id="btn-open-add-modal">
          <span>+ Yangi natija kiritish</span>
        </button>
      </div>

      <div class="data-table-container">
        <table>
          <thead>
            <tr>
              <th>Identifikator</th>
              <th>Mezon kodi</th>
              <th>Hujjat va natija nomi</th>
              <th>Sana</th>
              <th>Hisoblangan ball</th>
              <th>Holati</th>
            </tr>
          </thead>
          <tbody>
            ${this.submissions.filter(s => s.teacherId === teacher.id).map(sub => `
              <tr>
                <td><b>#${sub.id}</b></td>
                <td><span class="meta-pill">${sub.indicatorId}</span></td>
                <td>
                  <div style="font-weight: 600;">${sub.title}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">Asoslovchi hujjat: ${sub.files}</div>
                </td>
                <td>${sub.submittedAt}</td>
                <td><b style="color: var(--primary);">${sub.ball} ball</b></td>
                <td>
                  <span class="status-badge ${sub.status}">
                    ${sub.status === 'approved' ? 'Tasdiqlangan' : sub.status === 'pending' ? 'Koʻrib chiqilmoqda' : 'Rad etilgan'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const openBtn = document.getElementById('btn-open-add-modal');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.openAddModal());
    }
  }

  renderHeadOfDeptView(container) {
    const deptTeachers = this.teachers.filter(t => t.department === 'Dasturiy injiniring kafedrasi');
    const pendingSubs = this.submissions.filter(s => s.status === 'pending' && s.teacherId !== this.currentTeacher.id);

    container.innerHTML = `
      <div class="personal-kpi-card">
        <div class="scorecard-header">
          <div>
            <h2>Dasturiy injiniring kafedrasi boshqaruv paneli</h2>
            <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 4px;">Kafedra mudiri: <b>Prof. Rahimov Ulugʻbek Shavkatovich</b></p>
          </div>
          <div style="background: #e0f2fe; color: #0369a1; padding: 8px 16px; border-radius: var(--radius-md); font-size: 0.84rem; font-weight: 600;">
            Manfaatlar toʻqnashuvi nazorati: Muallif oʻz arizalarini tasdiqlashi cheklangan (fakultet dekanatiga yoʻnaltiriladi)
          </div>
        </div>

        <div class="actions-bar" style="margin-top: 10px;">
          <h3 style="font-size: 1.1rem; font-weight: 700;">Kafedra oʻqituvchilarining tasdiqlash uchun yuborilgan arizalari</h3>
        </div>

        <div class="data-table-container">
          <table>
            <thead>
              <tr>
                <th>Oʻqituvchi</th>
                <th>Mezon</th>
                <th>Taqdim etilgan natija</th>
                <th>Ball</th>
                <th>Asoslovchi hujjat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              ${pendingSubs.length === 0 ? `
                <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Hozirda tasdiqlash kutilayotgan arizalar mavjud emas</td></tr>
              ` : pendingSubs.map(sub => `
                <tr>
                  <td><b>${sub.teacherName}</b></td>
                  <td><span class="meta-pill">${sub.indicatorId}</span></td>
                  <td>${sub.title}</td>
                  <td><b>${sub.ball} ball</b></td>
                  <td><a href="#" style="color: var(--primary-light); font-weight: 600;" onclick="alert('Tasdiqlovchi hujjat koʻrildi: ${sub.files}'); return false;">${sub.files}</a></td>
                  <td>
                    <div class="action-btn-group">
                      <button class="btn-sm approve" onclick="window.kpiApp.verifySubmission(${sub.id}, 'approved')">Tasdiqlash</button>
                      <button class="btn-sm reject" onclick="window.kpiApp.verifySubmission(${sub.id}, 'rejected')">Rad etish</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="actions-bar" style="margin-top: 24px;">
        <h3 style="font-size: 1.15rem; font-weight: 700;">Kafedra aʼzolarining faoliyat reytingi</h3>
      </div>
      <div class="data-table-container">
        <table>
          <thead>
            <tr>
              <th>F.I.Sh.</th>
              <th>Lavozimi</th>
              <th>Shtat birligi</th>
              <th>Umumiy ball</th>
              <th>Svetafor toifasi</th>
              <th>Belgilangan oylik ustama</th>
            </tr>
          </thead>
          <tbody>
            ${deptTeachers.map(t => {
              const res = KpiEngine.calculateTeacherScore(t);
              return `
                <tr>
                  <td><b>${t.name}</b></td>
                  <td>${t.position}</td>
                  <td>${t.fte} stavka</td>
                  <td><b style="font-size: 1.05rem;">${res.normalizedScore}</b></td>
                  <td>
                    <span class="svetafor-pill ${res.svetafor.badgeClass}" style="display:inline-flex;">
                      ${res.svetafor.label}
                    </span>
                  </td>
                  <td><b style="color: var(--primary);">${res.svetafor.sublabel}</b></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderRectorateView(container) {
    let filteredTeachers = this.teachers;
    if (this.activeSvetaforFilter !== 'ALL') {
      filteredTeachers = filteredTeachers.filter(t => {
        const res = KpiEngine.calculateTeacherScore(t);
        return res.svetafor.zone === this.activeSvetaforFilter;
      });
    }

    if (this.searchQuery) {
      filteredTeachers = filteredTeachers.filter(t => 
        t.name.toLowerCase().includes(this.searchQuery) ||
        t.department.toLowerCase().includes(this.searchQuery)
      );
    }

    container.innerHTML = `
      <div class="actions-bar">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 700;">Filial boʻyicha professor-oʻqituvchilarning umumiy reytingi</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Fakultetlar va kafedralar kesimida umumiy koʻrsatkichlar monitoringi</p>
        </div>
        <div class="search-filter-box">
          <input type="text" id="table-search-input" class="search-input" placeholder="Xodim yoki kafedrani qidirish..." value="${this.searchQuery}">
          <button class="btn-primary" onclick="window.kpiApp.exportReport()">
            <span>Hisobotni yuklab olish</span>
          </button>
        </div>
      </div>

      <div class="data-table-container">
        <table>
          <thead>
            <tr>
              <th>Oʻrni</th>
              <th>F.I.Sh.</th>
              <th>Biriktirilgan kafedra</th>
              <th>Lavozimi</th>
              <th>Shtat birligi</th>
              <th>Yakuniy ball</th>
              <th>Toifasi</th>
              <th>Belgilangan ustama miqdori</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTeachers.map((t, idx) => {
              const res = KpiEngine.calculateTeacherScore(t);
              return `
                <tr>
                  <td><b>#${idx + 1}</b></td>
                  <td><b>${t.name}</b> ${t.isHeadOfDept ? '<span class="meta-pill">Kafedra mudiri</span>' : ''}</td>
                  <td>${t.department}</td>
                  <td>${t.position}</td>
                  <td>${t.fte}</td>
                  <td><b style="font-size: 1.05rem; color: var(--primary);">${res.normalizedScore}</b></td>
                  <td>
                    <span class="svetafor-pill ${res.svetafor.badgeClass}" style="display:inline-flex;">
                      ${res.svetafor.label}
                    </span>
                  </td>
                  <td><b>${res.svetafor.sublabel}</b></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    const searchInput = document.getElementById('table-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderRectorateView(container);
      });
    }
  }

  renderIndicatorsCatalog() {
    const tbody = document.getElementById('indicators-table-body');
    const searchVal = document.getElementById('indicator-search-input') ? document.getElementById('indicator-search-input').value.toLowerCase() : '';
    if (!tbody) return;

    let list = INDICATORS;
    if (this.activeIndicatorBlock !== 'ALL') {
      list = list.filter(i => i.block === this.activeIndicatorBlock);
    }
    if (searchVal) {
      list = list.filter(i => i.name.toLowerCase().includes(searchVal) || i.id.includes(searchVal));
    }

    tbody.innerHTML = list.map(item => `
      <tr>
        <td><b>${item.id}</b></td>
        <td>
          <div style="font-weight: 600;">${item.name}</div>
        </td>
        <td><span class="meta-pill">${item.validity}</span></td>
        <td><b style="color: var(--primary);">${item.maxBall} ball</b></td>
        <td><span style="font-size: 0.85rem; color: var(--text-muted);">${item.dept}</span></td>
      </tr>
    `).join('');
  }

  updateBudgetSummary() {
    const stats = KpiEngine.getSvetaforStats(this.teachers);
    const totalEl = document.getElementById('budget-total-teachers');
    const greenEl = document.getElementById('budget-green-count');
    const yellowEl = document.getElementById('budget-yellow-count');
    const redEl = document.getElementById('budget-red-count');

    if (totalEl) totalEl.textContent = `${stats.total} nafar`;
    if (greenEl) greenEl.textContent = `${stats.greenCount} nafar (${stats.greenPercent}%)`;
    if (yellowEl) yellowEl.textContent = `${stats.yellowCount} nafar (${stats.yellowPercent}%)`;
    if (redEl) redEl.textContent = `${stats.redCount} nafar (${stats.redPercent}%)`;
  }

  handleDoiLookup() {
    const doiInput = document.getElementById('input-kpi-doi');
    const titleInput = document.getElementById('input-kpi-title');
    const authorsInput = document.getElementById('input-kpi-authors');
    const indicatorSelect = document.getElementById('select-indicator');

    const doi = doiInput.value.trim();
    if (!doi) {
      alert('Iltimos, avval DOI identifikatorini kiriting (masalan: 10.1016/j.eswa.2026.123456).');
      return;
    }

    // DOI orqali xalqaro ilmiy bazadan avtomat ma'lumot olish simulyatsiyasi
    titleInput.value = 'Deep Learning Frameworks for Academic Performance Optimization in Higher Education';
    authorsInput.value = '3';
    indicatorSelect.value = '2.3'; // Scopus Q1

    alert('DOI identifikatori xalqaro bazadan muvaffaqiyatli tekshirildi:\n\n– Maqola: «Deep Learning Frameworks for Academic Performance Optimization»\n– Jurnal: Expert Systems with Applications (Scopus Q1)\n– Mualliflar soni: 3 nafar');
  }

  handleAppealSubmit(e) {
    e.preventDefault();
    const ind = document.getElementById('appeal-indicator').value;
    const reason = document.getElementById('appeal-reason').value;

    alert(`Apellyatsiya arizasi qabul qilindi (#AP-2026-${Math.floor(Math.random() * 90 + 10)}).\n\nMezon: ${ind}\nAriza 3 ish kuni ichida Apellyatsiya komissiyasi tomonidan koʻrib chiqiladi.`);
    document.getElementById('appeal-reason').value = '';
  }

  verifySubmission(submissionId, newStatus) {
    const sub = this.submissions.find(s => s.id === submissionId);
    if (sub) {
      sub.status = newStatus;
      const xabar = newStatus === 'approved' 
        ? `Arizaning holati «Tasdiqlangan» deb belgilandi.` 
        : `Arizaning holati «Rad etilgan» deb belgilandi.`;
      alert(xabar);
      this.render();
    }
  }

  openAddModal() {
    const modal = document.getElementById('add-kpi-modal');
    if (modal) modal.classList.add('active');
  }

  closeAddModal() {
    const modal = document.getElementById('add-kpi-modal');
    if (modal) modal.classList.remove('active');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const indId = document.getElementById('select-indicator').value;
    const title = document.getElementById('input-kpi-title').value;
    const ind = INDICATORS.find(item => item.id === indId);

    const newSub = {
      id: Date.now(),
      teacherId: this.currentTeacher.id,
      teacherName: this.currentTeacher.name,
      indicatorId: indId,
      title: title,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      ball: ind ? ind.maxBall : 2,
      files: 'tasdiqlovchi_hujjat.pdf',
      dept: ind ? ind.dept : 'Oʻquv-uslubiy boshqarma'
    };

    this.submissions.unshift(newSub);
    alert('Maʼlumot muvaffaqiyatli qabul qilindi hamda ekspert komissiyasi tekshiruviga yuborildi.');
    this.closeAddModal();
    this.render();
  }

  exportReport() {
    alert('OʻzMU Jizzax filiali professor-oʻqituvchilarining rasmiy reyting hisoboti shakllantirildi.');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.kpiApp = new KpiApp();
});
