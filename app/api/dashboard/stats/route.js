import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  const [
    { data: contacts },
    { data: deals },
    { data: proposals },
  ] = await Promise.all([
    supabase.from('contacts').select('id, status, lead_source, created_at'),
    supabase.from('deals').select('id, stage, value, created_at, close_date'),
    supabase.from('proposals').select('id, status, total_price, view_count, created_at'),
  ])

  const c = contacts || [], d = deals || [], p = proposals || []

  const wonDeals = d.filter(x => x.stage === 'Closed Won')
  const lostDeals = d.filter(x => x.stage === 'Closed Lost')
  const activeDeals = d.filter(x => !['Closed Won','Closed Lost'].includes(x.stage))
  const wonRevenue = wonDeals.reduce((s, x) => s + (x.value||0), 0)
  const pipelineValue = activeDeals.reduce((s, x) => s + (x.value||0), 0)
  const winRate = (wonDeals.length + lostDeals.length) > 0
    ? Math.round(wonDeals.length / (wonDeals.length + lostDeals.length) * 100) : 0

  const proposalsSent = p.length
  const proposalsViewed = p.filter(x => (x.view_count||0) > 0).length
  const proposalsAccepted = p.filter(x => x.status === 'accepted').length
  const totalViews = p.reduce((s, x) => s + (x.view_count||0), 0)
  const viewRate = proposalsSent > 0 ? Math.round(proposalsViewed / proposalsSent * 100) : 0
  const acceptRate = proposalsSent > 0 ? Math.round(proposalsAccepted / proposalsSent * 100) : 0

  const stageBreakdown = ['Lead','Site Assessment','Proposal','Contract','Closed Won','Closed Lost']
    .map(stage => ({ stage, count: d.filter(x => x.stage === stage).length, value: d.filter(x => x.stage === stage).reduce((s,x) => s+(x.value||0), 0) }))

  const sourceBreakdown = [...new Set(c.map(x => x.lead_source || 'Direct'))]
    .map(src => ({ source: src, count: c.filter(x => (x.lead_source||'Direct') === src).length }))
    .sort((a,b) => b.count - a.count)

  return NextResponse.json({
    overview: {
      total_contacts: c.length,
      total_deals: d.length,
      active_deals: activeDeals.length,
      won_revenue: wonRevenue,
      pipeline_value: pipelineValue,
      win_rate_pct: winRate,
      avg_deal_size: wonDeals.length ? Math.round(wonRevenue / wonDeals.length) : 0,
    },
    proposals: {
      total_sent: proposalsSent,
      total_viewed: proposalsViewed,
      total_accepted: proposalsAccepted,
      total_views: totalViews,
      view_rate_pct: viewRate,
      accept_rate_pct: acceptRate,
    },
    pipeline_stages: stageBreakdown,
    lead_sources: sourceBreakdown,
    generated_at: new Date().toISOString(),
  })
}
