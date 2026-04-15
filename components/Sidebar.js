'use client'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Users, BarChart2, Briefcase, Grid, LogOut, TrendingUp, MessageSquare, Phone } from 'lucide-react'
import Image from 'next/image'
import Avatar from './ui/Avatar'

const NAV = [
  { href:'/dashboard',          label:'Dashboard',    Icon:Home },
  { href:'/dashboard/pipeline', label:'Pipeline',     Icon:BarChart2 },
  { href:'/dashboard/contacts', label:'Contacts',     Icon:Users },
  { href:'/dashboard/projects', label:'Projects',     Icon:Briefcase },
  { href:'/dashboard/tasks',    label:'Task Board',   Icon:Grid },
]

const NAV2 = [
  { href:'/dashboard/metrics',  label:'Acquisition',  Icon:TrendingUp },
  { href:'/dashboard/calls',    label:'Call Log',     Icon:Phone },
  { href:'/dashboard/messages', label:'Messages',     Icon:MessageSquare },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleSignOut() {
    document.cookie = 'app_session=; path=/; max-age=0'
    router.push('/login')
  }

  const NavBtn = ({ href, label, Icon }) => {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <button onClick={() => router.push(href)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:10,
        padding:'9px 12px', borderRadius:8, border:'none', cursor:'pointer',
        background: active ? 'rgba(201,151,63,0.15)' : 'transparent',
        color: active ? '#C9973F' : '#6A8BAA',
        fontSize:13, fontWeight: active ? 700 : 400, marginBottom:2, textAlign:'left',
        borderLeft:`2.5px solid ${active ? '#C9973F' : 'transparent'}`,
        fontFamily:'Calibri, Candara, Segoe UI, sans-serif',
      }}>
        <Icon size={15} /> {label}
      </button>
    )
  }

  return (
    <div style={{ width:220, background:'#0B1929', display:'flex', flexDirection:'column', flexShrink:0, height:'100vh', fontFamily:'Calibri, Candara, Segoe UI, sans-serif' }}>
      <div style={{ padding:'18px 18px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <Image src="/logo.png" alt="Solar Optimum" width={160} height={160} style={{ width:'100%', maxWidth:160, height:'auto', display:'block', margin:'0 auto' }} priority />
      </div>
      <nav style={{ flex:1, padding:'14px 10px', overflowY:'auto' }}>
        <div style={{ fontSize:9.5, fontWeight:700, color:'#3A5570', letterSpacing:'0.13em', padding:'0 10px', marginBottom:8, textTransform:'uppercase' }}>CRM</div>
        {NAV.map(n => <NavBtn key={n.href} {...n} />)}
        <div style={{ fontSize:9.5, fontWeight:700, color:'#3A5570', letterSpacing:'0.13em', padding:'12px 10px 8px', textTransform:'uppercase' }}>Intelligence</div>
        {NAV2.map(n => <NavBtn key={n.href} {...n} />)}
      </nav>
      <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:10 }}>
        <Avatar name="Peter M." size={30} />
        <div style={{ flex:1 }}>
          <div style={{ color:'#F6F0E4', fontSize:12.5, fontWeight:700 }}>Peter M.</div>
          <div style={{ color:'#3A5570', fontSize:10.5 }}>Admin</div>
        </div>
        <button onClick={handleSignOut} title="Sign out" style={{ background:'none', border:'none', cursor:'pointer', color:'#3A5570', padding:2 }}>
          <LogOut size={14} />
        </button>
      </div>
    </div>
  )
}
