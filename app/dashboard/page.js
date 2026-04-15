import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DollarSign, Zap, TrendingUp, CheckCircle, Phone, FileText, ChevronRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'

const C = { navy:'#0B1929', gold:'#C9973F', cream:'#F6F0E4', creamDark:'#EDE5D2', border:'#E0D8CC', borderLight:'#EDE8E0', textSoft:'#6B7A8D', textMid:'#3A4A5C', textMuted:'#8A9BB0', white:'#FFFFFF', goldPale:'#FFF6E8' }
const F = 'Calibri, Candara, Segoe UI, sans-serif'

function KPI({ icon, label, value, sub }) {
  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 20px', boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:10.5, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:F }}>{label}</span>
        <span style={{ color:C.gold }}>{icon}</span>
      </div>
      <div style={{ fontSize:28, fontWeight:700, color:C.navy, lineHeight:1.1, fontFamily:F }}>{value}</div>
      {sub && <div style={{ fontSize:11.5, color:C.textSoft, marginTop:4, fontFamily:F }}>{sub}</div>}
    </div>
  )
}

export default async function Dashboard() {
  let deals = [], projects = [], tasks = [], activities = []
  try {
    const supabase = createClient()
    const [d, p, t, a] = await Promise.all([
      supabase.from('deals').select('*, contacts(name)'),
      supabase.from('projects').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('activities').select('*, contacts(name)').order('created_at', { ascending:false }).limit(6),
    ])
    deals = d.data || []; projects = p.data || []; tasks = t.data || []; activities = a.data || []
  } catch(e) {}

  const activeDeals = deals.filter(d => !['Closed Won','Closed Lost'].includes(d.stage))
  const pipelineTotal = activeDeals.reduce((s, d) => s + (d.value||0), 0)
  const activeProjects = projects.filter(p => p.stage !== 'Complete').length
  const closedWon = deals.filter(d => d.stage === 'Closed Won').reduce((s, d) => s + (d.value||0), 0)
  const openTasks = tasks.filter(t => t.status !== 'Done').length
  const highPrio = tasks.filter(t => t.priority === 'High' && t.status !== 'Done').length

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })

  return (
    <div style={{ padding:'28px 34px', maxWidth:1100, fontFamily:F }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:23, fontWeight:700, color:C.navy, margin:0 }}>{greeting} ☀️</h1>
        <p style={{ color:C.textSoft, margin:'4px 0 0', fontSize:13.5 }}>{dateStr} — here's where things stand.</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:26 }}>
        <KPI icon={<DollarSign size={16} />} label="Pipeline Value"  value={`$${Math.round(pipelineTotal/1000)}K`}  sub={`${activeDeals.length} active deals`} />
        <KPI icon={<Zap size={16} />}         label="Active Projects" value={activeProjects}                          sub="In permitting & install" />
        <KPI icon={<TrendingUp size={16} />}  label="Closed Won YTD" value={`$${Math.round(closedWon/1000)}K`}      sub={`${deals.filter(d=>d.stage==='Closed Won').length} deals closed`} />
        <KPI icon={<CheckCircle size={16} />} label="Open Tasks"      value={openTasks}                              sub={`${highPrio} high priority`} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:20 }}>
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:0 }}>Pipeline Overview</h2>
            <Link href="/dashboard/pipeline" style={{ color:C.gold, fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:3, textDecoration:'none' }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {activeDeals.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px 0', color:C.textMuted, fontSize:13 }}>
              No deals yet. <Link href="/dashboard/pipeline" style={{ color:C.gold }}>Add your first deal →</Link>
            </div>
          )}
          {activeDeals.slice(0,6).map(deal => (
            <div key={deal.id} style={{ display:'flex', alignItems:'center', gap:11, padding:'9px 0', borderBottom:`1px solid ${C.borderLight}` }}>
              <Avatar name={deal.contacts?.name||'?'} size={32} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.navy, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{deal.title}</div>
                <div style={{ fontSize:11, color:C.textSoft }}>{deal.system_size} · Close {deal.close_date}</div>
              </div>
              <Badge label={deal.stage} />
              <div style={{ fontSize:13, fontWeight:700, color:C.gold, minWidth:46, textAlign:'right' }}>${Math.round((deal.value||0)/1000)}K</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:'0 0 18px' }}>Recent Activity</h2>
          {activities.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px 0', color:C.textMuted, fontSize:13 }}>No activity yet.</div>
          )}
          {activities.map(act => (
            <div key={act.id} style={{ display:'flex', gap:11, padding:'9px 0', borderBottom:`1px solid ${C.borderLight}` }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:C.cream, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {act.type==='call' && <Phone size={13} color={C.gold} />}
                {act.type==='deal' && <Zap size={13} color={C.gold} />}
                {act.type==='task' && <CheckCircle size={13} color="#2E7D32" />}
                {act.type==='note' && <FileText size={13} color={C.textSoft} />}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:C.navy }}>{act.contacts?.name||'General'}</div>
                <div style={{ fontSize:11.5, color:C.textMid, lineHeight:1.5 }}>{act.note}</div>
                <div style={{ fontSize:10.5, color:C.textMuted, marginTop:2 }}>{new Date(act.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
