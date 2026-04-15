import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request, { params }) {
  const supabase = createClient()
  const { id } = params

  const [
    { data: contact },
    { data: deals },
    { data: proposals },
    { data: calls },
    { data: activities },
  ] = await Promise.all([
    supabase.from('contacts').select('*').eq('id', id).single(),
    supabase.from('deals').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
    supabase.from('proposals').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
    supabase.from('calls').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
    supabase.from('activities').select('*').eq('contact_id', id).order('created_at', { ascending: false }),
  ])

  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

  // Build full timeline
  const timeline = []

  activities?.forEach(a => timeline.push({ type: 'activity', subtype: a.type, note: a.note, date: a.created_at }))
  deals?.forEach(d => timeline.push({ type: 'deal', subtype: 'stage_change', note: `Deal "${d.title}" — ${d.stage}`, value: d.value, date: d.created_at }))
  proposals?.forEach(p => {
    timeline.push({ type: 'proposal', subtype: 'sent', note: `Proposal sent — ${p.system_size} @ $${p.total_price?.toLocaleString()}`, date: p.created_at })
    if (p.last_viewed_at) timeline.push({ type: 'proposal', subtype: 'viewed', note: `Proposal viewed (${p.view_count || 1}x)`, date: p.last_viewed_at })
    if (p.status === 'accepted') timeline.push({ type: 'proposal', subtype: 'accepted', note: 'Proposal accepted ✓', date: p.updated_at || p.created_at })
  })
  calls?.forEach(c => timeline.push({ type: 'call', subtype: c.direction, note: `${c.direction} call — ${Math.floor((c.duration_seconds||0)/60)}m ${(c.duration_seconds||0)%60}s`, date: c.created_at }))

  timeline.sort((a,b) => new Date(b.date) - new Date(a.date))

  const wonDeal = deals?.find(d => d.stage === 'Closed Won')
  const latestProposal = proposals?.[0]
  const totalProposalViews = proposals?.reduce((s,p) => s+(p.view_count||0), 0) || 0

  return NextResponse.json({
    contact,
    summary: {
      pipeline_stage: deals?.[0]?.stage || 'Lead',
      system_size: wonDeal?.system_size || deals?.[0]?.system_size,
      contract_value: wonDeal?.value || deals?.[0]?.value,
      total_calls: calls?.length || 0,
      total_proposals: proposals?.length || 0,
      total_proposal_views: totalProposalViews,
      proposal_status: latestProposal?.status || null,
      days_in_pipeline: contact.created_at ? Math.floor((new Date() - new Date(contact.created_at)) / 86400000) : null,
    },
    deals: deals || [],
    proposals: proposals || [],
    calls: calls || [],
    timeline,
  })
}
