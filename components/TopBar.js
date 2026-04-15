'use client'
import { usePathname } from 'next/navigation'
import { Sun, ChevronRight, Bell } from 'lucide-react'
import Avatar from './ui/Avatar'

const LABELS = {
  '/dashboard':          'Dashboard',
  '/dashboard/pipeline': 'Pipeline',
  '/dashboard/contacts': 'Contacts',
  '/dashboard/projects': 'Projects',
  '/dashboard/tasks':    'Task Board',
}

export default function TopBar() {
  const pathname = usePathname()
  const label = LABELS[pathname] || 'Dashboard'
  return (
    <div style={{ background:'#fff', borderBottom:'1px solid #E0D8CC', height:50, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 34px', flexShrink:0, fontFamily:'Calibri, Candara, Segoe UI, sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:13 }}>
        <Sun size={13} color="#C9973F" />
        <span style={{ fontWeight:700, color:'#0B1929' }}>Solar Optimum</span>
        <ChevronRight size={12} color="#C9973F" />
        <span style={{ color:'#6B7A8D' }}>{label}</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <Bell size={16} color="#6B7A8D" style={{ cursor:'pointer' }} />
        <div style={{ width:1, height:18, background:'#E0D8CC' }} />
        <Avatar name="Peter M." size={30} />
      </div>
    </div>
  )
}
