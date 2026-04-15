import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const source = searchParams.get('source')
  const limit = parseInt(searchParams.get('limit') || '100')

  let query = supabase
    .from('contacts')
    .select(`
      id, name, email, phone, address, status, lead_source, acquisition_date, created_at,
      deals(id, title, stage, value, system_size, close_date),
      proposals(id, status, total_price, monthly_payment, system_size, view_count, last_viewed_at, created_at)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)
  if (source) query = query.eq('lead_source', source)

  const { data: customers, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const enriched = (customers || []).map(c => {
    const deals = c.deals || []
    const proposals = c.proposals || []
    const latestDeal = deals.sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0))[0]
    const latestProposal = proposals.sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0))[0]

    const journey = []
    if (c.created_at) journey.push({ step: 'Lead Created', date: c.created_at })
    if (latestDeal) {
      const stageOrder = ['Lead','Site Assessment','Proposal','Contract','Closed Won']
      stageOrder.forEach(stage => {
        if (['Site Assessment','Proposal','Contract','Closed Won'].includes(latestDeal.stage)) {
          const stageIdx = stageOrder.indexOf(latestDeal.stage)
          const thisIdx = stageOrder.indexOf(stage)
          if (thisIdx > 0 && thisIdx <= stageIdx) journey.push({ step: stage, date: latestDeal.created_at })
        }
      })
    }
    if (latestProposal?.last_viewed_at) journey.push({ step: 'Proposal Viewed', date: latestProposal.last_viewed_at })
    if (latestProposal?.status === 'accepted') journey.push({ step: 'Proposal Accepted', date: latestProposal.created_at })

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      status: c.status,
      lead_source: c.lead_source || 'Direct',
      acquisition_date: c.acquisition_date,
      pipeline_stage: latestDeal?.stage || 'Lead',
      system_size: latestDeal?.system_size || latestProposal?.system_size,
      contract_value: latestDeal?.value || null,
      proposal: latestProposal ? {
        id: latestProposal.id,
        status: latestProposal.status,
        total_price: latestProposal.total_price,
        monthly_payment: latestProposal.monthly_payment,
        view_count: latestProposal.view_count || 0,
        last_viewed_at: latestProposal.last_viewed_at,
      } : null,
      proposal_views: proposals.reduce((s,p) => s+(p.view_count||0), 0),
      journey_steps: journey.sort((a,b) => new Date(a.date) - new Date(b.date)),
      created_at: c.created_at,
    }
  })

  return NextResponse.json({ customers: enriched, total: enriched.length })
}
