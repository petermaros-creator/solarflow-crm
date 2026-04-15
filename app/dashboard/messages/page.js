'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Hash } from 'lucide-react'

const C = { navy:'#0B1929', gold:'#C9973F', cream:'#F6F0E4', creamDark:'#EDE5D2', border:'#E0D8CC', borderLight:'#EDE8E0', textSoft:'#6B7A8D', textMid:'#3A4A5C', textMuted:'#8A9BB0', white:'#FFFFFF', navyMid:'#1E3350' }
const F = 'Calibri, Candara, Segoe UI, sans-serif'

const CHANNELS = [
  { id:'general', label:'General', desc:'Team-wide announcements' },
  { id:'sales', label:'Sales', desc:'Deals, pipeline, proposals' },
  { id:'projects', label:'Projects', desc:'Installation & field ops' },
  { id:'marketing', label:'Marketing', desc:'Campaigns & leads' },
]

const SENDER = 'Peter M.'

const AVATAR_COLORS = { 'Alex T.':'#1E3350','Jordan M.':'#C9973F','Sam R.':'#4A6F8C','Peter M.':'#3A6B4A','Team':'#6B3A5B' }

function Avatar({ name, size=32 }) {
  const col = AVATAR_COLORS[name] || '#1E3350'
  const initials = name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:col, color:'#F6F0E4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.36, fontWeight:700, flexShrink:0, fontFamily:F }}>{initials}</div>
  )
}

export default function Messages() {
  const [channel, setChannel] = useState('general')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const supabase = createClient()

  async function loadMessages(ch) {
    const { data } = await supabase.from('messages').select('*').eq('channel', ch).order('created_at', { ascending:true }).limit(100)
    setMessages(data || [])
  }

  useEffect(() => { loadMessages(channel) }, [channel])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  useEffect(() => {
    const sub = supabase.channel('messages-realtime')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages', filter:`channel=eq.${channel}` }, payload => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [channel])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return
    setSending(true)
    await supabase.from('messages').insert({ channel, sender_name: SENDER, content: input.trim() })
    setInput('')
    setSending(false)
    await loadMessages(channel)
  }

  function formatTime(ts) {
    const d = new Date(ts)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return d.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' })
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' })
  }

  function groupMessages(msgs) {
    const groups = []
    let prev = null
    msgs.forEach(msg => {
      if (prev && prev.sender_name === msg.sender_name && new Date(msg.created_at) - new Date(prev.created_at) < 300000) {
        groups[groups.length-1].messages.push(msg)
      } else {
        groups.push({ sender: msg.sender_name, messages: [msg] })
      }
      prev = msg
    })
    return groups
  }

  const groups = groupMessages(messages)
  const currentChannel = CHANNELS.find(c => c.id === channel)

  return (
    <div style={{ display:'flex', height:'calc(100vh - 50px)', fontFamily:F }}>
      {/* Sidebar */}
      <div style={{ width:220, background:C.navyMid, borderRight:`1px solid rgba(255,255,255,0.08)`, display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'18px 16px 10px' }}>
          <div style={{ fontSize:10.5, fontWeight:700, color:'#4A6A8A', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Channels</div>
          {CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => setChannel(ch.id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:7, border:'none', cursor:'pointer', textAlign:'left', marginBottom:2,
              background: channel === ch.id ? 'rgba(201,151,63,0.18)' : 'transparent',
              color: channel === ch.id ? C.gold : '#6A8BAA',
              fontSize:13, fontWeight: channel === ch.id ? 700 : 400,
            }}>
              <Hash size={13} />
              {ch.label}
            </button>
          ))}
        </div>
        <div style={{ flex:1 }} />
        <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:8 }}>
          <Avatar name={SENDER} size={28} />
          <div>
            <div style={{ color:'#F6F0E4', fontSize:12, fontWeight:700 }}>{SENDER}</div>
            <div style={{ color:'#3A5570', fontSize:10 }}>● Online</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.white }}>
        {/* Header */}
        <div style={{ padding:'14px 22px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <Hash size={16} color={C.gold} />
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:C.navy }}>{currentChannel?.label}</div>
            <div style={{ fontSize:11.5, color:C.textSoft }}>{currentChannel?.desc}</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 22px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 0', color:C.textMuted }}>
              <Hash size={32} color={C.creamDark} style={{ marginBottom:12 }} />
              <div style={{ fontSize:15, fontWeight:700, color:C.textMid, marginBottom:6 }}>Welcome to #{currentChannel?.label}</div>
              <div style={{ fontSize:13 }}>This is the beginning of the channel. Say something!</div>
            </div>
          )}
          {groups.map((group, gi) => (
            <div key={gi} style={{ display:'flex', gap:12, marginBottom:16 }}>
              <Avatar name={group.sender} size={36} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:13.5, fontWeight:700, color:C.navy }}>{group.sender}</span>
                  <span style={{ fontSize:10.5, color:C.textMuted }}>{formatTime(group.messages[0].created_at)}</span>
                </div>
                {group.messages.map((msg, mi) => (
                  <div key={mi} style={{ fontSize:14, color:C.textMid, lineHeight:1.55, marginBottom:2 }}>{msg.content}</div>
                ))}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding:'14px 22px', borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
          <form onSubmit={handleSend} style={{ display:'flex', gap:10, alignItems:'center' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Message #${currentChannel?.label}…`}
              style={{ flex:1, height:42, border:`1.5px solid ${C.border}`, borderRadius:10, padding:'0 14px', fontSize:14, color:C.navy, background:C.cream, fontFamily:F }}
            />
            <button type="submit" disabled={sending || !input.trim()} style={{
              width:42, height:42, background:input.trim() ? C.gold : C.creamDark, border:'none', borderRadius:10, cursor:input.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.15s'
            }}>
              <Send size={16} color="#fff" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
