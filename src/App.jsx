import React, { useState, useEffect } from 'react'
import {
  loadJadwal, saveJadwal, loadDriver, saveDriver,
  formatDate, todayISO, makeId, sortByDate
} from './storage'
import { ensureNotifPermission, scheduleReminder, cancelReminder } from './notify'

const EMPTY_JADWAL = { id: '', title: '', date: todayISO(), time: '08:00', location: '', note: '', remind: 15 }
const EMPTY_DRIVER = { id: '', title: '', date: todayISO(), time: '08:00', location: '', destination: '', note: '' }

const REMIND_OPTIONS = [0, 5, 15, 30, 60, 120]
const REMIND_LABEL = { 0: 'Tanpa pengingat', 5: '5 menit sebelum', 15: '15 menit sebelum', 30: '30 menit sebelum', 60: '1 jam sebelum', 120: '2 jam sebelum' }

export default function App() {
  const [tab, setTab] = useState('home')
  const [jadwal, setJadwal] = useState([])
  const [driver, setDriver] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [modal, setModal] = useState(null) // { type: 'jadwal'|'driver', item }
  const [deleting, setDeleting] = useState(null) // { type, id }
  const [toast, setToast] = useState('')
  const [clock, setClock] = useState(new Date())

  // Load data
  useEffect(() => {
    (async () => {
      const [j, d] = await Promise.all([loadJadwal(), loadDriver()])
      setJadwal(j.sort(sortByDate))
      setDriver(d.sort(sortByDate))
      setLoaded(true)
    })()
  }, [])

  // Jam asli
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  // Toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const showToast = (msg) => setToast(msg)

  // ===== CRUD Jadwal =====
  const saveJadwalItem = async (item) => {
    let list
    if (item.id) {
      list = jadwal.map(x => x.id === item.id ? item : x)
    } else {
      item.id = makeId()
      list = [...jadwal, item]
    }
    list.sort(sortByDate)
    setJadwal(list)
    await saveJadwal(list)

    // Kelola notifikasi
    const old = jadwal.find(x => x.id === item.id)
    if (old) await cancelReminder(old)
    if (item.remind > 0) {
      const ok = await scheduleReminder({
        ...item,
        notifId: item.id,
        body: item.location ? `${item.location}${item.note ? ' — ' + item.note : ''}` : item.note
      })
      if (ok) showToast('🔔 Pengingat dijadwalkan!')
    }
    setModal(null)
  }

  const deleteJadwalItem = async (id) => {
    const old = jadwal.find(x => x.id === id)
    if (old) await cancelReminder(old)
    const list = jadwal.filter(x => x.id !== id)
    setJadwal(list)
    await saveJadwal(list)
    setDeleting(null)
    showToast('🗑️ Jadwal dihapus')
  }

  // ===== CRUD Driver =====
  const saveDriverItem = async (item) => {
    let list
    if (item.id) {
      list = driver.map(x => x.id === item.id ? item : x)
    } else {
      item.id = makeId()
      list = [...driver, item]
    }
    list.sort(sortByDate)
    setDriver(list)
    await saveDriver(list)
    setModal(null)
  }

  const deleteDriverItem = async (id) => {
    const list = driver.filter(x => x.id !== id)
    setDriver(list)
    await saveDriver(list)
    setDeleting(null)
    showToast('🗑️ Jadwal driver dihapus')
  }

  const shareDriver = async (item) => {
    const text = `🚗 *Jadwal Driver*\n📅 ${formatDate(item.date)}\n⏰ ${item.time}\n📍 Jemput: ${item.location}\n🏁 Tujuan: ${item.destination}\n${item.note ? '📝 ' + item.note : ''}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Jadwal Driver', text })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        showToast('📋 Teks disalin!')
      }
    } catch (e) { /* batal */ }
  }

  // ===== DATA HARI INI =====
  const today = todayISO()
  const todayJadwal = jadwal.filter(x => x.date === today)
  const todayDriver = driver.filter(x => x.date === today)
  const upcoming = jadwal.filter(x => x.date >= today).slice(0, 5)
  const totalJadwal = jadwal.length
  const totalDriver = driver.length

  const weekdayName = clock.toLocaleDateString('id-ID', { weekday: 'long' })

  return (
    <div className="app">
      <div className="glow-orb purple" />
      <div className="glow-orb pink" />

      {/* ===== HEADER ===== */}
      <div className="header">
        <div className="header-left">
          <div className="avatar">🤖</div>
          <div className="header-info">
            <h2>Friday</h2>
            <p><span className="online-dot" /> {weekdayName}, {clock.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
        <div className="header-actions">
          <span>{clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="content">
        {!loaded && <div className="loading">Memuat...</div>}

        {/* ---------- HOME ---------- */}
        {loaded && tab === 'home' && (
          <div className="view">
            <div className="view-title">Halo Greez! 👋</div>
            <div className="view-sub">Ini ringkasan hari {weekdayName}</div>

            <div className="summary-grid">
              <div className="summary-card">
                <div className="sum-num">{todayJadwal.length}</div>
                <div className="sum-label">📅 Jadwal hari ini</div>
              </div>
              <div className="summary-card">
                <div className="sum-num">{todayDriver.length}</div>
                <div className="sum-label">🚗 Driver hari ini</div>
              </div>
            </div>

            {todayJadwal.length > 0 && (
              <div className="card">
                <div className="card-title">📅 Jadwal Hari Ini</div>
                {todayJadwal.map(j => (
                  <div key={j.id} className="row" onClick={() => setModal({ type: 'jadwal', item: j })}>
                    <div className="time-pill">{j.time}</div>
                    <div className="row-main">
                      <div className="row-title">{j.title}</div>
                      {j.location && <div className="row-sub">📍 {j.location}</div>}
                    </div>
                    {j.remind > 0 && <span className="remind-badge">🔔</span>}
                  </div>
                ))}
              </div>
            )}

            {todayDriver.length > 0 && (
              <div className="card">
                <div className="card-title">🚗 Driver Hari Ini</div>
                {todayDriver.map(d => (
                  <div key={d.id} className="row" onClick={() => setModal({ type: 'driver', item: d })}>
                    <div className="time-pill">{d.time}</div>
                    <div className="row-main">
                      <div className="row-title">{d.title}</div>
                      <div className="row-sub">📍 {d.location} → 🏁 {d.destination}</div>
                    </div>
                    <button className="icon-btn" onClick={(e) => { e.stopPropagation(); shareDriver(d) }}>📤</button>
                  </div>
                ))}
              </div>
            )}

            {todayJadwal.length === 0 && todayDriver.length === 0 && (
              <div className="empty">
                <div className="empty-icon">🌤️</div>
                <p>Hari ini santai!<br />Gak ada jadwal tercatat.</p>
              </div>
            )}

            <div className="card">
              <div className="card-title">⏭️ Akan Datang</div>
              {upcoming.length === 0 && <div className="row-sub">Belum ada jadwal ke depan.</div>}
              {upcoming.map(j => (
                <div key={j.id} className="row" onClick={() => setModal({ type: 'jadwal', item: j })}>
                  <div className="date-pill">{j.date.slice(8)}/{j.date.slice(5, 7)}</div>
                  <div className="row-main">
                    <div className="row-title">{j.title}</div>
                    <div className="row-sub">{j.time}{j.location ? ' · ' + j.location : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------- JADWAL ---------- */}
        {loaded && tab === 'jadwal' && (
          <div className="view">
            <div className="view-title">Jadwal Harian 📅</div>
            <div className="view-sub">Ketuk untuk edit · tombol ✕ untuk hapus</div>

            {jadwal.length === 0 && (
              <div className="empty">
                <div className="empty-icon">🗓️</div>
                <p>Belum ada jadwal.<br />Tekan ➕ buat tambah!</p>
              </div>
            )}

            {groupByDate(jadwal).map(group => (
              <div key={group.date} className="date-group">
                <div className={`date-label ${group.date === today ? 'is-today' : ''}`}>
                  {formatDate(group.date)}{group.date === today ? ' · Hari ini' : ''}
                </div>
                <div className="card">
                  {group.items.map(j => (
                    <div key={j.id} className="row">
                      <div className="time-pill">{j.time}</div>
                      <div className="row-main" onClick={() => setModal({ type: 'jadwal', item: j })}>
                        <div className="row-title">{j.title}</div>
                        {j.location && <div className="row-sub">📍 {j.location}</div>}
                        {j.note && <div className="row-sub dim">📝 {j.note}</div>}
                      </div>
                      {j.remind > 0 && <span className="remind-badge">🔔</span>}
                      <button className="icon-btn danger" onClick={() => setDeleting({ type: 'jadwal', id: j.id })}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------- DRIVER ---------- */}
        {loaded && tab === 'driver' && (
          <div className="view">
            <div className="view-title">Jadwal Driver 🚗</div>
            <div className="view-sub">Ketuk untuk edit · 📤 untuk share ke driver</div>

            {driver.length === 0 && (
              <div className="empty">
                <div className="empty-icon">🚗</div>
                <p>Belum ada jadwal driver.<br />Tekan ➕ buat tambah!</p>
              </div>
            )}

            {groupByDate(driver).map(group => (
              <div key={group.date} className="date-group">
                <div className={`date-label ${group.date === today ? 'is-today' : ''}`}>
                  {formatDate(group.date)}{group.date === today ? ' · Hari ini' : ''}
                </div>
                <div className="card">
                  {group.items.map(d => (
                    <div key={d.id} className="row">
                      <div className="time-pill">{d.time}</div>
                      <div className="row-main" onClick={() => setModal({ type: 'driver', item: d })}>
                        <div className="row-title">{d.title}</div>
                        <div className="row-sub">📍 {d.location} → 🏁 {d.destination}</div>
                        {d.note && <div className="row-sub dim">📝 {d.note}</div>}
                      </div>
                      <button className="icon-btn" onClick={() => shareDriver(d)}>📤</button>
                      <button className="icon-btn danger" onClick={() => setDeleting({ type: 'driver', id: d.id })}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------- LAINNYA ---------- */}
        {loaded && tab === 'settings' && (
          <div className="view">
            <div className="view-title">Lainnya ⚙️</div>

            <div className="card">
              <div className="card-title">📊 Statistik</div>
              <div className="stat-row"><span>Total jadwal</span><b>{totalJadwal}</b></div>
              <div className="stat-row"><span>Total jadwal driver</span><b>{totalDriver}</b></div>
              <div className="stat-row"><span>Pengingat aktif</span><b>{jadwal.filter(x => x.remind > 0).length}</b></div>
            </div>

            <div className="card">
              <div className="card-title">🔔 Notifikasi</div>
              <div className="row">
                <div className="row-main">
                  <div className="row-title">Aktifkan izin notifikasi</div>
                  <div className="row-sub">Biar pengingat muncul di HP</div>
                </div>
                <button className="mini-btn" onClick={async () => {
                  const ok = await ensureNotifPermission()
                  showToast(ok ? '✅ Notifikasi aktif!' : '⚠️ Izin ditolak — cek pengaturan HP')
                }}>Izinkan</button>
              </div>
            </div>

            <div className="card">
              <div className="card-title">ℹ️ Tentang</div>
              <div className="row-sub">Friday v2.0 — Jadwal & Asisten</div>
              <div className="row-sub dim">Data tersimpan 100% di HP lo 🔒<br />Dibuat khusus buat Greez 💜</div>
            </div>
          </div>
        )}
      </div>

      {/* ===== FAB ===== */}
      {loaded && (tab === 'jadwal' || tab === 'driver') && (
        <button
          className="fab"
          onClick={() => setModal({ type: tab, item: tab === 'jadwal' ? { ...EMPTY_JADWAL } : { ...EMPTY_DRIVER } })}
        >➕</button>
      )}

      {/* ===== BOTTOM NAV ===== */}
      <div className="bottom-nav">
        {[
          { key: 'home', icon: '🏠', label: 'Home' },
          { key: 'jadwal', icon: '📅', label: 'Jadwal' },
          { key: 'driver', icon: '🚗', label: 'Driver' },
          { key: 'settings', icon: '⚙️', label: 'Lainnya' },
        ].map(item => (
          <button
            key={item.key}
            className={`nav-item ${tab === item.key ? 'active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            <span className="ni-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* ===== MODAL FORM ===== */}
      {modal && (
        <FormModal
          type={modal.type}
          initial={modal.item}
          onSave={modal.type === 'jadwal' ? saveJadwalItem : saveDriverItem}
          onClose={() => setModal(null)}
        />
      )}

      {/* ===== KONFIRMASI HAPUS ===== */}
      {deleting && (
        <div className="modal-overlay" onClick={() => setDeleting(null)}>
          <div className="modal confirm" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Hapus ini?</div>
            <p className="row-sub">Data yang dihapus gak bisa dikembalikan.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setDeleting(null)}>Batal</button>
              <button className="btn-danger" onClick={() =>
                deleting.type === 'jadwal' ? deleteJadwalItem(deleting.id) : deleteDriverItem(deleting.id)
              }>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TOAST ===== */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

// ===== Grouping by date =====
function groupByDate(list) {
  const map = {}
  for (const item of list) {
    if (!map[item.date]) map[item.date] = { date: item.date, items: [] }
    map[item.date].items.push(item)
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

// ===== Form Modal =====
function FormModal({ type, initial, onSave, onClose }) {
  const isJadwal = type === 'jadwal'
  const [form, setForm] = useState(initial)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({ ...form, title: form.title.trim() })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{isJadwal ? (initial.id ? '✏️ Edit Jadwal' : '➕ Jadwal Baru') : (initial.id ? '✏️ Edit Driver' : '➕ Jadwal Driver Baru')}</div>

        <form onSubmit={submit}>
          <label>Judul</label>
          <input
            autoFocus
            placeholder={isJadwal ? 'Contoh: Kerja di MDC' : 'Contoh: Jemput di Stasiun Cisauk'}
            value={form.title}
            onChange={e => set('title', e.target.value)}
          />

          <div className="form-row">
            <div className="form-col">
              <label>Tanggal</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div className="form-col">
              <label>Jam</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} required />
            </div>
          </div>

          {isJadwal ? (
            <>
              <label>Lokasi <span className="opt">(opsional)</span></label>
              <input placeholder="Contoh: Graha MDC Bekasi" value={form.location} onChange={e => set('location', e.target.value)} />

              <label>Pengingat</label>
              <select value={form.remind} onChange={e => set('remind', Number(e.target.value))}>
                {REMIND_OPTIONS.map(o => <option key={o} value={o}>{REMIND_LABEL[o]}</option>)}
              </select>
            </>
          ) : (
            <>
              <label>Lokasi Jemput</label>
              <input placeholder="Contoh: Stasiun Cisauk" value={form.location} onChange={e => set('location', e.target.value)} />
              <label>Tujuan</label>
              <input placeholder="Contoh: Casa Gracia BSD" value={form.destination} onChange={e => set('destination', e.target.value)} />
            </>
          )}

          <label>Catatan <span className="opt">(opsional)</span></label>
          <input placeholder="Catatan tambahan..." value={form.note} onChange={e => set('note', e.target.value)} />

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  )
}
