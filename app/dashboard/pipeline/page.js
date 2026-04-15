'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, ChevronRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'

const C = { navy:'#0B1929', gold:'#C9973F', cream:'#F6F0E4', creamDark:'#EDE5D2', border:'#E0D8CC', borderLight:'#EDE8E0', textSoft:'#6B7A8D', textMid:'#3A4A5C', textMuted:'#8A9BB0', white:'#FFFFFF', goldPale:'#FFF6E8' }
const F = 'Calibri, Candara, Segoe UI, sans-serif'
const STAGES = ['Lead','Site Assessment','Proposal','Contract','Closed Won']
const EMPTY = { title:'', stage:'Lead', value:0, probability:20, close_date:'', system_size:'', notes:'', contact_id:'' }

export default function Pipeline() {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const load = useCallback(async () => {
    
    const [{ data: d }, { data: c }] = await Promise.all([
      supabase.from('deals').select('*, contacts(name)'),
      supabase.from('contacts').select('id, name'),
    ])
    setDeals(d || [])
    setContacts(c || [])
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    setLoading(true)
    
    const payload = { ...form, user_id: '00000000-0000-0000-0000-000000000001', value: parseFloat(form.value) || 0, probability: parseInt(form.probability) || 0 }
    if (!payload.contact_id) delete payload.contact_id
    if (form.id) await supabase.from('deals').update(payload).eq('id', form.id)
    else await supabase.from('deals').insert(payload)
    setShowModal(false); setForm(EMPTY); await load(); setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this deal?')) return
    await supabase.from('deals').delete().eq('id', id)
    setSelected(null); await load()
  }

  const pipelineTotal = deals.filter(d => !['Closed Lost'].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0)

  return (
    <div style={{ padding: '28px 34px', fontFamily: F }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: 0 }}>Deal Pipeline</h1>
          <p style={{ color: C.textSoft, margin: '3px 0 0', fontSize: 13 }}>
            {deals.filter(d => d.stage !== 'Closed Lost').length} active deals · ${Math.round(pipelineTotal / 1000)}K total
          </p>
        </div>
        <button onClick={() => { setForm(EMPTY); setShowModal(true) }} style={{ background: C.gold, color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', height: 36, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Plus size={13} /> New Deal
        </button>
      </div>

      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16 }}>
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage)
          const stageVal = stageDeals.reduce((s, d) => s + (d.value || 0), 0)
          return (
            <div key={stage} style={{ minWidth: 240, maxWidth: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{stage}</span>
                <span style={{ fontSize: 10.5, color: C.textMuted }}>{stageDeals.length} · ${Math.round(stageVal / 1000)}K</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {stageDeals.map(deal => (
                  <div key={deal.id} onClick={() => setSelected(deal === selected ? null : deal)}
                    style={{ background: C.white, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.gold}`, borderRadius: '0 10px 10px 0', padding: 14, cursor: 'pointer', boxShadow: '0 1px 5px rgba(11,25,41,0.05)' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 4, lineHeight: 1.35 }}>{deal.title}</div>
                    <div style={{ fontSize: 11, color: C.textSoft, marginBottom: 10 }}>{deal.system_size}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.gold }}>${Math.round((deal.value||0)/1000)}K</span>
                      <span style={{ fontSize: 10, color: C.textMuted }}>{deal.close_date}</span>
                    </div>
                    {deal.contacts?.name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.borderLight}` }}>
                        <Avatar name={deal.contacts.name} size={20} />
                        <span style={{ fontSize: 11, color: C.textMid }}>{deal.contacts.name}</span>
                      </div>
                    )}
                  </div>
                ))}
                {!stageDeals.length && (
                  <div style={{ border: `1.5px dashed ${C.creamDark}`, borderRadius: 10, padding: '18px 12px', textAlign: 'center', color: C.textMuted, fontSize: 11.5 }}>No deals</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 380, background: C.white, boxShadow: '-6px 0 40px rgba(11,25,41,0.13)', zIndex: 200, overflowY: 'auto', fontFamily: F }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: `1px solid ${C.borderLight}`, position: 'sticky', top: 0, background: C.white }}>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: C.navy }}>Deal Detail</span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSoft }}><X size={17} /></button>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ marginBottom: 12 }}><Badge label={selected.stage} /></div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.navy, margin: '0 0 2px' }}>{selected.title}</h3>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.gold, marginBottom: 20 }}>${(selected.value||0).toLocaleString()}</div>
            {[['System Size', selected.system_size], ['Close Date', selected.close_date], ['Win Probability', `${selected.probability}%`], ['Contact', selected.contacts?.name]].map(([k, v]) => v && (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.borderLight}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</span>
                <span style={{ fontSize: 13, color: C.navy, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
            {selected.notes && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Notes</div>
                <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.65, margin: 0 }}>{selected.notes}</p>
              </div>
            )}
            <div style={{ marginTop: 20, padding: '12px 16px', background: C.goldPale, borderRadius: 10, border: '1px solid #EDD5A0' }}>
              <div style={{ fontSize: 10.5, color: '#8C6200', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Weighted Value</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.gold }}>${Math.round((selected.value||0) * (selected.probability||0) / 100).toLocaleString()}</div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button onClick={() => { setForm(selected); setShowModal(true); setSelected(null) }} style={{ flex: 1, background: C.navy, color: C.cream, border: 'none', borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => handleDelete(selected.id)} style={{ flex: 1, background: C.white, color: '#C0392B', border: '1.5px solid #F5C6C6', borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,41,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 32, width: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(11,25,41,0.3)', fontFamily: F }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>{form.id ? 'Edit Deal' : 'New Deal'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSoft }}><X size={18} /></button>
            </div>
            {[['Deal Title*', 'title', 'text'], ['System Size', 'system_size', 'text'], ['Close Date', 'close_date', 'date']].map(([label, field, type]) => (
              <div key={field} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>{label}</label>
                <input type={type} value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Stage</label>
                <select value={form.stage || 'Lead'} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Win % </label>
                <input type="number" min="0" max="100" value={form.probability || ''} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Deal Value ($)</label>
              <input type="number" value={form.value || ''} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Contact</label>
              <select value={form.contact_id || ''} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))}
                style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }}>
                <option value="">— None —</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Notes</label>
              <textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 14, color: C.navy, background: '#FAFAF8', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: C.white, color: C.navy, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={loading || !form.title} style={{ flex: 2, background: C.gold, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading || !form.title ? 0.6 : 1 }}>
                {loading ? 'Saving…' : form.id ? 'Save Changes' : 'Create Deal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
