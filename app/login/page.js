'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, AlertCircle } from 'lucide-react'

const C = { navy:'#0B1929', navyMid:'#1E3350', gold:'#C9973F', cream:'#F6F0E4', border:'#E0D8CC', textSoft:'#6B7A8D', white:'#FFFFFF' }

// Simple password — change this to whatever you want
const APP_PASSWORD = 'SolarOptimum2026!'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (password === APP_PASSWORD) {
      document.cookie = 'app_session=authenticated; path=/; max-age=86400'
      router.push('/dashboard')
    } else {
      setError('Incorrect password.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:C.navy, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Calibri, Candara, Segoe UI, sans-serif' }}>
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(201,151,63,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,151,63,0.04) 1px, transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }} />
      <div style={{ width:'100%', maxWidth:420, padding:'0 24px', position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <Image src="/logo.png" alt="Solar Optimum" width={140} height={140} style={{ width:140, height:'auto', margin:'0 auto 14px', display:'block' }} priority />
          <p style={{ color:'#4A6A8A', fontSize:13, marginTop:4 }}>CRM + Project Management</p>
        </div>
        <div style={{ background:'rgba(30,51,80,0.6)', border:'1px solid rgba(201,151,63,0.2)', borderRadius:16, padding:'36px 32px', backdropFilter:'blur(12px)' }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:C.cream, marginBottom:24 }}>Sign in to your account</h2>
          {error && (
            <div style={{ background:'rgba(214,75,51,0.15)', border:'1px solid rgba(214,75,51,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
              <AlertCircle size={14} color="#F08080" />
              <span style={{ fontSize:13, color:'#F08080' }}>{error}</span>
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'#4A6A8A', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:7 }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#4A6A8A', pointerEvents:'none' }} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  style={{ width:'100%', paddingLeft:36, paddingRight:14, height:42, background:'rgba(11,25,41,0.6)', border:'1px solid rgba(201,151,63,0.2)', borderRadius:8, color:C.cream, fontSize:14, boxSizing:'border-box' }} />
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width:'100%', height:44, background:loading?'#8C6B2A':C.gold, border:'none', borderRadius:8, color:'#fff', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', color:'#2A4A6A', fontSize:12, marginTop:24 }}>Solar Optimum · Residential Solar CRM</p>
      </div>
    </div>
  )
}
