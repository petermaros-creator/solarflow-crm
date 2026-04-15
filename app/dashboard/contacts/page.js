'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, ChevronRight, X, Mail, Phone, MapPin } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'

const C = { navy:'#0B1929', gold:'#C9973F', cream:'#F6F0E4', creamDark:'#EDE5D2', border:'#E0D8CC', borderLight:'#EDE8E0', textSoft:'#6B7A8D', textMid:'#3A4A5C', textMuted:'#8A9BB0', white:'#FFFFFF', goldPale:'#FFF6E8' }
const F = 'Calibri, Candara, Segoe UI, sans-serif'

const EMPTY = { name:'', email:'', phone:'', address:'', company:'', role:'Homeowner', status:'Lead', value:0, notes:'' }

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [billFile, setBillFile] = useState(null)

  async function uploadBill(file, contactId) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${contactId || Date.now()}/bill.${ext}`
    const { data, error } = await supabase.storage.from('utility-bills').upload(path, file, { upsert: true })
    if (!error) {
      const { data: urlData } = supabase.storage.from('utility-bills').getPublicUrl(path)
      setUploading(false)
      return urlData.publicUrl
    }
    setUploading(false)
    return null
  }
  const supabase = createClient()

  const load = useCallback(async () => {
    
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
    setContacts(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSave() {
    setLoading(true)
    let billUrl = form.utility_bill_url
    if (billFile) {
      const tempId = form.id || Date.now().toString()
      billUrl = await uploadBill(billFile, tempId) || billUrl
    }
    const payload = { ...form, utility_bill_url: billUrl, user_id: '00000000-0000-0000-0000-000000000001' }
    if (form.id) {
      await supabase.from('contacts').update(payload).eq('id', form.id)
    } else {
      await supabase.from('contacts').insert(payload)
    }
    setBillFile(null)
    setShowModal(false)
    setForm(EMPTY)
    await load()
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this contact?')) return
    await supabase.from('contacts').delete().eq('id', id)
    setSelected(null)
    await load()
  }

  function openNew() { setForm(EMPTY); setShowModal(true) }
  function openEdit(c) { setForm(c); setShowModal(true); setSelected(null) }

  return (
    <div style={{ padding: '28px 34px', fontFamily: F }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: 0 }}>Contacts</h1>
          <p style={{ color: C.textSoft, margin: '3px 0 0', fontSize: 13 }}>{contacts.length} contacts</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…"
              style={{ paddingLeft: 30, paddingRight: 12, height: 36, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.navy, background: C.white, width: 200 }} />
          </div>
          <button onClick={openNew} style={{ background: C.gold, color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', height: 36, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Plus size={13} /> Add Contact
          </button>
        </div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(11,25,41,0.05)' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMuted, fontSize: 14 }}>
            {search ? 'No contacts match your search.' : 'No contacts yet. Add your first one.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.cream, borderBottom: `1px solid ${C.border}` }}>
                {['Contact', 'Company', 'Role', 'Status', 'Deal Value', 'Last Contact', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  style={{ borderBottom: `1px solid ${C.borderLight}`, cursor: 'pointer', background: selected?.id === c.id ? C.goldPale : 'transparent' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={c.name} size={32} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: C.textSoft }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textMid }}>{c.company}</td>
                  <td style={{ padding: '12px 16px' }}><Badge label={c.role || 'Homeowner'} /></td>
                  <td style={{ padding: '12px 16px' }}><Badge label={c.status || 'Lead'} /></td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.gold }}>${Math.round((c.value||0)/1000)}K</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: C.textSoft }}>
                    {c.last_contact ? new Date(c.last_contact).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}><ChevronRight size={13} color={C.gold} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 380, background: C.white, boxShadow: '-6px 0 40px rgba(11,25,41,0.13)', zIndex: 200, overflowY: 'auto', fontFamily: F }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: `1px solid ${C.borderLight}`, position: 'sticky', top: 0, background: C.white }}>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: C.navy }}>Contact Detail</span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSoft }}><X size={17} /></button>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 22, paddingBottom: 20, borderBottom: `1px solid ${C.borderLight}` }}>
              <Avatar name={selected.name} size={68} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: '12px 0 2px' }}>{selected.name}</h3>
              <p style={{ color: C.textSoft, fontSize: 13, margin: '0 0 10px' }}>{selected.role} · {selected.company}</p>
              <Badge label={selected.status} />
            </div>
            {[[<Mail size={13} />, selected.email], [<Phone size={13} />, selected.phone], [<MapPin size={13} />, selected.address]].map(([icon, val], i) => val && (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${C.borderLight}`, fontSize: 13, color: C.textMid, alignItems: 'flex-start' }}>
                <span style={{ color: C.gold, marginTop: 1, flexShrink: 0 }}>{icon}</span>
                <span style={{ lineHeight: 1.45 }}>{val}</span>
              </div>
            ))}
            {selected.notes && (
              <div style={{ marginTop: 16, paddingBottom: 16, borderBottom: `1px solid ${C.borderLight}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Notes</div>
                <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, margin: 0 }}>{selected.notes}</p>
              </div>
            )}
            <div style={{ marginTop: 18, padding: '14px 16px', background: C.cream, borderRadius: 10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Deal Value</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.gold }}>${(selected.value||0).toLocaleString()}</div>
            </div>
            {selected.utility_bill_url && (
              <div style={{ marginTop: 16, padding: '12px 14px', background: C.goldPale, borderRadius: 8, border: '1px solid #EDD5A0' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8C6200', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Utility Bill on File</div>
                <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>
                  {selected.utility && <span>{selected.utility} · </span>}
                  {selected.monthly_kwh && <span>{selected.monthly_kwh} kWh/mo · </span>}
                  {selected.avg_bill && <span>${selected.avg_bill}/mo avg</span>}
                </div>
                <a href={selected.utility_bill_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.gold, fontWeight: 700, textDecoration: 'none' }}>View Bill ↗</a>
              </div>
            )}
            <a
              href={(() => {
                const p = new URLSearchParams()
                const parts = (selected.name || '').split(' ')
                p.set('firstName', parts[0] || '')
                p.set('lastName', parts.slice(1).join(' ') || '')
                if (selected.email) p.set('email', selected.email)
                if (selected.phone) p.set('phone', (selected.phone || '').replace(/\D/g,''))
                if (selected.address) {
                  const addr = selected.address.split(',')
                  p.set('address', addr[0]?.trim() || '')
                  p.set('city', addr[1]?.trim() || '')
                  const sp = (addr[2] || '').trim().split(' ')
                  p.set('state', sp[0] || 'CA')
                  p.set('zip', sp[1] || '')
                }
                if (selected.utility) p.set('utility', selected.utility)
                if (selected.monthly_kwh) p.set('monthlyKwh', selected.monthly_kwh)
                if (selected.avg_bill) p.set('avgBill', selected.avg_bill)
                if (selected.current_rate) p.set('currentRate', selected.current_rate)
                if (selected.roof_type) p.set('roofType', selected.roof_type)
                p.set('crm_contact_id', selected.id)
                return 'https://sos1-proposal-experience.onrender.com/?' + p.toString()
              })()}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14, marginBottom: 10, background: C.gold, color: '#fff', borderRadius: 8, padding: '11px 0', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: F }}
            >
              ⚡ {selected.utility_bill_url ? 'Create Proposal from Utility Bill' : 'Add Proposal'}
            </a>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openEdit(selected)} style={{ flex: 1, background: C.navy, color: C.cream, border: 'none', borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => handleDelete(selected.id)} style={{ flex: 1, background: C.white, color: '#C0392B', border: `1.5px solid #F5C6C6`, borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,41,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 32, width: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(11,25,41,0.3)', fontFamily: F }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: 0 }}>{form.id ? 'Edit Contact' : 'New Contact'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSoft }}><X size={18} /></button>
            </div>
            {[['Name*', 'name', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel'], ['Address', 'address', 'text'], ['Company', 'company', 'text']].map(([label, field, type]) => (
              <div key={field} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>{label}</label>
                <input type={type} value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Role</label>
                <select value={form.role || 'Homeowner'} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }}>
                  {['Homeowner','Property Manager','Developer','Contractor'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Status</label>
                <select value={form.status || 'Lead'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }}>
                  {['Lead','Active','Complete'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Deal Value ($)</label>
              <input type="number" value={form.value || ''} onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 14, color: C.navy, background: '#FAFAF8' }} />
            </div>
            {/* Utility Info Section */}
            <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>⚡ Utility & Solar Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Utility Provider</label>
                  <select value={form.utility || ''} onChange={e => setForm(f => ({ ...f, utility: e.target.value }))}
                    style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 13, color: C.navy, background: '#FAFAF8' }}>
                    <option value="">Select…</option>
                    {['SCE','LADWP','PG&E','SDG&E','NV Energy','APS','SRP','Other'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Roof Type</label>
                  <select value={form.roof_type || ''} onChange={e => setForm(f => ({ ...f, roof_type: e.target.value }))}
                    style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 13, color: C.navy, background: '#FAFAF8' }}>
                    <option value="">Select…</option>
                    {['Comp Shingle','Clay/Concrete Tile','Metal','Flat/TPO'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[['Monthly kWh', 'monthly_kwh', '1200'], ['Avg Bill ($)', 'avg_bill', '480'], ['Rate ($/kWh)', 'current_rate', '0.3949']].map(([label, field, ph]) => (
                  <div key={field}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>{label}</label>
                    <input type="number" value={form[field] || ''} placeholder={ph} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      style={{ width: '100%', height: 38, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 10px', fontSize: 13, color: C.navy, background: '#FAFAF8', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>Upload Utility Bill</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: `1.5px dashed ${billFile ? C.gold : C.border}`, borderRadius: 8, cursor: 'pointer', background: billFile ? C.goldPale : '#FAFAF8' }}>
                  <Upload size={15} color={billFile ? C.gold : C.textMuted} />
                  <span style={{ fontSize: 13, color: billFile ? C.gold : C.textMuted, fontWeight: billFile ? 700 : 400 }}>
                    {uploading ? 'Uploading…' : billFile ? billFile.name : 'PDF, PNG, or JPG — click to upload'}
                  </span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setBillFile(e.target.files[0])} style={{ display: 'none' }} />
                </label>
                {form.utility_bill_url && !billFile && (
                  <div style={{ fontSize: 11, color: C.textSoft, marginTop: 5 }}>
                    Bill on file — <a href={form.utility_bill_url} target="_blank" rel="noreferrer" style={{ color: C.gold, fontWeight: 700 }}>view existing ↗</a>
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Notes</label>
              <textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 14, color: C.navy, background: '#FAFAF8', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: C.white, color: C.navy, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={loading || !form.name} style={{ flex: 2, background: C.gold, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading || !form.name ? 0.6 : 1 }}>
                {loading ? 'Saving…' : form.id ? 'Save Changes' : 'Create Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
