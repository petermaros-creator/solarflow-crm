'use client'
const STYLES = {
  'Lead':            { bg: '#E8EDF5', color: '#2952A3' },
  'Site Assessment': { bg: '#EBF0FF', color: '#2952A3' },
  'Proposal':        { bg: '#FFF4E0', color: '#8C6200' },
  'Contract':        { bg: '#FFE8C0', color: '#7A4A00' },
  'Closed Won':      { bg: '#DFF2E4', color: '#1A6B35' },
  'Closed Lost':     { bg: '#FAE0E0', color: '#8C2020' },
  'Permitting':      { bg: '#FFF8E0', color: '#7A5A00' },
  'Procurement':     { bg: '#E8F5FF', color: '#0A5080' },
  'Installation':    { bg: '#E8F5E9', color: '#2E7D32' },
  'Inspection':      { bg: '#FFF3E0', color: '#7A4A00' },
  'PTO':             { bg: '#E8F5E9', color: '#1B5E20' },
  'Complete':        { bg: '#DFF2E4', color: '#1A6B35' },
  'On Track':        { bg: '#DFF2E4', color: '#1A6B35' },
  'At Risk':         { bg: '#FFEDE8', color: '#9C3010' },
  'In Progress':     { bg: '#FFF4E0', color: '#8C5A00' },
  'Todo':            { bg: '#EEF0F4', color: '#4A5568' },
  'Done':            { bg: '#DFF2E4', color: '#1A6B35' },
  'Active':          { bg: '#E0F0FF', color: '#0A4F8C' },
  'High':            { bg: '#FFEDE8', color: '#9C3010' },
  'Medium':          { bg: '#FFF4E0', color: '#8C5A00' },
  'Low':             { bg: '#EEF0F4', color: '#4A5568' },
  'HOA':             { bg: '#EBF0FF', color: '#2952A3' },
  'Battery Storage': { bg: '#E8F5FF', color: '#0A5080' },
  'High Priority':   { bg: '#FFEDE8', color: '#9C3010' },
  'Multi-Property':  { bg: '#FFF4E0', color: '#8C5A00' },
  'Referral':        { bg: '#DFF2E4', color: '#1A6B35' },
  'EV Charger':      { bg: '#E8F5E9', color: '#2E7D32' },
  'Homeowner':       { bg: '#F6F0E4', color: '#6B4A00' },
  'Property Manager':{ bg: '#EBF0FF', color: '#2952A3' },
}

export default function Badge({ label }) {
  const s = STYLES[label] || { bg: '#EEF0F4', color: '#4A5568' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 9px', borderRadius: 20,
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
      display: 'inline-block', whiteSpace: 'nowrap',
      textTransform: 'uppercase',
      fontFamily: 'Calibri, Candara, Segoe UI, sans-serif',
    }}>{label}</span>
  )
}
