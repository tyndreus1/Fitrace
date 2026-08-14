import { useState } from 'react'
import { useData } from '../context/contexts'

/**
 * Programın yaratıcısına teşekkür kutusu. Özge buraya yazıp gönderince mesaj
 * kaydedilir; yaratıcı bunu /mesajlar gizli sayfasından okur.
 */
export default function ThanksBox() {
  const { addThanks } = useData()
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  async function gonder() {
    if (!text.trim()) return
    await addThanks(text.trim())
    setText('')
    setSent(true)
    setTimeout(() => setSent(false), 6000)
  }

  return (
    <div className="card card-glow p-4 flex flex-col gap-3">
      <div>
        <h3 className="font-medium text-sm">💌 Bu programı senin için yapana bir not</h3>
        <p className="text-xs text-[var(--text-dim)] leading-relaxed mt-1">
          İçinden geçen bir şey varsa yaz; ona ulaştırılır.
        </p>
      </div>

      {sent ? (
        <p className="text-sm text-[var(--mint)] py-2">Notun iletildi, teşekkürler 💗</p>
      ) : (
        <>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Buraya yaz…"
            className="input resize-none"
          />
          <button onClick={gonder} disabled={!text.trim()} className="btn btn-primary">
            Gönder
          </button>
        </>
      )}
    </div>
  )
}
