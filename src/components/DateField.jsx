import { formatDMY, todayStr } from '../lib/dates'

/**
 * Tarih alanı — her tarayıcıda gg/aa/yyyy gösterir.
 * Yerel <input type="date"> biçimi tarayıcının diline göre değişir; bu yüzden
 * biçimlenmiş metni kendimiz çiziyoruz, native girdiyi de üstüne şeffaf
 * yerleştirip takvim açılışını ona bırakıyoruz.
 */
export default function DateField({ value, onChange, min, max, className = '' }) {
  const shown = value || todayStr()
  return (
    <div className={`input relative flex items-center py-1.5 px-3 text-xs cursor-pointer ${className}`}>
      <span>{formatDMY(shown)}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value || todayStr())}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Tarih seç"
      />
    </div>
  )
}
