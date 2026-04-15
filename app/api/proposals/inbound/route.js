import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This endpoint receives completed proposals from the Proposal Builder
// Configure webhook URL in Proposal Builder as:
// process.env.NEXT_PUBLIC_CRM_WEBHOOK_URL or the deployed URL + /api/proposals/inbound

export async function POST(request) {
  try {
    const body = await request.json()
    const supabase = createClient()

    const {
      crm_contact_id,
      crm_deal_id,
      customer,
      proposal,
      generated_at,
      proposal_url,
    } = body

    const { data, error } = await supabase.from('proposals').insert({
      contact_id:       crm_contact_id || null,
      deal_id:          crm_deal_id || null,
      customer_name:    `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
      customer_email:   customer?.email,
      customer_phone:   customer?.phone,
      customer_address: customer?.address,
      system_size:      proposal?.systemSize,
      total_price:      proposal?.totalPrice,
      monthly_payment:  proposal?.monthlyPayment,
      utility:          proposal?.utility || customer?.utility,
      inverter:         proposal?.inverter,
      battery:          proposal?.battery,
      roof_type:        proposal?.roofType,
      credit_tier:      proposal?.creditTier,
      monthly_kwh:      proposal?.monthlyKwh,
      proposal_url:     proposal_url || null,
      raw_data:         body,
      status:           'sent',
      generated_at:     generated_at || new Date().toISOString(),
    })

    if (error) throw error

    // Auto-update deal stage to Proposal if it was Lead/Site Assessment
    if (crm_deal_id) {
      await supabase.from('deals')
        .update({ stage: 'Proposal', updated_at: new Date().toISOString() })
        .eq('id', crm_deal_id)
        .in('stage', ['Lead', 'Site Assessment'])
    }

    return NextResponse.json({ ok: true, id: data?.[0]?.id })
  } catch (err) {
    console.error('Proposal webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Allow CORS from proposal builder
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://sos1-proposal-experience.onrender.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
