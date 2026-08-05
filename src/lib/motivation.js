/**
 * Motivasyon içerikleri. Hepsi sabit metin: internet olmasa da çalışır.
 * Yapay zekâ koçu bunların üstüne kişiselleştirilmiş mesaj ekler.
 */

export const AFFIRMATIONS = [
  'Bugün vücuduna bir şey vermek için buradasın, ondan bir şey almak için değil.',
  'Kas bir günde gelmez; ama her öğün, her set onu bir adım yaklaştırır.',
  'Aynadaki değişimi görmeden önce mezuradaki değişimi görürsün. Sabır.',
  'İştahın yoksa bu senin suçun değil. Küçük porsiyon da bir adımdır.',
  'Bugün planı bozduysan yarın değil, bir sonraki öğünde geri dön.',
  'Gücün arttıkça formun da artacak. Ağırlıklara odaklan, tartı sonra gelir.',
  'Vücudun seni bugüne kadar taşıdı. Ona iyi bakmayı hak ediyor.',
  'Kilo almak da en az vermek kadar disiplin ister. Zoru yapıyorsun.',
  'Yediğin her gram protein, kalçana ve bacağına yazılan bir mektup.',
  'Kendine karşı nazik ol; ilerlemenin en hızlı yolu bu.',
  'Bir hafta sonuç vermez, üç ay verir. Sen sadece devam et.',
  'Tartı bir sayı, sen bir insansın. Sayı düşse de plan aynı.',
  'Bugün antrenmana gitmek istemiyorsan sadece 10 dakika dene. Genelde kalırsın.',
  'Su iç. Cildin de kasların da bunu hissediyor.',
  'Uyku, programın görünmeyen ama en önemli parçası.',
  'Dünkü halinle yarış, başkasıyla değil.',
  'Vücudun değişirken kendine alışman da zaman alır. Bu normal.',
  'Küçük tutarlılık, büyük motivasyonu her zaman yener.',
  'Bu program bir ceza değil, kendine yaptığın bir yatırım.',
  'Zor günler de programın parçası. Onları da kaydet, sonra gülümseyerek okursun.',
  'Bugün bir öğün fazladan yediysen, hedefine doğru fazladan bir adım attın demektir.',
  'Aynaya bakarken eksik aradığını fark edersen, dur ve ne kazandığını say.',
]

export const HARD_DAY_NOTES = [
  {
    title: 'Hiç yemek istemiyorum',
    text: 'Katı yemek zor geliyorsa sıvıya geç: 250 ml süt + 1 muz + 1 kaşık fıstık ezmesi ≈ 400 kalori ve çiğnemek gerektirmiyor. Bugünü kurtarmak yeterli.',
  },
  {
    title: 'Tartı düştü / artmıyor',
    text: 'Kilo günden güne 1-1,5 kg oynayabilir; su, tuz ve regl döngüsü etkiler. Haftalık ortalamaya bak, tek güne değil.',
  },
  {
    title: 'Kendimi kötü hissediyorum',
    text: 'Ruh hâlin bugün düşükse önce temel şeylere dön: su, bir öğün, kısa bir yürüyüş, biriyle konuşmak. Bu his birkaç günden uzun sürüyorsa doktoruna söylemek zayıflık değil, akıllılık.',
  },
  {
    title: 'Programı bozdum',
    text: 'Tek bir gün üç aylık ilerlemeyi silmez. Bir sonraki öğünde plana dön; telafi etmek için aç kalma.',
  },
  {
    title: 'Antrenmana gidecek enerjim yok',
    text: 'Set sayısını yarıya indir ama git. Yarım antrenman, yapılmayan antrenmandan her zaman iyidir.',
  },
]

export const SKIN_TIPS = [
  {
    icon: '🐟',
    title: 'Omega-3',
    text: 'Somon, hamsi, ceviz ve keten tohumu iltihabı azaltmaya yardımcı olur. Haftada 2 kez yağlı balık hedefle.',
  },
  {
    icon: '🥜',
    title: 'Çinko',
    text: 'Kırmızı et, kabak çekirdeği, nohut ve yumurta sarısı çinko kaynağı. Çinko cilt yenilenmesinde rol oynar.',
  },
  {
    icon: '🍞',
    title: 'Kan şekeri dalgalanması',
    text: 'Çok şekerli ve çok işlenmiş gıdalar bazı kişilerde sivilceyi tetikleyebilir. Karbonhidratı proteinle birlikte al, tek başına değil.',
  },
  {
    icon: '🥛',
    title: 'Süt ürünleri',
    text: 'Bazı kişilerde süt sivilceyi artırabilir. Emin olmak için 3-4 hafta azalt, cildini gözle, sonra karar ver. Kesip atmadan önce dene.',
  },
  {
    icon: '💧',
    title: 'Su ve uyku',
    text: 'Yetersiz su ve uykusuzluk cilt bariyerini bozar. Bu ikisi en ucuz cilt bakımı.',
  },
  {
    icon: '👩‍⚕️',
    title: 'Ne zaman doktora?',
    text: 'Sivilcelenme 2-3 ayda düzelmiyor, iz bırakıyor ya da adet düzensizliği/aşırı tüylenme gibi başka belirtiler varsa bir dermatoloji ve/veya endokrinoloji değerlendirmesi iste. Hormonal bir neden varsa tedavisi var.',
  },
]

export const WEEKLY_CHALLENGES = [
  { icon: '🥤', title: 'Her gün 1 protein shake', desc: 'Yedi günün yedisinde de bir protein içeceği ekle.' },
  { icon: '📏', title: 'Ölçü haftası', desc: 'Hafta başında ve sonunda kalça-uyluk ölçünü al.' },
  { icon: '🍑', title: 'Kalça haftası', desc: 'Hip thrust ağırlığını geçen haftaya göre artır.' },
  { icon: '💧', title: 'Su serisi', desc: '7 gün üst üste su hedefini tuttur.' },
  { icon: '🍽️', title: 'Öğün atlama yok', desc: 'Bu hafta hiçbir ana öğünü atlama.' },
  { icon: '😴', title: 'Uyku düzeni', desc: '7 gün boyunca aynı saatte yat.' },
  { icon: '📸', title: 'İlerleme fotoğrafı', desc: 'Aynı ışıkta, aynı açıyla bir fotoğraf çek ve sakla.' },
  { icon: '📝', title: 'Günlük kayıt', desc: 'Yediğin her şeyi 7 gün boyunca kaydet.' },
]

function dayIndex(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date - start) / 86400000)
}

export function affirmationOfTheDay(date = new Date()) {
  return AFFIRMATIONS[dayIndex(date) % AFFIRMATIONS.length]
}

export function challengeOfTheWeek(date = new Date()) {
  return WEEKLY_CHALLENGES[Math.floor(dayIndex(date) / 7) % WEEKLY_CHALLENGES.length]
}

export const MOODS = [
  { value: 1, emoji: '😞', label: 'Çok kötü' },
  { value: 2, emoji: '🙁', label: 'Kötü' },
  { value: 3, emoji: '😐', label: 'İdare eder' },
  { value: 4, emoji: '🙂', label: 'İyi' },
  { value: 5, emoji: '😄', label: 'Harika' },
]

export const SKIN_STATES = [
  { value: 1, emoji: '😖', label: 'Çok kötü' },
  { value: 2, emoji: '😕', label: 'Kötü' },
  { value: 3, emoji: '😐', label: 'Normal' },
  { value: 4, emoji: '🙂', label: 'İyi' },
  { value: 5, emoji: '✨', label: 'Pırıl pırıl' },
]
