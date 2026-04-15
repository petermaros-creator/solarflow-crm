import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const supabase = createClient()

    // Dialpad webhook event types: call_started, call_ended, recording_ready
    if (body.event === 'call_ended' || body.event === 'call_started') {
      const call = body.data
      await supabase.from('calls').upsert({
        dialpad_call_id: call.call_id,
        direction: call.direction || 'inbound',
        status: call.status || 'completed',
        from_number: call.from_number,
        to_number: call.to_number,
        duration_seconds: call.duration || 0,
        recording_url: call.recording_url || null,
      }, { onConflict: 'dialpad_call_id' })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
