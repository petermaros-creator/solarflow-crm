'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Play, Search, Plus, X, Clock, User } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'

const C = { navy:'#0B1929', gold:'#C9973F', cream:'#F6F0E4', creamDark:'#EDE5D2', border:'#E0D8CC', borderLight:'#EDE8E0', textSoft:'#6B7A8D', textMid:'#3A4A5C', textMuted:'#8A9BB0', white:'#FFFFFF', goldPale:'#FFF6E8' }
const F = 'Calibri, Candara, Segoe UI, sans-serif'

function formatDuration(secs) {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatTime(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
  if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' })
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })
}

function CallIcon({ direction }) {
  if (direction === 'inbound') return <PhoneIncoming size={15} color="#2E7D32" />
  if (direction === 'missed') return <PhoneMissed size={15} color="#C62828" />
  return <PhoneOutgoing size={15} color="#1565C0" />
}

function DirectionBadge({ direction }) {
  const s = direction === 'inbound' ? { bg:'#DFF2E4', color:'#1A6B35' } : direction === 'missed' ? { bg:'#FAE0E0', color:'#8C2020' } : { bg:'#E8EDF5', color:'#2952A3' }
  return <span style={{ background:s.bg, color:s.color, padding:'2px 9px', borderRadius:20, fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', fontFamily:F }}>{direction}</span>
}

export default function Calls() {
  const [calls, setCalls] = useState([])
  const [contacts, setContacts] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [showLog, setShowLog] = useState(false)
  const [form, setForm] = useState({ direction:'outbound', contact_id:'', notes:'', duration_seconds:0 })
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    // Try Dialpad API first
    try {
      const res = await fetch('/api/dialpad?endpoint=calls&limit=50')
      const data = await res.json()
      if (data._mock) setIsMock(true)
      if (data.items?.length) {
        setCalls(data.items.map(c => ({
          id: c.id,
          direction: c.direction,
          duration_seconds: Math.round((c.duration || 0) / 1000),
          created_at: new Date(c.date_started).toISOString(),
          from_number: c.from_number,
          to_number: c.to_number,
          recording_url: c.recording_url,
          notes: null,
          _name: c.contact_name,
        })))
        const [{ data: co }] = await Promise.all([supabase.from('contacts').select('id, name, phone')])
        setContacts(co || [])
        setLoading(false)
        return
      }
    } catch(e) {}

    // Fall back to Supabase call log
    const [{ data: cl }, { data: co }] = await Promise.all([
      supabase.from('calls').select('*, contacts(name, phone)').order('created_at', { ascending:false }),
      supabase.from('contacts').select('id, name, phone'),
    ])
    setCalls(cl || [])
    setContacts(co || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleLogCall() {
    const { data: { user } } = { data: { user: null } }
    await supabase.from('calls').insert({
      ...form,
      duration_seconds: parseInt(form.duration_seconds) || 0,
      contact_id: form.contact_id || null,
    })
    setShowLog(false)
    setForm({ direction:'outbound', contact_id:'', notes:'', duration_seconds:0 })
    await load()
  }

  async function handleSaveNotes() {
    if (!selected?.id || selected._mock) return
    await supabase.from('calls').update({ notes: selected.notes }).eq('id', selected.id)
    await load()
    setSelected(null)
  }

  const filtered = calls.filter(c => {
    if (filter !== 'all' && c.direction !== filter) return false
    const name = c._name || c.contacts?.name || ''
    const num = c.from_number || c.to_number || ''
    return name.toLowerCase().includes(search.toLowerCase()) || num.includes(search)
  })

  const totalCalls = calls.length
  const inboundCount = calls.filter(c => c.direction === 'inbound').length
  const outboundCount = calls.filter(c => c.direction === 'outbound').length
  const missedCount = calls.filter(c => c.direction === 'missed').length
  const avgDuration = calls.filter(c => c.duration_seconds > 0).length
    ? Math.round(calls.filter(c => c.duration_seconds > 0).reduce((s, c) => s + (c.duration_seconds||0), 0) / calls.filter(c => c.duration_seconds > 0).length)
    : 0

  return (
    <div style={{ padding:'28px 34px', fontFamily:F }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:C.navy, margin:0 }}>Call Log</h1>
          <p style={{ color:C.textSoft, margin:'3px 0 0', fontSize:13 }}>
            {isMock ? 'Demo data — add DIALPAD_API_KEY to .env.local for live calls' : `${totalCalls} calls via Dialpad`}
          </p>
        </div>
        <button onClick={() => setShowLog(true)} style={{ background:C.gold, color:'#fff', border:'none', borderRadius:8, padding:'0 16px', height:36, fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:5, cursor:'pointer' }}>
          <Plus size={13} /> Log Call
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:22 }}>
        {[
          { icon:<PhoneIncoming size={15}/>, label:'Inbound',  value:inboundCount,  color:'#2E7D32' },
          { icon:<PhoneOutgoing size={15}/>, label:'Outbound', value:outboundCount, color:'#1565C0' },
          { icon:<PhoneMissed size={15}/>,   label:'Missed',   value:missedCount,   color:'#C62828' },
          { icon:<Clock size={15}/>,         label:'Avg Duration', value:formatDuration(avgDuration), color:C.gold },
        ].map(s => (
          <div key={s.label} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 18px', boxShadow:'0 1px 4px rgba(11,25,41,0.05)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:10.5, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.07em' }}>{s.label}</span>
              <span style={{ color:s.color }}>{s.icon}</span>
            </div>
            <div style={{ fontSize:24, fontWeight:700, color:C.navy }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', gap:6 }}>
          {['all','inbound','outbound','missed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:F, textTransform:'capitalize',
              border:`1.5px solid ${filter===f ? C.gold : C.border}`,
              background: filter===f ? C.goldPale : C.white,
              color: filter===f ? C.gold : C.textMid,
            }}>{f}</button>
          ))}
        </div>
        <div style={{ position:'relative' }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:C.textMuted, pointerEvents:'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search calls…"
            style={{ paddingLeft:30, paddingRight:12, height:34, border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.navy, background:C.white, width:180, fontFamily:F }} />
        </div>
      </div>

      {/* Call List */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
        {loading ? (
          <div style={{ padding:'40px', textAlign:'center', color:C.textMuted }}>Loading calls…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'40px', textAlign:'center', color:C.textMuted }}>No calls found.</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:C.cream, borderBottom:`1px solid ${C.border}` }}>
                {['Direction','Contact','From','To','Duration','Time','Recording',''].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:10.5, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:F }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(call => {
                const name = call._name || call.contacts?.name || '—'
                return (
                  <tr key={call.id} onClick={() => setSelected(call)} style={{ borderBottom:`1px solid ${C.borderLight}`, cursor:'pointer', background: selected?.id === call.id ? C.goldPale : 'transparent' }}>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <CallIcon direction={call.direction} />
                        <DirectionBadge direction={call.direction} />
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <Avatar name={name} size={28} />
                        <span style={{ fontSize:13, fontWeight:700, color:C.navy, fontFamily:F }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:C.textMid, fontFamily:F }}>{call.from_number || '—'}</td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:C.textMid, fontFamily:F }}>{call.to_number || '—'}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, fontWeight:700, color:C.textMid, fontFamily:F }}>{formatDuration(call.duration_seconds)}</td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:C.textSoft, fontFamily:F }}>{formatTime(call.created_at)}</td>
                    <td style={{ padding:'12px 16px' }}>
                      {call.recording_url ? (
                        <a href={call.recording_url} target="_blank" rel="noreferrer"
                          style={{ display:'flex', alignItems:'center', gap:5, color:C.gold, fontSize:12, fontWeight:700, textDecoration:'none' }}>
                          <Play size={12} /> Play
                        </a>
                      ) : <span style={{ fontSize:11.5, color:C.textMuted }}>—</span>}
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:C.textSoft }}>›</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div style={{ position:'fixed', right:0, top:0, bottom:0, width:360, background:C.white, boxShadow:'-6px 0 40px rgba(11,25,41,0.13)', zIndex:200, overflowY:'auto', fontFamily:F }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px 16px', borderBottom:`1px solid ${C.borderLight}`, position:'sticky', top:0, background:C.white }}>
            <span style={{ fontSize:14.5, fontWeight:700, color:C.navy }}>Call Detail</span>
            <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:C.textSoft }}><X size={17}/></button>
          </div>
          <div style={{ padding:'20px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, paddingBottom:18, borderBottom:`1px solid ${C.borderLight}` }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background: selected.direction==='inbound'?'#DFF2E4':selected.direction==='missed'?'#FAE0E0':'#E8EDF5', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CallIcon direction={selected.direction} />
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:C.navy }}>{selected._name || selected.contacts?.name || 'Unknown'}</div>
                <div style={{ fontSize:12, color:C.textSoft }}>{formatTime(selected.created_at)}</div>
              </div>
            </div>
            {[
              ['Direction', selected.direction],
              ['Duration', formatDuration(selected.duration_seconds)],
              ['From', selected.from_number || '—'],
              ['To', selected.to_number || '—'],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${C.borderLight}` }}>
                <span style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.06em' }}>{k}</span>
                <span style={{ fontSize:13, color:C.navy, fontWeight:700, textTransform:'capitalize' }}>{v}</span>
              </div>
            ))}
            {selected.recording_url && (
              <div style={{ marginTop:18, padding:'14px 16px', background:C.goldPale, borderRadius:10, border:'1px solid #EDD5A0' }}>
                <div style={{ fontSize:10.5, fontWeight:700, color:'#8C6200', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Recording</div>
                <a href={selected.recording_url} target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:8, color:C.gold, fontWeight:700, fontSize:13, textDecoration:'none' }}>
                  <Play size={14}/> Play Recording
                </a>
              </div>
            )}
            <div style={{ marginTop:18 }}>
              <div style={{ fontSize:10.5, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Notes</div>
              <textarea
                value={selected.notes || ''}
                onChange={e => setSelected(s => ({ ...s, notes: e.target.value }))}
                placeholder="Add call notes…"
                rows={4}
                style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px', fontSize:13, color:C.navy, fontFamily:F, resize:'vertical', boxSizing:'border-box' }}
              />
              <button onClick={handleSaveNotes} style={{ marginTop:10, width:'100%', background:C.navy, color:C.cream, border:'none', borderRadius:8, padding:'9px 0', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Call Modal */}
      {showLog && (
        <div style={{ position:'fixed', inset:0, background:'rgba(11,25,41,0.5)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:C.white, borderRadius:16, padding:32, width:420, boxShadow:'0 20px 60px rgba(11,25,41,0.3)', fontFamily:F }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontSize:17, fontWeight:700, color:C.navy, margin:0 }}>Log a Call</h2>
              <button onClick={() => setShowLog(false)} style={{ background:'none', border:'none', cursor:'pointer', color:C.textSoft }}><X size={17}/></button>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:6 }}>Direction</label>
              <select value={form.direction} onChange={e => setForm(f=>({...f, direction:e.target.value}))} style={{ width:'100%', height:38, border:`1px solid ${C.border}`, borderRadius:8, padding:'0 12px', fontSize:14, color:C.navy, background:'#FAFAF8', fontFamily:F }}>
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
                <option value="missed">Missed</option>
              </select>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:6 }}>Contact</label>
              <select value={form.contact_id} onChange={e => setForm(f=>({...f, contact_id:e.target.value}))} style={{ width:'100%', height:38, border:`1px solid ${C.border}`, borderRadius:8, padding:'0 12px', fontSize:14, color:C.navy, background:'#FAFAF8', fontFamily:F }}>
                <option value="">— Select contact —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:6 }}>Duration (seconds)</label>
              <input type="number" value={form.duration_seconds} onChange={e => setForm(f=>({...f, duration_seconds:e.target.value}))} style={{ width:'100%', height:38, border:`1px solid ${C.border}`, borderRadius:8, padding:'0 12px', fontSize:14, color:C.navy, background:'#FAFAF8', fontFamily:F }} />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:6 }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f=>({...f, notes:e.target.value}))} rows={3} style={{ width:'100%', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px', fontSize:14, color:C.navy, fontFamily:F, resize:'vertical' }} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowLog(false)} style={{ flex:1, background:C.white, color:C.navy, border:`1.5px solid ${C.border}`, borderRadius:8, padding:'10px 0', fontSize:13, fontWeight:700, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleLogCall} style={{ flex:2, background:C.gold, color:'#fff', border:'none', borderRadius:8, padding:'10px 0', fontSize:13, fontWeight:700, cursor:'pointer' }}>Log Call</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
