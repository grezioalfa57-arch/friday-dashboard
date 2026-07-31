// ====== Storage Helper ======
// Di Android pake Capacitor Preferences (tersimpan permanen di HP)
// Di browser dev pake localStorage (biar bisa tes di web)

import { Preferences } from '@capacitor/preferences'

const KEYS = {
  jadwal: 'friday_jadwal_v1',
  driver: 'friday_driver_v1'
}

export async function loadJadwal() {
  try {
    const { value } = await Preferences.get({ key: KEYS.jadwal })
    return value ? JSON.parse(value) : []
  } catch (e) {
    try {
      const raw = localStorage.getItem(KEYS.jadwal)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }
}

export async function saveJadwal(list) {
  try {
    await Preferences.set({ key: KEYS.jadwal, value: JSON.stringify(list) })
  } catch (e) {
    localStorage.setItem(KEYS.jadwal, JSON.stringify(list))
  }
}

export async function loadDriver() {
  try {
    const { value } = await Preferences.get({ key: KEYS.driver })
    return value ? JSON.parse(value) : []
  } catch (e) {
    try {
      const raw = localStorage.getItem(KEYS.driver)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }
}

export async function saveDriver(list) {
  try {
    await Preferences.set({ key: KEYS.driver, value: JSON.stringify(list) })
  } catch (e) {
    localStorage.setItem(KEYS.driver, JSON.stringify(list))
  }
}

// Helper format tanggal
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function todayISO() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function sortByDate(a, b) {
  return (a.date + a.time).localeCompare(b.date + b.time)
}
