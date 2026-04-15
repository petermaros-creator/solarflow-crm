import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Fired by the proposal builder when a customer opens their proposal
// GET /api/proposals/:id/view?source=email|link|direct
export async function GET(request, { params }) {
  const { id } = params
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source') || 'direct'

  const supabase = createClient()

  // Increment view count and update last_viewed_at
  const { data: proposal } = await supabase
    .from('proposals')
    .select('id, view_count, status, contact_id, deal_id')
    .eq('id', id)
    .single()

  if (proposal) {
    await supabase.from('proposals').update({
      view_count: (proposal.view_count || 0) + 1,
      last_viewed_at: new Date().toISOString(),
      status: proposal.status === 'sent' ? 'viewed' : proposal.status,
    }).eq('id', id)

    // Log activity on the contact
    if (proposal.contact_id) {
      await supabase.from('activities').insert({
        contact_id: proposal.contact_id,
        type: 'note',
        note: `Customer viewed proposal (source: ${source})`,
      })
    }
  }

  // Return 1x1 transparent GIF for pixel tracking (works in emails too)
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
  return new NextResponse(gif, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    }
  })
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET' }
  })
}
