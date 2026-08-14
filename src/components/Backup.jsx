import { useRef, useState } from 'react'
import { useData } from '../context/contexts'
import { todayStr } from '../lib/dates'

/**
 * Yedek al / yedeği yükle.
 *
 * Kayıtlar öncelikle cihazda tutulduğu için tarayıcı verisi silinirse ya da
 * telefon değişirse kaybolabilirler. Bu kart, tüm kayıtları tek bir dosyaya
 * indirip geri yüklemeyi sağlar.
 */
export default function Backup() {
  const { exportAll, importAll } = useData()
  const fileRef = useRef(null)
  const [msg, setMsg] = useState('')

  function indir() {
    const dump = exportAll()
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ozge-yedek-${todayStr()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Yedek indirildi 💾')
    setTimeout(() => setMsg(''), 2500)
  }

  async function yukle(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const dump = JSON.parse(await file.text())
      const { error, eklenen } = await importAll(dump)
      setMsg(error || `Yedek yüklendi — ${eklenen} yeni kayıt eklendi 💗`)
    } catch {
      setMsg('Dosya okunamadı. Bu uygulamadan alınmış bir yedek dosyası seç.')
    }
    event.target.value = ''
    setTimeout(() => setMsg(''), 4000)
  }

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div>
        <h3 className="font-medium text-sm">Yedekleme</h3>
        <p className="text-xs text-[var(--text-dim)] leading-relaxed mt-1">
          Kayıtların bu cihazda tutuluyor. Ara sıra yedek alırsan tarayıcı verisi silinse ya da telefon
          değişse bile hiçbir şey kaybolmaz.
        </p>
      </div>

      <div className="flex gap-2">
        <button onClick={indir} className="btn btn-primary flex-1 text-xs">
          💾 Yedek al
        </button>
        <button onClick={() => fileRef.current?.click()} className="btn btn-ghost flex-1 text-xs">
          ↩️ Yedeği yükle
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={yukle} className="hidden" />
      </div>

      {msg && <p className="text-xs text-[var(--mint)]">{msg}</p>}

      <p className="text-[11px] text-[var(--text-dim)]">
        Yedeği yüklemek mevcut kayıtları silmez; eksik olanları ekler.
      </p>
    </div>
  )
}
