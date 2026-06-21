import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { daysAgoStr, todayStr } from './dates'

const HISTORY_DAYS = 90

export function useTrackerData(profileId) {
  const [weightLogs, setWeightLogs] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [waterLogs, setWaterLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!profileId) return
    setLoading(true)
    const since = daysAgoStr(HISTORY_DAYS)
    const [w, m, wa] = await Promise.all([
      supabase
        .from('weight_logs')
        .select('*')
        .eq('profile_id', profileId)
        .gte('log_date', since)
        .order('log_date', { ascending: true }),
      supabase
        .from('measurements')
        .select('*')
        .eq('profile_id', profileId)
        .gte('log_date', since)
        .order('log_date', { ascending: true }),
      supabase
        .from('water_logs')
        .select('*')
        .eq('profile_id', profileId)
        .gte('log_date', since)
        .order('logged_at', { ascending: true }),
    ])
    setWeightLogs(w.data || [])
    setMeasurements(m.data || [])
    setWaterLogs(wa.data || [])
    setLoading(false)
  }, [profileId])

  useEffect(() => {
    load()
  }, [load])

  async function addWeight(weightKg, date = todayStr()) {
    const { error } = await supabase
      .from('weight_logs')
      .upsert({ profile_id: profileId, log_date: date, weight_kg: weightKg }, { onConflict: 'profile_id,log_date' })
    if (!error) await load()
    return { error }
  }

  async function addMeasurement(values, date = todayStr()) {
    const { error } = await supabase
      .from('measurements')
      .upsert({ profile_id: profileId, log_date: date, ...values }, { onConflict: 'profile_id,log_date' })
    if (!error) await load()
    return { error }
  }

  async function addWater(amountMl, date = todayStr()) {
    const { error } = await supabase
      .from('water_logs')
      .insert({ profile_id: profileId, log_date: date, amount_ml: amountMl })
    if (!error) await load()
    return { error }
  }

  async function removeWaterLog(id) {
    const { error } = await supabase.from('water_logs').delete().eq('id', id)
    if (!error) await load()
    return { error }
  }

  const todaysWater = waterLogs
    .filter((w) => w.log_date === todayStr())
    .reduce((sum, w) => sum + w.amount_ml, 0)

  return {
    weightLogs,
    measurements,
    waterLogs,
    todaysWater,
    loading,
    addWeight,
    addMeasurement,
    addWater,
    removeWaterLog,
    reload: load,
  }
}
