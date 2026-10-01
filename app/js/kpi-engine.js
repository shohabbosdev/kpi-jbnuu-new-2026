// JBNUU KPI Hisoblash va Mezonlar Dvigateli

export class KpiEngine {
  /**
   * Professor-o'qituvchining yakuniy reyting balini hisoblash
   */
  static calculateTeacherScore(teacher) {
    const s = teacher.scores;
    let oqv = Math.min(s.oqv, 30);
    let ilm = s.ilm;
    let xal = Math.min(s.xal, 20);
    let man = s.man;
    let jarima = s.jarima || 0;

    // Flex qoidasi (Yutuqlar kompensatsiyasi):
    // Ilmiy-innovatsion blokda 40 balldan ortiq to'plangan ball
    // ma'naviy-ma'rifiy blokdagi yetishmovchilikni qoplashga yo'naltiriladi.
    let flexSurplus = 0;
    if (teacher.rawIlm && teacher.rawIlm > 40) {
      flexSurplus = teacher.rawIlm - 40;
      ilm = 40;
    } else {
      ilm = Math.min(s.ilm, 40);
    }

    let effectiveMan = man;
    let flexApplied = 0;
    if (effectiveMan < 10 && flexSurplus > 0) {
      const needed = 10 - effectiveMan;
      flexApplied = Math.min(needed, flexSurplus);
      effectiveMan += flexApplied;
    }

    const rawTotal = oqv + ilm + xal + effectiveMan + jarima;

    // Shtat koeffitsiyenti bo'yicha normallashtirish:
    // Ball_yakuniy = Ball_amalda / Shtat_birligi
    const fte = teacher.fte || 1.0;
    const normalizedScore = Math.round((rawTotal / fte) * 10) / 10;

    const svetafor = this.getSvetaforCategory(normalizedScore, teacher.isFirstYear);

    return {
      oqv,
      ilm,
      xal,
      man: effectiveMan,
      flexApplied,
      jarima,
      rawTotal,
      fte,
      normalizedScore,
      svetafor
    };
  }

  /**
   * Svetafor tasnifi bo'yicha toifani aniqlash
   */
  static getSvetaforCategory(score, isFirstYear = false) {
    if (score >= 71) {
      return {
        zone: 'green',
        label: 'Yashil toifa (Yuqori koʻrsatkich)',
        sublabel: score >= 86 ? '100 foiz oylik ustama' : '70 foiz oylik ustama',
        badgeClass: 'green',
        progressPercent: Math.min(100, Math.round(score)),
        nextTierHint: score >= 86 ? 'Oliy koʻrsatkichga erishildi' : `100 foiz ustama uchun yana ${Math.round(86 - score)} ball zarur`
      };
    } else if (score >= 56 || (isFirstYear && score >= 45)) {
      return {
        zone: 'yellow',
        label: 'Sariq toifa (Qoniqarli)',
        sublabel: '40 foiz oylik ustama',
        badgeClass: 'yellow',
        progressPercent: Math.min(100, Math.round(score)),
        nextTierHint: `Yashil toifaga oʻtish uchun yana ${Math.round(71 - score)} ball zarur`
      };
    } else if (score >= 40) {
      return {
        zone: 'yellow',
        label: 'Sariq toifa (Chegaraviy holat)',
        sublabel: 'Bir martalik ragʻbatlantirish',
        badgeClass: 'yellow',
        progressPercent: Math.min(100, Math.round(score)),
        nextTierHint: `40 foiz ustama toifasiga oʻtish uchun yana ${Math.round(56 - score)} ball zarur`
      };
    } else {
      return {
        zone: 'red',
        label: 'Qizil toifa (Qoniqarsiz)',
        sublabel: 'Ustama belgilanmaydi',
        badgeClass: 'red',
        progressPercent: Math.min(100, Math.round(score)),
        nextTierHint: `Belgilangan meʼyorga erishish uchun yana ${Math.round(40 - score)} ball zarur`
      };
    }
  }

  /**
   * Filial bo'yicha umumiy reyting statistikasini hisoblash
   */
  static getSvetaforStats(teachersList) {
    let green = 0;
    let yellow = 0;
    let red = 0;
    let totalScoreSum = 0;

    teachersList.forEach(t => {
      const res = this.calculateTeacherScore(t);
      totalScoreSum += res.normalizedScore;
      if (res.svetafor.zone === 'green') green++;
      else if (res.svetafor.zone === 'yellow') yellow++;
      else red++;
    });

    const total = teachersList.length;
    const avgScore = total > 0 ? Math.round((totalScoreSum / total) * 10) / 10 : 0;

    return {
      total,
      avgScore,
      greenCount: green,
      greenPercent: total > 0 ? Math.round((green / total) * 100) : 0,
      yellowCount: yellow,
      yellowPercent: total > 0 ? Math.round((yellow / total) * 100) : 0,
      redCount: red,
      redPercent: total > 0 ? Math.round((red / total) * 100) : 0
    };
  }
}
