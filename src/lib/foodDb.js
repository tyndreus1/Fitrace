/**
 * Türk mutfağına göre basit besin veritabanı + serbest metin çözümleyici.
 *
 * Yapay zekâ (Netlify fonksiyonu) çalışmadığında devreye giren çevrimdışı
 * tahmin motoru budur. Değerler 100 gram başınadır; `unitG` bir "adet" ya da
 * "porsiyon"un yaklaşık gram karşılığıdır.
 */

const F = (name, aliases, kcal, p, c, f, unit, unitG) => ({
  name,
  aliases: [name, ...aliases],
  per100: { kcal, p, c, f },
  unit,
  unitG,
})

export const FOODS = [
  // Yumurta & süt ürünleri
  F('yumurta', ['haşlanmış yumurta', 'omlet', 'menemen'], 143, 12.6, 1.1, 9.9, 'adet', 55),
  F('yumurta beyazı', ['beyaz'], 52, 11, 0.7, 0.2, 'adet', 33),
  F('süt', ['tam yağlı süt', 'bardak süt'], 61, 3.3, 4.8, 3.3, 'bardak', 200),
  F('yoğurt', ['kase yoğurt'], 61, 3.5, 4.7, 3.3, 'kase', 200),
  F('süzme yoğurt', ['yunan yoğurdu', 'kaymaksız süzme'], 97, 10, 3.6, 5, 'kase', 150),
  F('kefir', [], 55, 3.3, 4.5, 2.5, 'bardak', 200),
  F('ayran', [], 37, 1.7, 2.6, 2, 'bardak', 200),
  F('lor peyniri', ['lor'], 98, 12, 3.5, 4, 'porsiyon', 60),
  F('beyaz peynir', ['peynir'], 264, 17, 1.5, 21, 'dilim', 30),
  F('kaşar', ['kaşar peyniri', 'kaşer'], 375, 25, 2, 29, 'dilim', 25),
  F('labne', ['krem peynir'], 250, 6, 4, 23, 'porsiyon', 30),

  // Et, tavuk, balık
  F('tavuk göğsü', ['tavuk', 'ızgara tavuk', 'tavuk eti'], 165, 31, 0, 3.6, 'porsiyon', 130),
  F('tavuk but', ['but'], 209, 26, 0, 11, 'porsiyon', 130),
  F('hindi', ['hindi eti'], 135, 29, 0, 2, 'porsiyon', 130),
  F('dana eti', ['dana', 'biftek', 'bonfile'], 217, 26, 0, 12, 'porsiyon', 120),
  F('kıyma', ['dana kıyma'], 250, 26, 0, 16, 'porsiyon', 100),
  F('köfte', ['izgara köfte', 'ızgara köfte'], 240, 18, 6, 16, 'adet', 40),
  F('somon', ['somon balığı'], 208, 20, 0, 13, 'porsiyon', 130),
  F('hamsi', [], 131, 20, 0, 5, 'porsiyon', 120),
  F('levrek', ['çipura', 'balık'], 124, 21, 0, 4, 'porsiyon', 130),
  F('ton balığı', ['ton'], 116, 26, 0, 1, 'kutu', 80),
  F('sucuk', [], 400, 22, 2, 34, 'dilim', 15),
  F('sosis', [], 300, 12, 3, 27, 'adet', 40),

  // Baklagil & tahıl
  F('mercimek çorbası', ['mercimek çorba', 'çorba'], 65, 3.5, 10, 1.5, 'kase', 250),
  F('kırmızı mercimek', ['mercimek'], 116, 9, 20, 0.4, 'porsiyon', 150),
  F('kuru fasulye', ['fasulye'], 127, 8, 22, 0.5, 'porsiyon', 200),
  F('nohut', ['nohut yemeği'], 164, 9, 27, 2.6, 'porsiyon', 180),
  F('humus', [], 177, 8, 20, 8, 'porsiyon', 80),
  F('bulgur pilavı', ['bulgur'], 130, 4, 26, 1.5, 'porsiyon', 180),
  F('pirinç pilavı', ['pilav', 'pirinç'], 150, 3, 28, 3, 'porsiyon', 180),
  F('makarna', ['spagetti', 'erişte'], 158, 6, 30, 1.5, 'porsiyon', 200),
  F('yulaf', ['yulaf ezmesi', 'ovmiyl'], 380, 13, 60, 7, 'porsiyon', 50),
  F('ekmek', ['beyaz ekmek', 'dilim ekmek'], 265, 8, 49, 3, 'dilim', 35),
  F('tam buğday ekmeği', ['kepekli ekmek', 'tam buğday'], 247, 10, 41, 3.4, 'dilim', 35),
  F('simit', [], 320, 9, 60, 4, 'adet', 100),
  F('poğaça', [], 350, 7, 40, 17, 'adet', 80),
  F('börek', ['su böreği', 'sigara böreği'], 290, 8, 30, 15, 'dilim', 120),
  F('patates', ['haşlanmış patates', 'fırın patates'], 87, 2, 20, 0.1, 'porsiyon', 150),
  F('patates kızartması', ['kızartma'], 312, 3.4, 41, 15, 'porsiyon', 130),

  // Sebze & salata
  F('salata', ['mevsim salata', 'yeşil salata'], 25, 1.2, 4, 0.3, 'porsiyon', 150),
  F('domates', [], 18, 0.9, 3.9, 0.2, 'adet', 120),
  F('salatalık', ['hıyar'], 15, 0.7, 3.6, 0.1, 'adet', 100),
  F('brokoli', [], 34, 2.8, 7, 0.4, 'porsiyon', 150),
  F('ıspanak', ['ispanak'], 23, 2.9, 3.6, 0.4, 'porsiyon', 200),
  F('zeytinyağlı sebze', ['zeytinyağlı', 'taze fasulye'], 90, 2, 8, 6, 'porsiyon', 200),
  F('çorba', ['sebze çorbası'], 55, 2, 8, 1.5, 'kase', 250),

  // Meyve
  F('muz', [], 89, 1.1, 23, 0.3, 'adet', 120),
  F('elma', [], 52, 0.3, 14, 0.2, 'adet', 150),
  F('portakal', [], 47, 0.9, 12, 0.1, 'adet', 150),
  F('çilek', [], 32, 0.7, 8, 0.3, 'porsiyon', 150),
  F('üzüm', [], 69, 0.7, 18, 0.2, 'porsiyon', 120),
  F('avokado', [], 160, 2, 9, 15, 'adet', 150),
  F('hurma', [], 282, 2.5, 75, 0.4, 'adet', 8),
  F('kuru kayısı', ['kayısı'], 241, 3.4, 63, 0.5, 'adet', 8),

  // Kuruyemiş & yağ
  F('ceviz', [], 654, 15, 14, 65, 'adet', 5),
  F('badem', [], 579, 21, 22, 50, 'porsiyon', 25),
  F('fındık', [], 628, 15, 17, 61, 'porsiyon', 25),
  F('fıstık ezmesi', ['fıstık ezme', 'peanut butter'], 588, 25, 20, 50, 'kaşık', 16),
  F('tahin', [], 595, 17, 21, 54, 'kaşık', 15),
  F('pekmez', ['üzüm pekmezi'], 293, 1.3, 73, 0.2, 'kaşık', 20),
  F('bal', [], 304, 0.3, 82, 0, 'kaşık', 20),
  F('zeytinyağı', ['yağ'], 884, 0, 0, 100, 'kaşık', 10),
  F('tereyağı', ['tereyağ'], 717, 0.9, 0.1, 81, 'kaşık', 10),
  F('zeytin', ['siyah zeytin', 'yeşil zeytin'], 115, 0.8, 6, 11, 'adet', 4),

  // Takviye & içecek
  F('protein tozu', ['whey', 'protein shake', 'protein içeceği'], 380, 78, 8, 5, 'ölçek', 30),
  F('çay', ['siyah çay'], 1, 0, 0.2, 0, 'bardak', 200),
  F('kahve', ['türk kahvesi', 'filtre kahve'], 2, 0.1, 0.3, 0, 'fincan', 100),
  F('sütlü kahve', ['latte', 'cappuccino'], 55, 3, 5, 2.5, 'bardak', 250),
  F('meyve suyu', ['portakal suyu'], 45, 0.5, 10, 0.1, 'bardak', 200),
  F('kola', ['gazoz', 'gazlı içecek'], 42, 0, 10.6, 0, 'bardak', 250),

  // Tatlı & atıştırmalık
  F('sütlaç', [], 130, 3, 22, 3, 'kase', 150),
  F('baklava', [], 430, 6, 45, 25, 'dilim', 60),
  F('çikolata', ['sütlü çikolata'], 535, 8, 59, 30, 'porsiyon', 30),
  F('bitter çikolata', ['bitter'], 546, 8, 46, 31, 'porsiyon', 25),
  F('kek', ['pasta'], 380, 5, 50, 18, 'dilim', 80),
  F('bisküvi', ['kraker'], 450, 7, 70, 16, 'porsiyon', 30),
  F('dondurma', [], 207, 3.5, 24, 11, 'porsiyon', 100),
  F('cips', ['patates cipsi'], 536, 7, 53, 34, 'porsiyon', 40),
  F('pizza', [], 266, 11, 33, 10, 'dilim', 100),
  F('hamburger', ['burger'], 295, 17, 24, 14, 'adet', 200),
  F('döner', ['tavuk döner', 'et döner'], 215, 20, 12, 10, 'porsiyon', 200),
  F('lahmacun', [], 230, 10, 30, 8, 'adet', 150),
  F('pide', ['kıymalı pide'], 260, 11, 33, 9, 'porsiyon', 200),
  F('tost', ['kaşarlı tost'], 300, 13, 30, 14, 'adet', 130),
]

const NUM_WORDS = {
  yarım: 0.5,
  bir: 1,
  iki: 2,
  üç: 3,
  uc: 3,
  dört: 4,
  dort: 4,
  beş: 5,
  bes: 5,
  altı: 6,
  alti: 6,
  yedi: 7,
  sekiz: 8,
  dokuz: 9,
  on: 10,
}

function normalize(s) {
  return s
    .toLocaleLowerCase('tr')
    // "1,5 bardak" gibi ondalıkları noktaya çevir ki virgül ayırıcı kalabilsin
    .replace(/(\d)\s*,\s*(\d)/g, '$1.$2')
    .replace(/[!?()"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Bir satırdaki miktarı çözer: "200 gr tavuk", "2 yumurta", "yarım kase yoğurt" */
function parseAmount(line, food) {
  const gramMatch = line.match(/(\d+(?:[.,]\d+)?)\s*(gr|gram|g)\b/)
  if (gramMatch) return { grams: parseFloat(gramMatch[1].replace(',', '.')), label: `${gramMatch[1]} g` }

  const mlMatch = line.match(/(\d+(?:[.,]\d+)?)\s*(ml|mililitre)\b/)
  if (mlMatch) return { grams: parseFloat(mlMatch[1].replace(',', '.')), label: `${mlMatch[1]} ml` }

  let qty = null
  const numMatch = line.match(/(\d+(?:[.,]\d+)?)/)
  if (numMatch) qty = parseFloat(numMatch[1].replace(',', '.'))
  if (qty == null) {
    for (const [word, value] of Object.entries(NUM_WORDS)) {
      if (new RegExp(`\\b${word}\\b`).test(line)) {
        qty = value
        break
      }
    }
  }
  if (qty == null) qty = 1
  return { grams: qty * food.unitG, label: `${qty % 1 ? qty : Math.round(qty)} ${food.unit}` }
}

/**
 * Bir parçadaki TÜM besinleri sırayla bulur.
 * Çakışan eşleşmelerde uzun olan kazanır ("tam buğday ekmeği" > "ekmek"),
 * aynı besin bir parçada iki kez geçerse ilki alınır ("3 yumurtalı omlet").
 */
function findAllFoods(line) {
  const matches = []
  for (const food of FOODS) {
    for (const alias of food.aliases) {
      let idx = line.indexOf(alias)
      while (idx !== -1) {
        matches.push({ food, alias, start: idx, end: idx + alias.length })
        idx = line.indexOf(alias, idx + 1)
      }
    }
  }

  matches.sort((a, b) => b.end - b.start - (a.end - a.start))

  const chosen = []
  const seenFoods = new Set()
  for (const m of matches) {
    if (chosen.some((c) => m.start < c.end && c.start < m.end)) continue
    if (seenFoods.has(m.food.name)) continue
    seenFoods.add(m.food.name)
    chosen.push(m)
  }

  return chosen.sort((a, b) => a.start - b.start)
}

/**
 * Serbest metni ("2 yumurta, 1 kase yoğurt ve bir muz") kalem listesine çevirir.
 * Çevrimdışı tahmin; yapay zekâ yanıtı geldiğinde onun yerini alır.
 */
export function estimateFromText(text) {
  const cleaned = normalize(text)
  if (!cleaned) return { items: [], total: emptyTotal(), matched: 0, unmatched: [] }

  const parts = cleaned
    .split(/[,;\n]|\bve\b|\+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const items = []
  const unmatched = []

  for (const part of parts) {
    const hits = findAllFoods(part)
    if (!hits.length) {
      unmatched.push(part)
      continue
    }

    let cursor = 0
    for (const hit of hits) {
      // Miktar, besin adının hemen öncesindeki metinde aranır:
      // "2 dilim tam buğday ekmeği" → "2 dilim tam buğday"
      const segment = part.slice(cursor, hit.end)
      cursor = hit.end

      const { grams, label } = parseAmount(segment, hit.food)
      const factor = grams / 100
      items.push({
        name: hit.food.name,
        amount: label,
        grams: Math.round(grams),
        kcal: Math.round(hit.food.per100.kcal * factor),
        protein: +(hit.food.per100.p * factor).toFixed(1),
        carb: +(hit.food.per100.c * factor).toFixed(1),
        fat: +(hit.food.per100.f * factor).toFixed(1),
      })
    }
  }

  return { items, total: sumItems(items), matched: items.length, unmatched }
}

export function emptyTotal() {
  return { kcal: 0, protein: 0, carb: 0, fat: 0 }
}

export function sumItems(items) {
  return items.reduce(
    (acc, i) => ({
      kcal: acc.kcal + (i.kcal || 0),
      protein: +(acc.protein + (i.protein || 0)).toFixed(1),
      carb: +(acc.carb + (i.carb || 0)).toFixed(1),
      fat: +(acc.fat + (i.fat || 0)).toFixed(1),
    }),
    emptyTotal(),
  )
}

/** Yazarken öneri göstermek için basit arama */
export function searchFoods(query, limit = 6) {
  const q = normalize(query)
  if (q.length < 2) return []
  return FOODS.filter((f) => f.aliases.some((a) => a.includes(q))).slice(0, limit)
}
