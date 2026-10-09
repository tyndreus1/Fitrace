import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'
import { randomUUID } from 'node:crypto'

const source = await fs.readFile(new URL('../src/lib/store.js', import.meta.url), 'utf8')
const flush = async () => { for (let i = 0; i < 10; i++) await new Promise(setImmediate) }

async function setup({ local = {}, cloud = {}, probeErrors = {}, readErrors = {}, writeErrors = {} } = {}) {
  const memory = new Map(Object.entries(local).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]))
  const calls = []
  const tables = structuredClone(cloud)
  const client = {
    from(table) {
      const operation = { table, filters: [] }
      const query = {
        select(fields) { operation.fields = fields; return this },
        limit(limit) { operation.limit = limit; return this },
        eq(key, value) { operation.filters.push([key, value]); return this },
        gte() { return this },
        order() { return this },
        upsert(payload, options = {}) { operation.kind = 'upsert'; operation.payload = structuredClone(payload); operation.options = options; return this },
        delete() { operation.kind = 'delete'; return this },
        then(resolve, reject) {
          return Promise.resolve().then(() => {
            calls.push(operation)
            const error = operation.fields === 'id' ? probeErrors[table] : readErrors[table]
            if (error && !operation.kind) return { data: null, error: { code: 'test-error', message: error } }
            if (operation.kind === 'upsert') {
              if (writeErrors[table]) return { error: { code: 'test-write-error', message: writeErrors[table] } }
              const rows = Array.isArray(operation.payload) ? operation.payload : [operation.payload]
              // Reproduce the production water schema, which has logged_at but no created_at.
              if (table === 'water_logs' && rows.some(row => 'created_at' in row || 'saved_at' in row)) {
                return { error: { code: 'PGRST204', message: 'unknown water column' } }
              }
              tables[table] ||= []
              const keys = (operation.options.onConflict || 'id').split(',')
              for (const row of rows) {
                const existing = tables[table].findIndex(other => keys.every(key => other[key] === row[key]))
                if (existing < 0) tables[table].push(row)
                else if (!operation.options.ignoreDuplicates) tables[table][existing] = row
              }
              return { error: null }
            }
            if (operation.kind === 'delete') return { error: null }
            return { data: structuredClone(tables[table] || []), error: null }
          }).then(resolve, reject)
        },
      }
      return query
    },
  }
  const context = vm.createContext({
    console: { warn() {}, info() {}, error() {} },
    setTimeout, clearTimeout, crypto: { randomUUID },
    localStorage: { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) },
  })
  const module = new vm.SourceTextModule(source, { context, initializeImportMeta: meta => { meta.env = { VITE_SUPABASE_URL: 'https://test.invalid', VITE_SUPABASE_ANON_KEY: 'test' } } })
  await module.link(specifier => {
    const exports = specifier === '@supabase/supabase-js' ? { createClient: () => client }
      : specifier === './config' ? { PROFILE: { id: 'ozge' } }
        : { todayStr: () => '2026-10-09', daysAgoStr: () => '2025-10-09' }
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
    }, { context })
  })
  await module.evaluate()
  await module.namespace.store.loadAll()
  await flush()
  return { store: module.namespace.store, calls, tables, memory }
}

test('old permanent cloud-off flag is rechecked; pending meals recover without duplicates', async () => {
  const meal = { id: 'meal-1', profile_id: 'ozge', log_date: '2026-10-08', kcal: 100, saved_at: '2026-10-08T18:00:00Z' }
  const { store, tables, memory } = await setup({ local: { ozge_bulut_kapali: 'old water error', ozge_meals: [meal] } })
  assert.equal(store.status().mode, 'bulut')
  assert.equal(memory.has('ozge_bulut_kapali'), false)
  const data = await store.loadAll()
  await flush()
  assert.equal(data.meals[0].log_date, '2026-10-08')
  assert.equal(tables.meals.length, 1)
  assert.equal('saved_at' in tables.meals[0], false)
  await store.loadAll()
  await flush()
  assert.equal(tables.meals.length, 1)
})

test('new and pending water records fit the old schema; meal syncing stays active', async () => {
  const water = { id: 'water-old', profile_id: 'ozge', log_date: '2026-10-08', amount_ml: 250, logged_at: '2026-10-08T18:00:00Z', created_at: '2026-10-08T18:00:00Z', saved_at: '2026-10-08T18:00:00Z' }
  const { store, tables, calls } = await setup({ local: { ozge_water_logs: [water] } })
  await store.loadAll()
  await flush()
  await store.addWater(300)
  await store.addMeal({ note: 'test meal', kcal: 150 })
  await flush()
  assert.equal(tables.water_logs.length, 2)
  assert.equal(tables.meals.length, 1)
  for (const call of calls.filter(call => call.kind === 'upsert' && call.table === 'water_logs')) {
    for (const row of Array.isArray(call.payload) ? call.payload : [call.payload]) {
      assert.equal('created_at' in row, false)
      assert.equal('saved_at' in row, false)
      assert.ok(row.logged_at)
    }
  }
  assert.equal(Object.keys(store.status().tableErrors).length, 0)
})

test('an unavailable optional table does not stop meal reads and writes', async () => {
  const { store, tables } = await setup({ probeErrors: { tesekkur: 'missing table' }, cloud: { meals: [{ id: 'meal-cloud', log_date: '2026-10-08', kcal: 200 }] } })
  assert.equal((await store.loadAll()).meals.length, 1)
  await store.addMeal({ kcal: 100 })
  await flush()
  assert.equal(tables.meals.length, 2)
  assert.ok(store.status().tableErrors.tesekkur)
  assert.equal(store.status().mode, 'bulut')
})

test('a background water write failure is reported while meals still sync', async () => {
  const { store, tables } = await setup({ writeErrors: { water_logs: 'write denied' } })
  await store.addWater(250)
  await flush()
  assert.ok(store.status().tableErrors.water_logs)
  assert.equal(store.loadLocal().water.length, 1)
  await store.addMeal({ kcal: 100 })
  await flush()
  assert.equal(tables.meals.length, 1)
  assert.equal(store.status().mode, 'bulut')
})

test('failed cloud reads keep local history and never upload an assumed empty cloud', async () => {
  const { store, calls } = await setup({ local: { ozge_meals: [{ id: 'local', log_date: '2026-10-08' }] }, readErrors: { meals: 'read denied' } })
  assert.equal((await store.loadAll()).meals.length, 1)
  await flush()
  assert.equal(calls.some(call => call.table === 'meals' && call.kind === 'upsert'), false)
})

test('deleted local rows are not resurrected by pending uploads', async () => {
  const { store, tables } = await setup({ local: { ozge_meals: [{ id: 'deleted', log_date: '2026-10-08' }, { id: 'kept', log_date: '2026-10-08' }], ozge_silinenler: ['deleted'] } })
  await store.loadAll()
  await flush()
  assert.deepEqual(tables.meals.map(row => row.id), ['kept'])
})

test('cloud history is cached for later offline use and backup', async () => {
  const { store, memory } = await setup({ cloud: { meals: [{ id: 'cloud', log_date: '2026-10-08', kcal: 300 }] } })
  await store.loadAll()
  assert.equal(JSON.parse(memory.get('ozge_meals'))[0].id, 'cloud')
  assert.equal(store.loadLocal().meals[0].id, 'cloud')
  assert.equal(store.exportAll().veriler.meals[0].id, 'cloud')
})

test('pending daily records use the date conflict key without overwriting duplicates', async () => {
  const { store, calls, tables } = await setup({ local: { ozge_weight_logs: [{ id: 'local-weight', profile_id: 'ozge', log_date: '2026-10-08', weight_kg: 50 }] } })
  await store.loadAll()
  await flush()
  const write = calls.find(call => call.table === 'weight_logs' && call.kind === 'upsert')
  assert.equal(write.options.onConflict, 'profile_id,log_date')
  assert.equal(write.options.ignoreDuplicates, true)
  assert.equal(tables.weight_logs.length, 1)
})
