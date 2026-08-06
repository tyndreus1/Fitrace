import { useCallback, useEffect, useMemo, useState } from 'react'
import { hasRemote, store } from '../lib/store'
import { dailyTargets } from '../lib/nutrition'
import { latestWeight, mealsOn, totalsFor, waterOn, journalOn } from '../lib/stats'
import { PROFILE } from '../lib/config'
import { todayStr } from '../lib/dates'
import { DataCtx } from './contexts'

const EMPTY = { weights: [], measurements: [], meals: [], water: [], journal: [], chat: [] }

export function DataProvider({ children }) {
  // Cihazdaki kayıtlarla hemen başla; bulut yoklaması arkada sürerken ekran
  // boş kalmasın. Bulut sağlıklıysa gelen veri bunun yerini alır.
  const [data, setData] = useState(() => {
    try {
      return { ...EMPTY, ...store.loadLocal() }
    } catch {
      return EMPTY
    }
  })
  const [loading, setLoading] = useState(true)
  const [storage, setStorage] = useState(() => store.status())
  const [saveError, setSaveError] = useState('')

  const reload = useCallback(async () => {
    const next = await store.loadAll()
    setData(next)
    setStorage(store.status())
    setLoading(false)
    return next
  }, [])

  // İlk yükleme
  useEffect(() => {
    let cancelled = false
    store.loadAll().then((next) => {
      if (cancelled) return
      setData(next)
      setStorage(store.status())
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Her yazma işleminden sonra veriyi tazeler ve hatayı görünür kılar.
  const wrap = useCallback(
    (fn) =>
      async (...args) => {
        const result = await fn(...args)
        setSaveError(result?.error ? String(result.error) : '')
        await reload()
        return result
      },
    [reload],
  )

  const value = useMemo(() => {
    const currentWeight = latestWeight(data.weights) ?? PROFILE.startWeightKg
    const targets = dailyTargets(currentWeight)
    const today = todayStr()
    const todaysMeals = mealsOn(data.meals, today)

    return {
      ...data,
      loading,
      reload,
      storage,
      // Bulut ayarlı olduğu hâlde yerel kayda düşülmüşse arayüz uyarır
      storageDegraded: hasRemote && storage.mode === 'yerel',
      saveError,
      dismissSaveError: () => setSaveError(''),
      currentWeight,
      targets,
      todaysMeals,
      todaysTotals: totalsFor(todaysMeals),
      todaysWater: waterOn(data.water, today),
      todaysJournal: journalOn(data.journal, today),
      saveWeight: wrap(store.saveWeight),
      saveMeasurement: wrap(store.saveMeasurement),
      addMeal: wrap(store.addMeal),
      deleteMeal: wrap(store.deleteMeal),
      addWater: wrap(store.addWater),
      deleteWater: wrap(store.deleteWater),
      saveJournal: wrap(store.saveJournal),
      addChatMessage: wrap(store.addChatMessage),
      clearChat: wrap(store.clearChat),
    }
  }, [data, loading, reload, wrap, storage, saveError])

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}
