import React, { useState, useRef, useEffect } from 'react'

const initialMessages = [
  { id: 1, text: 'Halo Greez! 👋\nAda yang bisa aku bantu hari ini?', from: 'them', time: '10:00' },
  { id: 2, text: 'Cek harga SURI dong 📈', from: 'me', time: '10:01' },
  { id: 3, text: 'SURI sekarang **Rp 72** 🟢\nNaik **+24%** dari bulan lalu!\nVolume: 1.051.800', from: 'them', time: '10:01' },
  { id: 4, text: 'Mantap! 🔥\nBesok Jumat ada doa malam ya?', from: 'me', time: '10:02' },
  { id: 5, text: 'Iya! Jumat terakhir bulan ini 🌙\n• Graha MDC 08.30-15.30\n• Doa malam (pulang ~21.00)\n• Sabtu rencana ke BSD 🚆', from: 'them', time: '10:02' },
]

const stocks = [
  { name: 'SURI', price: 72, change: '+14%', up: true },
  { name: 'LUCK', price: 288, change: '+2%', up: true },
  { name: 'BBCA', price: 9875, change: '-0.3%', up: false },
  { name: 'BBRI', price: 4450, change: '+0.5%', up: true },
  { name: 'TLKM', price: 3020, change: '-0.7%', up: false },
  { name: 'ASII', price: 5425, change: '+1.2%', up: true },
  { name: 'ADRO', price: 3180, change: '+3.5%', up: true },
  { name: 'GOTO', price: 152, change: '-1.9%', up: false },
]

const devFeatures = [
  { icon: '📶', label: 'WiFi', active: true },
  { icon: '🔵', label: 'Bluetooth', active: false },
  { icon: '🔦', label: 'Torch', active: false },
  { icon: '🔋', label: 'Baterai', active: true },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState(initialMessages)
  const [inputText, setInputText] = useState('')
  const [devices, setDevices] = useState(devFeatures)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!inputText.trim()) return
    const newMsg = {
      id: messages.length + 1,
      text: inputText,
      from: 'me',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
    setMessages([...messages, newMsg])
    setInputText('')

    // Auto-reply
    setTimeout(() => {
      const reply = {
        id: messages.length + 2,
        text: 'Pesan lo udah diterima! 🚀\nBesok Jumat semangat ya! 🔥',
        from: 'them',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, reply])
    }, 1000)
  }

  const toggleDevice = (idx) => {
    setDevices(prev => prev.map((d, i) =>
      i === idx ? { ...d, active: !d.active } : d
    ))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="app">
      {/* Glow Orbs */}
      <div className="glow-orb purple" />
      <div className="glow-orb pink" />

      {/* Status Bar */}
      <div className="status-bar">
        <span className="time">9:41</span>
        <div className="status-icons">
          <span>📶</span>
          <span>📶</span>
          <div className="battery"><div className="level" /></div>
        </div>
      </div>

      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="avatar">🤖</div>
          <div className="header-info">
            <h2>Friday</h2>
            <p><span className="online-dot" /> Online</p>
          </div>
        </div>
        <div className="header-actions">
          <span>📞</span>
          <span>⚙️</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="nav-tabs">
        {[
          { key: 'chat', icon: '💬', label: 'Chat' },
          { key: 'saham', icon: '📊', label: 'Saham' },
          { key: 'device', icon: '⚡', label: 'Device' },
          { key: 'about', icon: '👤', label: 'Profil' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'chat' && (
        <>
          <div className="chat-area">
            {messages.map(msg => (
              <div key={msg.id} className={`bubble ${msg.from === 'me' ? 'me' : 'them'}`}>
                <div>{msg.text}</div>
                <div className="time">{msg.time}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="input-bar">
            <input
              type="text"
              placeholder="Ketik pesan..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="send-btn" onClick={sendMessage}>➤</button>
          </div>
        </>
      )}

      {activeTab === 'saham' && (
        <div className="saham-view">
          <div className="saham-header">Portofolio 📈</div>
          <div className="saham-date">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div className="card">
            {stocks.map((s, i) => (
              <React.Fragment key={s.name}>
                <div className="stock-row">
                  <span className="stock-name">{s.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="stock-price">Rp {s.price.toLocaleString('id-ID')}</span>
                    <span className={`stock-change ${s.up ? 'up' : 'down'}`}>{s.change}</span>
                  </div>
                </div>
                {i < stocks.length - 1 && <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />}
              </React.Fragment>
            ))}
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-title">🔥 Sorotan</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div>• <b style={{ color: 'var(--green)' }}>SURI</b> paling moncer +24% 🚀</div>
              <div>• <b style={{ color: 'var(--red)' }}>GOTO</b> turun -1.9%, perlu dipantau</div>
              <div>• <b style={{ color: 'var(--accent)' }}>ADRO</b> naik 3.5% — batubara lagi naik</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'device' && (
        <div className="device-view">
          <div className="card">
            <div className="card-title">⚡ Kontrol Perangkat</div>
            <div className="device-grid">
              {devices.map((d, i) => (
                <button
                  key={d.label}
                  className={`device-btn ${d.active ? 'active' : ''}`}
                  onClick={() => toggleDevice(i)}
                >
                  <span className="dev-icon">{d.icon}</span>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-title">📊 Status Perangkat</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>Baterai</span><span>85%</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 4 }}>
                  <div style={{ width: '85%', height: '100%', background: 'var(--green)', borderRadius: 4 }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>RAM</span><span>5.2 / 12 GB</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 4 }}>
                  <div style={{ width: '43%', height: '100%', background: 'var(--accent)', borderRadius: 4 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="welcome" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', padding: 40 }}>
          <div className="welcome-icon">🤖</div>
          <h1>Friday Dashboard</h1>
          <p>AI Assistant pribadi Greez<br />by Hermes Agent</p>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8 }}>
            <div>💬 Chat × 📊 Saham × ⚡ Device</div>
            <div style={{ marginTop: 8, fontSize: 11 }}>v1.0.0 — Made with ❤️</div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="bottom-nav">
        {[
          { key: 'chat', icon: '🏠', label: 'Home' },
          { key: 'chat', icon: '💬', label: 'Chat' },
          { key: 'saham', icon: '📊', label: 'Saham' },
          { key: 'about', icon: '👤', label: 'Profil' },
        ].map(item => (
          <button
            key={item.label}
            className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => setActiveTab(item.key)}
          >
            <span className="ni-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
