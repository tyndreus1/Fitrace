/**
 * Haftalık beslenme programı — protein ağırlıklı, ılımlı kalori fazlası.
 * Hedef: kas kütlesini artırmak, kalça/bacak dolgunluğunu geri kazanmak.
 * Günlük ortalama ≈ 2100 kcal / 105-115 g protein.
 */

const day = (name, theme, meals, tip) => ({ name, theme, meals, tip })
const m = (time, title, items, kcal, protein) => ({ time, title, items, kcal, protein })

export const MEAL_PLAN = [
  day(
    'Pazartesi',
    'Güçlü başlangıç',
    [
      m('08:00', 'Kahvaltı', [
        '3 yumurtalı omlet (1 tatlı kaşığı tereyağı)',
        '2 dilim tam buğday ekmeği',
        '1 dilim beyaz peynir, 5 zeytin, domates-salatalık',
        '1 bardak süt',
      ], 540, 32),
      m('11:00', 'Ara öğün', ['1 kase süzme yoğurt', '1 yemek kaşığı bal', '5 ceviz içi'], 290, 14),
      m('13:30', 'Öğle', [
        '130 g ızgara tavuk göğsü',
        '1 porsiyon bulgur pilavı',
        'Bol yeşil salata + 1 kaşık zeytinyağı',
        '1 bardak ayran',
      ], 570, 40),
      m('17:00', 'Antrenman öncesi', ['1 muz', '1 yemek kaşığı fıstık ezmesi'], 170, 5),
      m('20:00', 'Akşam', [
        '1 porsiyon kuru fasulye (etli)',
        '1 porsiyon pirinç pilavı',
        '1 kase yoğurt',
      ], 540, 23),
    ],
    'Antrenman günü. Akşam yemeğini antrenmandan sonraki 2 saat içinde yemeye çalış.',
  ),
  day(
    'Salı',
    'Omega-3 günü',
    [
      m('08:00', 'Kahvaltı', [
        'Yulaf lapası: 50 g yulaf + 200 ml süt',
        '1 ölçek protein tozu karıştır',
        '1 avuç çilek, 1 tatlı kaşığı tahin',
      ], 530, 36),
      m('11:00', 'Ara öğün', ['1 kase yoğurt', '2 kuru kayısı', '10 badem'], 280, 11),
      m('13:30', 'Öğle', [
        '1 kase mercimek çorbası',
        '2 dilim tam buğday ekmeği',
        '1 porsiyon zeytinyağlı taze fasulye',
        '60 g lor peyniri',
      ], 490, 25),
      m('16:30', 'Antrenman öncesi', ['1 elma', '1 avuç fındık'], 230, 5),
      m('20:00', 'Akşam', [
        '130 g fırında somon',
        '1 porsiyon fırın patates',
        'Roka-limon salatası',
      ], 560, 30),
    ],
    'Üst vücut günü. Somon ve ceviz cilt için de iyi: omega-3 iltihabı azaltmaya yardımcı olur.',
  ),
  day(
    'Çarşamba',
    'Kırmızı et günü',
    [
      m('08:00', 'Kahvaltı', [
        'Menemen (3 yumurta, domates, biber)',
        '2 dilim ekmek',
        '1 bardak kefir',
      ], 500, 29),
      m('11:00', 'Ara öğün', ['1 kase süzme yoğurt + 1 kaşık pekmez', '5 ceviz'], 300, 13),
      m('13:30', 'Öğle', [
        '120 g dana köfte (4 adet)',
        '1 porsiyon bulgur pilavı',
        'Piyaz veya çoban salata',
      ], 590, 32),
      m('17:00', 'Ara öğün', ['1 dilim tam buğday ekmeği + 1 kaşık fıstık ezmesi'], 210, 8),
      m('20:00', 'Akşam', [
        '1 porsiyon nohut yemeği',
        '1 kase yoğurt',
        '1 dilim ekmek',
      ], 490, 21),
    ],
    'Antrenman yok, dinlenme günü. Kırmızı et demir ve çinko açısından zengin; çinko ciltteki sivilcelenmeye de iyi gelir.',
  ),
  day(
    'Perşembe',
    'Hafif ama dolgun',
    [
      m('08:00', 'Kahvaltı', [
        '2 haşlanmış yumurta',
        '60 g lor peyniri + 1 tatlı kaşığı zeytinyağı',
        '2 dilim tam buğday ekmeği, domates',
        '1 bardak süt',
      ], 510, 34),
      m('11:00', 'Ara öğün', ['1 muz', '1 kase yoğurt'], 260, 10),
      m('13:30', 'Öğle', [
        '1 porsiyon tavuklu makarna (130 g tavuk)',
        'Yeşil salata',
        '1 bardak ayran',
      ], 610, 44),
      m('16:30', 'Antrenman öncesi', ['1 avuç badem', '2 hurma'], 220, 7),
      m('20:00', 'Akşam', [
        '1 kase sebze çorbası',
        '1 porsiyon humus + 1 dilim ekmek',
        '1 dilim kaşar peyniri',
      ], 450, 19),
    ],
    'İştahın kapalıysa öğünleri küçült ama sayısını azaltma. Sıvı kalori (süt, smoothie) işini kolaylaştırır.',
  ),
  day(
    'Cuma',
    'Kalça-bacak günü',
    [
      m('08:00', 'Kahvaltı', [
        '3 yumurtalı sahanda',
        '2 dilim ekmek, 1 dilim beyaz peynir',
        '1 bardak taze sıkılmış portakal suyu',
      ], 530, 29),
      m('11:00', 'Ara öğün', ['Protein smoothie: 1 ölçek protein + 1 muz + 250 ml süt'], 350, 30),
      m('13:30', 'Öğle', [
        '130 g ızgara hindi veya tavuk',
        '1 porsiyon pirinç pilavı',
        'Yoğurtlu semizotu',
      ], 590, 42),
      m('17:00', 'Antrenman öncesi', ['1 dilim simit + 1 dilim peynir'], 230, 10),
      m('20:30', 'Akşam', [
        '1 porsiyon zeytinyağlı sebze',
        '2 dilim ekmek',
        '1 kase süzme yoğurt',
      ], 450, 17),
    ],
    'Bugün alt vücut antrenmanı var. Antrenman sonrası 30 dakika içinde protein almaya çalış.',
  ),
  day(
    'Cumartesi',
    'Serbest ama akıllı',
    [
      m('09:30', 'Geç kahvaltı', [
        'Serpme kahvaltı: 2 yumurta, peynir çeşidi, zeytin, bal-kaymak',
        '2-3 dilim ekmek',
      ], 650, 30),
      m('13:00', 'Ara öğün', ['1 kase yoğurt + meyve'], 240, 10),
      m('16:00', 'Öğle/Akşam arası', [
        'Dışarıda: 1 porsiyon tavuk döner veya 1 lahmacun + ayran',
        'Yanına bol salata',
      ], 540, 29),
      m('20:30', 'Akşam', [
        'Ev yemeği: 1 porsiyon etli sebze yemeği',
        '1 kase yoğurt',
      ], 420, 25),
      m('22:00', 'Gece', ['1 bardak süt + 1 kaşık tahin-pekmez'], 240, 9),
    ],
    'Haftada bir gün esnek olmak programı sürdürülebilir kılar. Suçluluk yok, sadece devam.',
  ),
  day(
    'Pazar',
    'Toparlanma',
    [
      m('09:00', 'Kahvaltı', [
        'Yulaflı pancake (50 g yulaf, 2 yumurta, 1 muz)',
        'Üzerine 1 kaşık fıstık ezmesi',
        '1 bardak süt',
      ], 570, 32),
      m('12:00', 'Ara öğün', ['1 kase süzme yoğurt + 5 ceviz'], 300, 15),
      m('14:30', 'Öğle', [
        '1 porsiyon fırında tavuk + sebze',
        '1 porsiyon bulgur pilavı',
        'Cacık',
      ], 590, 40),
      m('18:00', 'Ara öğün', ['2 dilim bitter çikolata', '1 avuç fındık'], 230, 5),
      m('20:30', 'Akşam', [
        '1 kase mercimek çorbası',
        '1 tost (kaşarlı)',
      ], 370, 19),
    ],
    'Dinlenme günü. Hafif yürüyüş ve esneme kas ağrısını azaltır.',
  ),
]

export const SHOPPING_LIST = [
  { group: 'Protein', items: ['Yumurta (30 adet)', 'Tavuk göğsü (1 kg)', 'Dana kıyma (500 g)', 'Somon (2 porsiyon)', 'Hindi/kuşbaşı (500 g)', 'Protein tozu'] },
  { group: 'Süt ürünleri', items: ['Tam yağlı süt (3 L)', 'Yoğurt (2 kg)', 'Süzme yoğurt (1 kg)', 'Lor peyniri', 'Beyaz peynir', 'Kefir'] },
  { group: 'Tahıl & baklagil', items: ['Yulaf', 'Bulgur', 'Pirinç', 'Makarna', 'Kuru fasulye', 'Nohut', 'Kırmızı mercimek', 'Tam buğday ekmeği'] },
  { group: 'Yağ & kuruyemiş', items: ['Zeytinyağı', 'Tereyağı', 'Ceviz', 'Badem', 'Fındık', 'Fıstık ezmesi', 'Tahin', 'Pekmez', 'Bal'] },
  { group: 'Sebze & meyve', items: ['Domates', 'Salatalık', 'Yeşillik', 'Ispanak/semizotu', 'Patates', 'Muz', 'Elma', 'Çilek', 'Portakal', 'Kuru kayısı, hurma'] },
]

export const NUTRITION_RULES = [
  {
    icon: '🥚',
    title: 'Her öğünde protein',
    text: 'Her ana öğünde 25-35 g protein hedefle. Kas ancak düzenli protein akışıyla büyür; günün tamamını akşama sıkıştırmak işe yaramaz.',
  },
  {
    icon: '➕',
    title: 'Fazla ama ölçülü',
    text: 'Günlük ihtiyacının ~350 kalori üstünde kal. Daha fazlası kastan çok yağ olarak birikir, daha azı ise kilo aldırmaz.',
  },
  {
    icon: '🍽️',
    title: 'Öğün atlama',
    text: 'İştahın kapalı olduğu günlerde porsiyonu küçült, öğünü atlama. 5-6 küçük öğün, 3 büyük öğünden daha kolay yenir.',
  },
  {
    icon: '🥤',
    title: 'Sıvı kaloriler dost',
    text: 'Süt, ayran, smoothie ve tahin-pekmez tok hissettirmeden kalori ekler. İştahsız günlerin kurtarıcısı.',
  },
  {
    icon: '💧',
    title: 'Su',
    text: 'Günde ~2,2 litre. Su kas dolgunluğunu ve cilt görünümünü doğrudan etkiler.',
  },
  {
    icon: '😴',
    title: 'Uyku',
    text: '7-9 saat. Kas antrenmanda değil uykuda onarılır; ayrıca uyku hormonal dengeyi ve cildi toparlar.',
  },
]

export function todaysPlan(date = new Date()) {
  // getDay: 0 = Pazar. Programımız Pazartesi ile başlıyor.
  const idx = (date.getDay() + 6) % 7
  return { index: idx, plan: MEAL_PLAN[idx] }
}

export function planDayTotals(plan) {
  return plan.meals.reduce(
    (acc, meal) => ({ kcal: acc.kcal + meal.kcal, protein: acc.protein + meal.protein }),
    { kcal: 0, protein: 0 },
  )
}
