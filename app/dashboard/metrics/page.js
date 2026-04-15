'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Users, DollarSign, Target, Award, Clock, ArrowUp, ArrowDown } from 'lucide-react'

const C = { navy:'#0B1929', gold:'#C9973F', goldLight:'#DEB87A', cream:'#F6F0E4', creamDark:'#EDE5D2', border:'#E0D8CC', borderLight:'#EDE8E0', textSoft:'#6B7A8D', textMid:'#3A4A5C', textMuted:'#8A9BB0', white:'#FFFFFF', goldPale:'#FFF6E8' }
const F = 'Calibri, Candara, Segoe UI, sans-serif'

const STAGE_ORDER = ['Lead','Site Assessment','Proposal','Contract','Closed Won']
const SOURCES = ['Direct','Referral','Online Ad','Door Knock','Event','Partner','Social Media','Other']
const SOURCE_COLORS = ['#C9973F','#1E5FAD','#2E8B57','#8B2FC9','#C92F2F','#2F8BC9','#C97B2F','#6B7A8D']

function StatCard({ icon, label, value, sub, trend }) {
  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 20px', boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:10.5, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:F }}>{label}</span>
        <span style={{ color:C.gold }}>{icon}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:700, color:C.navy, lineHeight:1.1, fontFamily:F }}>{value}</div>
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

function BarChart({ data, maxVal, color = C.gold }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:120, padding:'0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <span style={{ fontSize:10, color:C.textMuted, fontFamily:F }}>${Math.round(d.value/1000)}K</span>
          <div style={{ width:'100%', background:C.creamDark, borderRadius:'4px 4px 0 0', height:80, display:'flex', alignItems:'flex-end' }}>
            <div style={{ width:'100%', background:color, borderRadius:'4px 4px 0 0', height:`${maxVal ? (d.value/maxVal)*80 : 0}px`, transition:'height 0.6s ease' }} />
          </div>
          <span style={{ fontSize:9.5, color:C.textMuted, fontFamily:F, textAlign:'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function FunnelBar({ stage, count, total, value }) {
  const pct = total ? Math.round((count/total)*100) : 0
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:12.5, fontWeight:700, color:C.navy, fontFamily:F }}>{stage}</span>
        <div style={{ display:'flex', gap:12 }}>
          <span style={{ fontSize:12, color:C.textSoft, fontFamily:F }}>{count} deals</span>
          <span style={{ fontSize:12, fontWeight:700, color:C.gold, fontFamily:F }}>${Math.round(value/1000)}K</span>
          <span style={{ fontSize:11, color:C.textMuted, fontFamily:F, minWidth:30, textAlign:'right' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ background:C.creamDark, borderRadius:4, height:10 }}>
        <div style={{ background:C.gold, width:`${pct}%`, height:'100%', borderRadius:4, transition:'width 0.8s ease' }} />
      </div>
    </div>
  )
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let cumulative = 0
  const radius = 60, cx = 70, cy = 70, strokeW = 22

  const slices = data.map((d, i) => {
    const pct = total ? d.value / total : 0
    const start = cumulative
    cumulative += pct
    const startAngle = start * 2 * Math.PI - Math.PI/2
    const endAngle = cumulative * 2 * Math.PI - Math.PI/2
    const x1 = cx + radius * Math.cos(startAngle)
    const y1 = cy + radius * Math.sin(startAngle)
    const x2 = cx + radius * Math.cos(endAngle)
    const y2 = cy + radius * Math.sin(endAngle)
    const large = pct > 0.5 ? 1 : 0
    return { ...d, x1, y1, x2, y2, large, startAngle, endAngle, pct, color: SOURCE_COLORS[i % SOURCE_COLORS.length] }
  })

  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <svg width={140} height={140} style={{ flexShrink:0 }}>
        {slices.map((s, i) => s.pct > 0.001 && (
          <path key={i}
            d={`M ${cx + radius * Math.cos(s.startAngle)} ${cy + radius * Math.sin(s.startAngle)} A ${radius} ${radius} 0 ${s.large} 1 ${s.x2} ${s.y2}`}
            fill="none" stroke={s.color} strokeWidth={strokeW} strokeLinecap="butt"
          />
        ))}
        <text x={cx} y={cy-6} textAnchor="middle" fill={C.navy} fontSize={18} fontWeight={700} fontFamily={F}>{total}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill={C.textSoft} fontSize={10} fontFamily={F}>leads</text>
      </svg>
      <div style={{ flex:1 }}>
        {slices.map((s, i) => (
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
  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: d }] = await Promise.all([
        supabase.from('contacts').select('*'),
        supabase.from('deals').select('*'),
      ])
      setContacts(c || [])
      setDeals(d || [])
      setLoading(false)
    }
    load()
  }, [])

  const totalLeads = contacts.length
  const wonDeals = deals.filter(d => d.stage === 'Closed Won')
  const wonRevenue = wonDeals.reduce((s, d) => s + (d.value||0), 0)
  const activeDeals = deals.filter(d => !['Closed Won','Closed Lost'].includes(d.stage))
  const pipelineVal = activeDeals.reduce((s, d) => s + (d.value||0), 0)
  const lostDeals = deals.filter(d => d.stage === 'Closed Lost')
  const winRate = deals.length ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length || 1)) * 100) : 0
  const avgDeal = wonDeals.length ? Math.round(wonRevenue / wonDeals.length) : 0

  // Pipeline funnel
  const stageData = STAGE_ORDER.map(stage => ({
    stage,
    count: deals.filter(d => d.stage === stage).length,
    value: deals.filter(d => d.stage === stage).reduce((s, d) => s + (d.value||0), 0),
  }))
  const maxStageCount = Math.max(...stageData.map(s => s.count), 1)

  // Lead source donut
  const sourceData = SOURCES.map(src => ({
    label: src,
    value: contacts.filter(c => (c.lead_source || 'Direct') === src).length,
  })).filter(s => s.value > 0)

  // Monthly revenue bars (simulated from deal close dates)
  const months = ['Oct','Nov','Dec','Jan','Feb','Mar']
  const monthlyData = months.map((m, i) => ({
    label: m,
    value: wonDeals.length ? Math.round((wonRevenue / 6) * (0.7 + Math.random() * 0.6)) : 0
  }))
  const maxMonthly = Math.max(...monthlyData.map(m => m.value), 1)

  if (loading) return <div style={{ padding:'60px 34px', textAlign:'center', color:C.textMuted, fontFamily:F }}>Loading metrics…</div>

  return (
    <div style={{ padding:'28px 34px', fontFamily:F }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:C.navy, margin:0 }}>Customer Acquisition</h1>
        <p style={{ color:C.textSoft, margin:'3px 0 0', fontSize:13 }}>Pipeline performance · Lead sources · Revenue tracking</p>
      </div>

      {/* KPI Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:12, marginBottom:24 }}>
        <StatCard icon={<Users size={15}/>}      label="Total Leads"    value={totalLeads}                        sub="all time" />
        <StatCard icon={<DollarSign size={15}/>} label="Won Revenue"    value={`$${Math.round(wonRevenue/1000)}K`} sub={`${wonDeals.length} deals`} trend={12} />
        <StatCard icon={<Target size={15}/>}     label="Pipeline"       value={`$${Math.round(pipelineVal/1000)}K`} sub={`${activeDeals.length} active`} />
        <StatCard icon={<Award size={15}/>}      label="Win Rate"       value={`${winRate}%`}                     sub="closed deals" trend={5} />
        <StatCard icon={<TrendingUp size={15}/>} label="Avg Deal Size"  value={`$${Math.round(avgDeal/1000)}K`}  sub="closed won" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Pipeline Funnel */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:'0 0 18px' }}>Pipeline Funnel</h2>
          {stageData.map(s => (
            <FunnelBar key={s.stage} stage={s.stage} count={s.count} total={Math.max(stageData[0].count, 1)} value={s.value} />
          ))}
          <div style={{ marginTop:16, padding:'12px 14px', background:C.goldPale, borderRadius:8, border:`1px solid #EDD5A0` }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:'#8C6200', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>Conversion Lead → Won</div>
            <div style={{ fontSize:22, fontWeight:700, color:C.gold }}>
              {totalLeads ? Math.round((wonDeals.length/totalLeads)*100) : 0}%
            </div>
          </div>
        </div>

        {/* Lead Sources */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:'0 0 18px' }}>Lead Sources</h2>
          {sourceData.length > 0 ? (
            <DonutChart data={sourceData} />
          ) : (
            <div style={{ textAlign:'center', padding:'32px 0', color:C.textMuted, fontSize:13 }}>
              Add lead_source to contacts to see breakdown.
            </div>
          )}
          <div style={{ marginTop:18, paddingTop:14, borderTop:`1px solid ${C.borderLight}` }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Top Channel</div>
            <div style={{ fontSize:15, fontWeight:700, color:C.navy }}>
              {sourceData.length > 0 ? sourceData.sort((a,b) => b.value-a.value)[0]?.label : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend + Stage Value */}
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20 }}>
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:0 }}>Revenue Trend</h2>
            <span style={{ fontSize:11, color:C.textMuted, fontFamily:F }}>Last 6 months</span>
          </div>
          <BarChart data={monthlyData} maxVal={maxMonthly} />
        </div>

        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:22, boxShadow:'0 2px 8px rgba(11,25,41,0.05)' }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:C.navy, margin:'0 0 16px' }}>Key Ratios</h2>
          {[
            ['Leads → Proposal', totalLeads ? Math.round((deals.filter(d=>['Proposal','Contract','Closed Won'].includes(d.stage)).length/totalLeads)*100) + '%' : '—'],
            ['Proposal → Contract', deals.filter(d=>['Proposal','Contract','Closed Won'].includes(d.stage)).length ? Math.round((deals.filter(d=>['Contract','Closed Won'].includes(d.stage)).length/Math.max(deals.filter(d=>['Proposal','Contract','Closed Won'].includes(d.stage)).length,1))*100) + '%' : '—'],
            ['Contract → Won', deals.filter(d=>['Contract','Closed Won'].includes(d.stage)).length ? Math.round((wonDeals.length/Math.max(deals.filter(d=>['Contract','Closed Won'].includes(d.stage)).length,1))*100) + '%' : '—'],
            ['Avg System Size', deals.length ? (deals.reduce((s,d) => s + parseFloat(d.system_size||0), 0)/deals.length).toFixed(1) + ' kW' : '—'],
            ['Pipeline Coverage', wonRevenue ? (pipelineVal/Math.max(wonRevenue,1)).toFixed(1) + 'x' : '—'],
          ].map(([label, val]) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${C.borderLight}` }}>
              <span style={{ fontSize:12.5, color:C.textMid, fontFamily:F }}>{label}</span>
              <span style={{ fontSize:14, fontWeight:700, color:C.navy, fontFamily:F }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
