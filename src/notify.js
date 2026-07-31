// ====== Notifikasi Helper ======
// Pakai Capacitor Local Notifications — jalan OFFLINE di HP
// Di browser dev: gak didukung, tapi kita kasih fallback alert ringan

import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'

export const isNative = Capacitor.isNativePlatform()

// Minta izin notifikasi (panggil sekali pas pertama buka)
export async function ensureNotifPermission() {
  if (!isNative) return false
  try {
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display === 'granted') return true
    const req = await LocalNotifications.requestPermissions()
    return req.display === 'granted'
  } catch (e) {
    return false
  }
}

// Jadwalkan pengingat
// item: { id, title, date: 'YYYY-MM-DD', time: 'HH:mm', remind: minutes sebelum }
export async function scheduleReminder(item) {
  if (!isNative) return false
  try {
    const [h, m] = item.time.split(':').map(Number)
    const at = new Date(item.date + 'T00:00:00')
    at.setHours(h, m, 0, 0)
    if (item.remind && item.remind > 0) {
      at.setMinutes(at.getMinutes() - item.remind)
    }
    // Notif yang sudah lewat gak usah dijadwalkan
    if (at.getTime() <= Date.now()) return false

    await LocalNotifications.schedule({
      notifications: [{
        id: item.notifId || Math.abs(hashCode(item.id)),
        title: item.title,
        body: item.body || `⏰ ${item.date} ${item.time}`,
        schedule: { at, allowWhileIdle: true }
      }]
    })
    return true
  } catch (e) {
    return false
  }
}

// Hapus pengingat
export async function cancelReminder(item) {
  if (!isNative) return false
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: item.notifId || Math.abs(hashCode(item.id)) }]
    })
    return true
  } catch (e) {
    return false
  }
}

// Sinkron semua jadwal: cancel lama, schedule ulang yang belum lewat
export async function syncAllReminders(jadwalList) {
  if (!isNative) return
  try {
    await LocalNotifications.cancel({ notifications: [] })
  } catch (e) { /* pending notifications */ }
  for (const item of jadwalList) {
    if (item.remind > 0) await scheduleReminder(item)
  }
}

function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}
