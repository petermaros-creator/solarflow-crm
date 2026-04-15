'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, MapPin, CheckCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'

const C = { navy:'#0B1929', gold:'#C9973F', cream:'#F6F0E4', creamDark:'#EDE5D2', border:'#E0D8CC', borderLight:'#EDE8E0', textSoft:'#6B7A8D', textMid:'#3A4A5C', textMuted:'#8A9BB0', white:'#FFFFFF', goldPale:'#FFF6E8' }
const F = 'Calibri, Candara, Segoe UI, sans-serif'
const STAGES = ['Permitting','Procurement','Installation','Inspection','PTO','Complete']
const MILESTONES = ['Permit Submitted','Permit Approved','Equipment Ordered','Installation Complete','Final Inspection','PTO Received']
const EMPTY = { name:'', stage:'Permitting', status:'On Track', start_date:'', target_date:'', address:'', system_size:'', value:0, progress:0, team:'', contact_id:'', deal_id:'' }

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [contacts, setContacts] = useState([])
  const [tasks, setTasks] = useState([])
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const load = useCallback(async () => {
    
    const [{ data: p }, { data: c }, { data: t }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('contacts').select('id, name'),
      supabase.from('tasks').select('*'),
    ])
    setProjects(p || []); setContacts(c || []); setTasks(t || [])
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    setLoading(true)
    
    const teamArr = form.team ? form.team.split(',').map(s => s.trim()).filter(Boolean) : []
    const payload = { ...form, user_id: '00000000-0000-0000-0000-000000000001', team: teamArr, value: parseFloat(form.value)||0, progress: parseInt(form.progress)||0 }
    if (!payload.contact_id) delete payload.contact_id
    if (!payload.deal_id) delete payload.deal_id
    delete payload.team_str
    if (form.id) await supabase.from('projects').update(payload).eq('id', form.id)
    else await supabase.from('projects').insert(payload)
    setShowModal(false); setForm(EMPTY); await load(); setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    setSelected(null); await load()
  }

  return (
    <div style={{ padding: '28px 34px', fontFamily: F }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: 0 }}>Projects</h1>
          <p style={{ color: C.textSoft, margin: '3px 0 0', fontSize: 13 }}>{projects.length} total · {projects.filter(p => p.stage !== 'Complete').length} active</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setShowModal(true) }} style={{ background: C.gold, color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', height: 36, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Plus size={13} /> New Project
        </button>
      </div>

      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14 }}>No projects yet. Create your first one.</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
        {projects.map(proj => (
          <div key={proj.id} onClick={() => setSelected(selected?.id === proj.id ? null : proj)}
            style={{ background: C.white, border: selected?.id === proj.id ? `2px solid ${C.gold}` : `1px solid ${C.border}`, borderRadius: 12, padding: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(11,25,41,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Badge label={proj.status} />
              <Badge label={proj.stage} />
            </div>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: C.navy, margin: '0 0 4px' }}>{proj.name}</h3>
            <p style={{ fontSize: 12, color: C.textSoft, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={10} /> {proj.address}
            </p>
            <div style={{ background: C.creamDark, borderRadius: 4, height: 6, marginBottom: 8 }}>
              <div style={{ background: proj.status === 'At Risk' ? '#D64B33' : C.gold, width: `${proj.progress||0}%`, height: '100%', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textSoft, marginBottom: 14 }}>
              <span>{proj.progress||0}% complete</span>
              <span style={{ fontWeight: 700, color: C.gold }}>${Math.round((proj.value||0)/1000)}K</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: `1px solid ${C.borderLight}` }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {(proj.team||[]).slice(0,4).map(m => <Avatar key={m} name={m} size={24} />)}
              </div>
              <span style={{ fontSize: 11, color: C.textSoft }}>Target: {proj.target_date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 400, background: C.white, boxShadow: '-6px 0 40px rgba(11,25,41,0.13)', zIndex: 200, overflowY: 'auto', fontFamily: F }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: `1px solid ${C.borderLight}`, position: 'sticky', top: 0, background: C.white }}>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: C.navy }}>Project Detail</span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSoft }}><X size={17} /></button>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ marginBottom: 14, display: 'flex', gap: 7 }}><Badge label={selected.status} /><Badge label={selected.stage} /></div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, margin: '0 0 3px' }}>{selected.name}</h3>
            <p style={{ fontSize: 12.5, color: C.textSoft, margin: '0 0 4px' }}>{selected.address}</p>
            <p style={{ fontSize: 12.5, color: C.textSoft, margin: '0 0 16px' }}>{selected.system_size} · Target {selected.target_date}</p>

            <div style={{ background: C.cream, borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Progress</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{selected.progress||0}%</span>
              </div>
              <div style={{ background: C.creamDark, borderRadius: 4, height: 8 }}>
                <div style={{ background: selected.status === 'At Risk' ? '#D64B33' : C.gold, width: `${selected.progress||0}%`, height: '100%', borderRadius: 4 }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Milestones</div>
              {MILESTONES.map((m, i) => {
                const done = i < Math.floor((selected.progress||0) / 17)
                return (
                  <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.borderLight}` }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? C.gold : C.creamDark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {done && <CheckCircle size={12} color="#fff" />}
                    </div>
                    <span style={{ fontSize: 12.5, color: done ? C.navy : C.textSoft, fontWeight: done ? 700 : 400 }}>{m}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Tasks ({tasks.filter(t => t.project_id === selected.id).length})
              </div>
              {tasks.filter(t => t.project_id === selected.id).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.priority === 'High' ? '#D64B33' : C.textMuted, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: C.navy, lineHeight: 1.35 }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: C.textSoft, marginTop: 1 }}>{t.assignee} · Due {t.due_date}</div>
                  </div>
                  <Badge label={t.status} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setForm({...selected, team: (selected.team||[]).join(', ')}); setShowModal(true); setSelected(null) }} style={{ flex: 1, background: C.navy, color: C.cream, border: 'none', borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => handleDelete(selected.id)} style={{ flex: 1, background: C.white, color: '#C0392B', border: '1.5px solid #F5C6C6', borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,41,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 32, width: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(11,25,41,0.3)', fontFamily: F }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>{form.id ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSoft }}><X size={18} /></button>
            </div>
            {[['Project Name*','name','text'],['Address','address','text'],['System Size','system_size','text']].map(([label,field,type]) => (
              <div key={field} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>{label}</label>
                <input type={type} value={form[field]||''} onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Stage</label>
                <select value={form.stage||'Permitting'} onChange={e => setForm(f => ({...f, stage: e.target.value}))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Status</label>
                <select value={form.status||'On Track'} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }}>
                  {['On Track','At Risk','Complete'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Start Date</label>
                <input type="date" value={form.start_date||''} onChange={e => setForm(f => ({...f, start_date: e.target.value}))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Target Date</label>
                <input type="date" value={form.target_date||''} onChange={e => setForm(f => ({...f, target_date: e.target.value}))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Value ($)</label>
                <input type="number" value={form.value||''} onChange={e => setForm(f => ({...f, value: e.target.value}))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Progress (%)</label>
                <input type="number" min="0" max="100" value={form.progress||''} onChange={e => setForm(f => ({...f, progress: e.target.value}))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Team (comma-separated)</label>
              <input type="text" value={form.team||''} onChange={e => setForm(f => ({...f, team: e.target.value}))} placeholder="Alex T., Jordan M."
                style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Contact</label>
              <select value={form.contact_id||''} onChange={e => setForm(f => ({...f, contact_id: e.target.value}))}
                style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }}>
                <option value="">— None —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: C.white, color: C.navy, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={loading || !form.name} style={{ flex: 2, background: C.gold, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading || !form.name ? 0.6 : 1 }}>
                {loading ? 'Saving…' : form.id ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
