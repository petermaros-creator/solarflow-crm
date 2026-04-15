import { NextResponse } from 'next/server'

const DIALPAD_API_KEY = process.env.DIALPAD_API_KEY
const DIALPAD_BASE = 'https://dialpad.com/api/v2'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint') || 'calls'
  const limit = searchParams.get('limit') || '50'

  if (!DIALPAD_API_KEY) {
    // Return mock data if no API key configured
    return NextResponse.json({
      items: [
        { id: 'mock-1', direction: 'inbound', duration: 245, date_started: Date.now() - 3600000, contact_name: 'Marcus Rivera', from_number: '+19495550182', to_number: '+18005551234', recording_url: null, transcription: null },
        { id: 'mock-2', direction: 'outbound', duration: 412, date_started: Date.now() - 7200000, contact_name: 'Diane Chen', from_number: '+18005551234', to_number: '+17145550247', recording_url: null, transcription: null },
        { id: 'mock-3', direction: 'inbound', duration: 89, date_started: Date.now() - 86400000, contact_name: 'Sandra Okafor', from_number: '+15625550114', to_number: '+18005551234', recording_url: null, transcription: null },
        { id: 'mock-4', direction: 'outbound', duration: 631, date_started: Date.now() - 172800000, contact_name: 'Priya Nair', from_number: '+18005551234', to_number: '+17145550663', recording_url: null, transcription: null },
        { id: 'mock-5', direction: 'missed', duration: 0, date_started: Date.now() - 259200000, contact_name: 'Unknown', from_number: '+19495559999', to_number: '+18005551234', recording_url: null, transcription: null },
      ],
      _mock: true
    })
  }

  try {
    const res = await fetch(`${DIALPAD_BASE}/${endpoint}?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${DIALPAD_API_KEY}`, 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
