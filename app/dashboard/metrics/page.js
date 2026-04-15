'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Users, DollarSign, Target, Award, Eye, Send, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react'

const C = { navy:'#0B1929', gold:'#C9973F', cream:'#F6F0E4', creamDark:'#EDE5D2', border:'#E0D8CC', borderLight:'#EDE8E0', textSoft:'#6B7A8D', textMid:'#3A4A5C', textMuted:'#8A9BB0', white:'#FFFFFF', goldPale:'#FFF6E8' }
const F = 'Calibri, Candara, Segoe UI, sans-serif'
const SOURCE_COLORS = ['#C9973F','#1E5FAD','#2E8B57','#8B2FC9','#C92F2F','#2F8BC9','#C97B2F','#6B7A8D']

function StatCard({ icon, label, value, sub, trend, highlight }) {
  return (
    <div style={{ background: highlight ? C.goldPale : C.white, border:`1px solid ${highlight ? '#EDD5A0' : C.border}`, borderRadius:12, padding:'18px 20px', boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:10.5, fontWeight:700, color:highlight ? '#8C6200' : C.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:F }}>{label}</span>
        <span style={{ color:C.gold }}>{icon}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:700, color:highlight ? C.gold : C.navy, lineHeight:1.1, fontFamily:F }}>{value}</div>
      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:5 }}>
        {trend !== undefined && (
          <span style={{ display:'flex', alignItems:'center', gap:2, fontSize:11, fontWeight:700, color: trend >= 0 ? '#2E7D32' : '#C62828' }}>
            {trend >= 0 ? <ArrowUp size={10}/> : <ArrowDown size={10}/>} {Math.abs(trend)}%
          </span>
        )}
        {sub && <span style={{ fontSize:11.5, color:C.textSoft, fontFamily:F }}>{sub}</span>}
      </div>
    </div>
  )
}

function FunnelBar({ stage, count, total, value, pct: forcedPct, color }) {
  const pct = forcedPct !== undefined ? forcedPct : (total ? Math.round((count/total)*100) : 0)
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:12.5, fontWeight:700, color:C.navy, fontFamily:F }}>{stage}</span>
        <div style={{ display:'flex', gap:12 }}>
          <span style={{ fontSize:12, color:C.textSoft, fontFamily:F }}>{count}</span>
          {value !== undefined && <span style={{ fontSize:12, fontWeight:700, color:C.gold, fontFamily:F }}>{value}</span>}
          <span style={{ fontSize:11, color:C.textMuted, fontFamily:F, minWidth:34, textAlign:'right' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ background:C.creamDark, borderRadius:4, height:10 }}>
        <div style={{ background: color || C.gold, width:`${pct}%`, height:'100%', borderRadius:4, transition:'width 0.8s ease' }} />
      </div>
    </div>
  )
}

function DonutChart({ data }) {
  const total = data.reduce((s,d) => s+d.value, 0)
  let cumulative = 0
  const r = 60, cx = 70, cy = 70, sw = 22
  const slices = data.map((d,i) => {
    const pct = total ? d.value/total : 0
    const start = cumulative; cumulative += pct
    const s = start*2*Math.PI - Math.PI/2, e = cumulative*2*Math.PI - Math.PI/2
    return { ...d, x1:cx+r*Math.cos(s), y1:cy+r*Math.sin(s), x2:cx+r*Math.cos(e), y2:cy+r*Math.sin(e), large:pct>0.5?1:0, pct, color:SOURCE_COLORS[i%SOURCE_COLORS.length] }
  })
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <svg width={140} height={140} style={{ flexShrink:0 }}>
        {slices.map((s,i) => s.pct > 0.001 && (
          <path key={i} d={`M ${s.x1} ${s.y1} A ${r} ${r} 0 ${s.large} 1 ${s.x2} ${s.y2}`}
            fill="none" stroke={s.color} strokeWidth={sw} strokeLinecap="butt" />
        ))}
        <text x={cx} y={cy-6} textAnchor="middle" fill={C.navy} fontSize={18} fontWeight={700} fontFamily={F}>{total}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill={C.textSoft} fontSize={10} fontFamily={F}>leads</text>
      </svg>
      <div style={{ flex:1 }}>
        {slices.map((s,i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:s.color, flexShrink:0 }} />
              <span style={{ fontSize:12, color:C.textMid, fontFamily:F }}>{s.label}</span>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.navy, fontFamily:F }}>{s.value}</span>
              <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>{Math.round(s.pct*100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MetricsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding:'60px 34px', textAlign:'center', color:C.textMuted, fontFamily:F }}>Loading metrics…</div>
  if (!stats) return <div style={{ padding:'60px 34px', textAlign:'center', color:C.textMuted, fontFamily:F }}>No data</div>

  const { overview: o, proposals: p, pipeline_stages: stages, lead_sources: sources } = stats

  const sourceData = (sources||[]).filter(s => s.count > 0).map(s => ({ label: s.source, value: s.count }))
  const topSource = sourceData[0]?.label || '—'

  return (
    <div style={{ padding:'28px 34px', fontFamily:F }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:C.navy, margin:0 }}>Customer Acquisition</h1>
        <p style={{ color:C.textSoft, margin:'3px 0 0', fontSize:13 }}>Live pipeline · Proposal analytics · Conversion rates</p>
      </div>

      {/* KPI Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:12, marginBottom:24 }}>
        <StatCard icon={<Users size={15}/>}      label="Total Leads"   value={o.total_contacts}                            sub="all time" />
        <StatCard icon={<DollarSign size={15}/>} label="Won Revenue"   value={`$${Math.round(o.won_revenue/1000)}K`}      sub={`${stages?.find(s=>s.stage==='Closed Won')?.count||0} deals`} trend={12} />
        <StatCard icon={<Target size={15}/>}     label="Pipeline"      value={`$${Math.round(o.pipeline_value/1000)}K`}   sub={`${o.active_deals} active`} />
        <StatCard icon={<Award size={15}/>}      label="Win Rate"      value={`${o.win_rate_pct}%`}                       sub="closed deals" trend={5} />
        <StatCard icon={<TrendingUp size={15}/>} label="Avg Deal"      value={`$${Math.round(o.avg_deal_size/1000)}K`}   sub="closed won" />
      </div>

      {/* Proposal Metrics Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:24 }}>
        <StatCard icon={<Send size={15}/>}        label="Proposals Sent"     value={p.total_sent}           sub="total generated" />
        <StatCard icon={<Eye size={15}/>}          label="Proposals Viewed"   value={p.total_viewed}         sub={`${p.view_rate_pct}% view rate`} highlight />
        <StatCard icon={<CheckCircle size={15}/>}  label="Proposals Accepted" value={p.total_accepted}       sub={`${p.accept_rate_pct}% close rate`} highlight />
        <StatCard icon={<Eye size={15}/>}          label="Total Views"        value={p.total_views}          sub="across all proposals" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Pipeline Funnel */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:'0 0 18px' }}>Pipeline Funnel</h2>
          {(stages||[]).map(s => (
            <FunnelBar key={s.stage} stage={s.stage} count={s.count}
              total={Math.max(stages[0]?.count||1, 1)}
              value={s.value ? `$${Math.round(s.value/1000)}K` : undefined} />
          ))}
          <div style={{ marginTop:16, padding:'12px 14px', background:C.goldPale, borderRadius:8, border:'1px solid #EDD5A0' }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'#8C6200', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>Lead → Won Conversion</div>
            <div style={{ fontSize:22, fontWeight:700, color:C.gold }}>
              {o.total_contacts ? Math.round(((stages?.find(s=>s.stage==='Closed Won')?.count||0)/o.total_contacts)*100) : 0}%
            </div>
          </div>
        </div>

        {/* Proposal Conversion Funnel */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:'0 0 18px' }}>Proposal Funnel</h2>
          <FunnelBar stage="Sent"     count={p.total_sent}     total={p.total_sent} pct={100}              color="#4A6A8A" />
          <FunnelBar stage="Viewed"   count={p.total_viewed}   total={p.total_sent} color="#C9973F" />
          <FunnelBar stage="Accepted" count={p.total_accepted} total={p.total_sent} color="#2E7D32" />
          <div style={{ marginTop:16, padding:'12px 14px', background:C.goldPale, borderRadius:8, border:'1px solid #EDD5A0' }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'#8C6200', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>View → Accept Rate</div>
            <div style={{ fontSize:22, fontWeight:700, color:C.gold }}>
              {p.total_viewed > 0 ? Math.round((p.total_accepted / p.total_viewed) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20 }}>
        {/* Lead Sources */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:0 }}>Lead Sources</h2>
            <span style={{ fontSize:11, color:C.textMuted }}>Top: <strong style={{color:C.navy}}>{topSource}</strong></span>
          </div>
          {sourceData.length > 0 ? <DonutChart data={sourceData} /> : (
            <div style={{ textAlign:'center', padding:'32px 0', color:C.textMuted, fontSize:13 }}>No source data yet.</div>
          )}
        </div>

        {/* Key Ratios */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:'0 0 16px' }}>Key Ratios</h2>
          {[
            ['Leads → Proposal', `${o.total_contacts ? Math.round(((stages?.find(s=>s.stage==='Proposal')?.count||0)/o.total_contacts)*100):0}%`],
            ['Proposal View Rate', `${p.view_rate_pct}%`],
            ['Proposal Accept Rate', `${p.accept_rate_pct}%`],
            ['Win Rate (Closed)', `${o.win_rate_pct}%`],
            ['Avg Views/Proposal', p.total_sent > 0 ? (p.total_views/p.total_sent).toFixed(1) : '—'],
            ['Avg Deal Size', `$${Math.round(o.avg_deal_size/1000)}K`],
            ['Pipeline Coverage', o.won_revenue > 0 ? `${(o.pipeline_value/o.won_revenue).toFixed(1)}x` : '—'],
          ].map(([label, val]) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:`1px solid ${C.borderLight}` }}>
              <span style={{ fontSize:12.5, color:C.textMid, fontFamily:F }}>{label}</span>
              <span style={{ fontSize:14, fontWeight:700, color:C.navy, fontFamily:F }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
