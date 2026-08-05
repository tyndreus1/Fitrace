import { useCallback, useEffect, useMemo, useState } from 'react'
import { store } from '../lib/store'
import { dailyTargets } from '../lib/nutrition'
import { latestWeight, mealsOn, totalsFor, waterOn, journalOn } from '../lib/stats'
import { PROFILE } from '../lib/config'
import { todayStr } from '../lib/dates'
import { DataCtx } from './contexts'

const EMPTY = { weights: [], measurements: [], meals: [], water: [], journal: [], chat: [] }

export function DataProvider({ children }) {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const next = await store.loadAll()
    setData(next)
    setLoading(false)
    return next
  }, [])

  // İlk yükleme
  useEffect(() => {
    let cancelled = false
    store.loadAll().then((next) => {
      if (cancelled) return
      setData(next)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Her yazma işleminden sonra veriyi tazeleyen sarmalayıcı
  const wrap = useCallback(
    (fn) =>
      async (...args) => {
        const result = await fn(...args)
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
  }, [data, loading, reload, wrap])

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}
