'use client'
const COLORS = ['#1E3350','#C9973F','#4A6F8C','#5B3A29','#3A6B4A','#6B3A5B','#2A5B7A']
export default function Avatar({ name = '?', size = 32 }) {
  const col = COLORS[(name.charCodeAt(0) || 0) % COLORS.length]
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: col,
      color: '#F6F0E4', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
      fontFamily: 'Calibri, Candara, Segoe UI, sans-serif',
    }}>{initials}</div>
  )
}
