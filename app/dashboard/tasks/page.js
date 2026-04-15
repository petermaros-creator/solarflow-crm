'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'

const C = { navy:'#0B1929', gold:'#C9973F', cream:'#F6F0E4', creamDark:'#EDE5D2', border:'#E0D8CC', borderLight:'#EDE8E0', textSoft:'#6B7A8D', textMid:'#3A4A5C', textMuted:'#8A9BB0', white:'#FFFFFF' }
const F = 'Calibri, Candara, Segoe UI, sans-serif'
const COLS = ['Todo','In Progress','Done']
const EMPTY = { title:'', assignee:'', status:'Todo', priority:'Medium', due_date:'', project_id:'' }

export default function TaskBoard() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const load = useCallback(async () => {
    
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('id, name'),
    ])
    setTasks(t || []); setProjects(p || [])
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    setLoading(true)
    
    const payload = { ...form, user_id: '00000000-0000-0000-0000-000000000001' }
    if (!payload.project_id) delete payload.project_id
    if (form.id) await supabase.from('tasks').update(payload).eq('id', form.id)
    else await supabase.from('tasks').insert(payload)
    setShowModal(false); setForm(EMPTY); await load(); setLoading(false)
  }

  async function handleStatusChange(task, newStatus) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    setTasks(ts => ts.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
  }

  async function handleDelete(id) {
    await supabase.from('tasks').delete().eq('id', id)
    await load()
  }

  const filtered = activeProject === 'all' ? tasks : tasks.filter(t => t.project_id === activeProject)

  return (
    <div style={{ padding: '28px 34px', fontFamily: F }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: 0 }}>Task Board</h1>
          <p style={{ color: C.textSoft, margin: '3px 0 0', fontSize: 13 }}>{filtered.filter(t => t.status !== 'Done').length} open tasks</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setShowModal(true) }} style={{ background: C.gold, color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', height: 36, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Plus size={13} /> Add Task
        </button>
      </div>

      {/* Project filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveProject('all')} style={{
          padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F,
          border: `1.5px solid ${activeProject === 'all' ? C.gold : C.border}`,
          background: activeProject === 'all' ? '#FFF6E8' : C.white,
          color: activeProject === 'all' ? C.gold : C.textMid,
        }}>All Projects</button>
        {projects.map(p => (
          <button key={p.id} onClick={() => setActiveProject(p.id)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F,
            border: `1.5px solid ${activeProject === p.id ? C.gold : C.border}`,
            background: activeProject === p.id ? '#FFF6E8' : C.white,
            color: activeProject === p.id ? C.gold : C.textMid,
          }}>{p.name}</button>
        ))}
      </div>

      {/* Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {COLS.map(col => {
          const colTasks = filtered.filter(t => t.status === col)
          const colColor = col === 'Done' ? '#1A6B35' : col === 'In Progress' ? '#8C5A00' : C.textMid
          const colBorder = col === 'Done' ? '#DFF2E4' : col === 'In Progress' ? '#FFF4E0' : C.creamDark
          return (
            <div key={col}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${colBorder}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: colColor }}>{col}</span>
                <span style={{ fontSize: 10.5, background: C.creamDark, color: C.textMid, borderRadius: 10, padding: '1px 8px', fontWeight: 700 }}>{colTasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {colTasks.map(task => {
                  const proj = projects.find(p => p.id === task.project_id)
                  return (
                    <div key={task.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderLeft: `3px solid ${task.priority === 'High' ? '#D64B33' : task.priority === 'Medium' ? C.gold : C.creamDark}`, borderRadius: '0 10px 10px 0', padding: 14, boxShadow: '0 1px 4px rgba(11,25,41,0.04)' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6, lineHeight: 1.35 }}>{task.title}</div>
                      {proj && <div style={{ fontSize: 10.5, color: C.gold, fontWeight: 700, marginBottom: 8 }}>{proj.name}</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {task.assignee && <><Avatar name={task.assignee} size={22} /><span style={{ fontSize: 11, color: C.textSoft }}>{task.assignee}</span></>}
                        </div>
                        {task.due_date && <span style={{ fontSize: 10.5, color: C.textMuted }}>Due {task.due_date}</span>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Badge label={task.priority} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          {COLS.filter(c => c !== col).map(c => (
                            <button key={c} onClick={() => handleStatusChange(task, c)}
                              style={{ fontSize: 10, color: C.textMuted, background: C.cream, border: 'none', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', fontFamily: F }}>
                              → {c}
                            </button>
                          ))}
                          <button onClick={() => { setForm(task); setShowModal(true) }}
                            style={{ fontSize: 10, color: C.textMuted, background: C.cream, border: 'none', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', fontFamily: F }}>Edit</button>
                          <button onClick={() => handleDelete(task.id)}
                            style={{ fontSize: 10, color: '#C0392B', background: '#FFF0F0', border: 'none', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', fontFamily: F }}>×</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {!colTasks.length && (
                  <div style={{ border: `1.5px dashed ${C.creamDark}`, borderRadius: 10, padding: '22px 12px', textAlign: 'center', color: C.textMuted, fontSize: 11.5 }}>No tasks</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,41,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 32, width: 440, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(11,25,41,0.3)', fontFamily: F }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>{form.id ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSoft }}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Task Title*</label>
              <input value={form.title||''} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Assignee</label>
              <input value={form.assignee||''} onChange={e => setForm(f => ({...f, assignee: e.target.value}))} placeholder="Team member name"
                style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Status</label>
                <select value={form.status||'Todo'} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }}>
                  {COLS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Priority</label>
                <select value={form.priority||'Medium'} onChange={e => setForm(f => ({...f, priority: e.target.value}))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }}>
                  {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Due Date</label>
              <input type="date" value={form.due_date||''} onChange={e => setForm(f => ({...f, due_date: e.target.value}))}
                style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Project</label>
              <select value={form.project_id||''} onChange={e => setForm(f => ({...f, project_id: e.target.value}))}
                style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }}>
                <option value="">— None —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: C.white, color: C.navy, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={loading || !form.title} style={{ flex: 2, background: C.gold, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading || !form.title ? 0.6 : 1 }}>
                {loading ? 'Saving…' : form.id ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
