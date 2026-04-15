import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'Calibri, Candara, Segoe UI, sans-serif' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <TopBar />
        <main style={{ flex:1, overflowY:'auto', background:'#F6F0E4' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
