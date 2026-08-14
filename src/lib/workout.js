/**
 * Haftalık antrenman programı — kalça ve bacak önceliğli hipertrofi.
 * Hedef, kilo alırken kazanılan kütlenin mümkün olduğunca kas olması ve
 * dolgunluğun istenen bölgelerde (kalça, uyluk) toplanması.
 */

const ex = (name, sets, reps, note) => ({ name, sets, reps, note })

export const WORKOUT_WEEK = [
  {
    day: 'Pazartesi',
    focus: 'Alt vücut — Kalça öncelikli',
    icon: '🍑',
    exercises: [
      ex('Hip thrust (kalça köprüsü, ağırlıklı)', 4, '8-12', 'Programın en önemli hareketi. Tepede 1 saniye sık.'),
      ex('Goblet squat', 3, '10-12', 'Göğüs dik, dizler parmak hizasında.'),
      ex('Romen deadlift (RDL)', 3, '10-12', 'Arka bacak ve kalçayı hedefler, bel düz kalsın.'),
      ex('Bulgarian split squat', 3, '10 / bacak', 'Denge zorlarsa duvara tutun.'),
      ex('Kalça abduksiyonu (bant veya makine)', 3, '15-20', 'Yan kalçayı doldurur, silueti yuvarlaklaştırır.'),
    ],
    homeAlt: 'Ağırlık yoksa: sırtı koltuğa dayalı hip thrust, çanta ile goblet squat, direnç bandıyla abduksiyon.',
  },
  {
    day: 'Salı',
    focus: 'Üst vücut — İtme + çekme',
    icon: '💪',
    exercises: [
      ex('Dumbbell göğüs press', 3, '8-12', ''),
      ex('Tek kol dumbbell row', 3, '10-12', 'Sırt duruşunu düzeltir, omuzları geriye alır.'),
      ex('Omuz press', 3, '10-12', ''),
      ex('Lat pulldown veya avustralya barfiks', 3, '10-12', ''),
      ex('Biceps curl + triceps pushdown', 2, '12-15', 'Süperset yapabilirsin.'),
    ],
    homeAlt: 'Evde: şınav (dizden), su bidonu ile row ve omuz press, havlu ile direnç.',
  },
  {
    day: 'Çarşamba',
    focus: 'Dinlenme veya hafif hareket',
    icon: '🚶‍♀️',
    exercises: [
      ex('30-40 dakika tempolu yürüyüş', 1, '—', 'Kalp sağlığı için, kas kaybettirmeyecek kadar hafif.'),
      ex('Esneme / mobilite', 1, '10 dk', 'Kalça fleksörü ve hamstring esnetmesi.'),
    ],
    homeAlt: '',
  },
  {
    day: 'Perşembe',
    focus: 'Alt vücut — Bacak hacmi',
    icon: '🦵',
    exercises: [
      ex('Back squat veya leg press', 4, '8-12', 'Uyluk hacmi için en verimli hareket.'),
      ex('Hip thrust', 3, '10-12', 'Haftanın ikinci kalça uyarımı.'),
      ex('Walking lunge', 3, '12 adım / bacak', ''),
      ex('Leg curl (arka bacak)', 3, '12-15', ''),
      ex('Calf raise (baldır)', 3, '15-20', ''),
    ],
    homeAlt: 'Evde: sırt çantası ile squat, yerde hip thrust, geriye hamle, tek bacak köprü.',
  },
  {
    day: 'Cuma',
    focus: 'Tüm vücut + karın',
    icon: '🔥',
    exercises: [
      ex('Deadlift (hafif-orta)', 3, '6-8', 'Form önce gelir, ağırlık sonra.'),
      ex('Hip thrust veya glute bridge', 3, '12-15', ''),
      ex('Dumbbell press + row süperset', 3, '10-12', ''),
      ex('Plank', 3, '30-45 sn', ''),
      ex('Yan plank', 2, '20-30 sn / taraf', 'Bel çevresini sıkılaştırır, kalçayı daha belirgin gösterir.'),
    ],
    homeAlt: 'Evde: tek bacak RDL, şınav, ters mekik, plank varyasyonları.',
  },
  {
    day: 'Cumartesi',
    focus: 'Serbest — keyif hareketi',
    icon: '🧘‍♀️',
    exercises: [
      ex('Pilates, yoga, dans veya uzun yürüyüş', 1, '30-45 dk', 'Ne istersen. Hareket etmek yeterli.'),
    ],
    homeAlt: '',
  },
  {
    day: 'Pazar',
    focus: 'Tam dinlenme',
    icon: '💤',
    exercises: [ex('Dinlen', 1, '—', 'Kaslar bugün büyüyor. Dinlenmek programın parçası.')],
    homeAlt: '',
  },
]

export const TRAINING_RULES = [
  {
    icon: '📈',
    title: 'Progresif yüklenme',
    text: 'Her hafta ya 1-2 tekrar ya da biraz daha ağırlık ekle. Kas ancak zorlandığında büyür — aynı ağırlıkla aylarca çalışmak sonuç vermez.',
  },
  {
    icon: '⏱️',
    title: 'Dinlenme süresi',
    text: 'Büyük hareketlerde setler arası 90-120 saniye, izolasyonlarda 60 saniye dinlen.',
  },
  {
    icon: '🎯',
    title: 'Kardiyoyu abartma',
    text: 'Haftada 2-3 kez hafif yürüyüş yeterli. Fazla kardiyo kilo almanı zorlaştırır.',
  },
  {
    icon: '🍑',
    title: 'Neden hip thrust?',
    text: 'Kalça kaslarını en yüksek gerilimde çalıştıran hareket. Kalça ve bacak dolgunluğu istiyorsan programın merkezinde olmalı.',
  },
  {
    icon: '🥗',
    title: 'Antrenman + beslenme birlikte',
    text: 'Kalori fazlası olmadan antrenman kas yapmaz; antrenman olmadan kalori fazlası çoğunlukla yağ yapar. İkisi birlikte çalışır.',
  },
]

export function todaysWorkout(date = new Date()) {
  const idx = (date.getDay() + 6) % 7
  return { index: idx, workout: WORKOUT_WEEK[idx] }
}
