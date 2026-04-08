'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getEmployee, updateEmployee } from '@/lib/api/employees'
import { PageHeader, LoadingSpinner } from '@/components/ui'

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [form, setForm] = useState({
    name: '', email: '', department: '', position: '',
    al_balance: 14, el_balance: 5, mc_balance: 14, replacement_balance: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getEmployee(id).then(emp => {
      if (!emp) { router.replace('/admin/employees'); return }
      setForm({
        name: emp.name, email: emp.email,
        department: emp.department, position: emp.position,
        al_balance: emp.al_balance, el_balance: emp.el_balance,
        mc_balance: emp.mc_balance, replacement_balance: emp.replacement_balance,
      })
      setLoading(false)
    })
  }, [id, router])

  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!form.name || !form.email || !form.department || !form.position) {
      setError('Please fill in all required fields'); return
    }
    setSaving(true); setError('')
    try {
      await updateEmployee(id, form)
      setSaved(true)
      setTimeout(() => router.push('/admin/employees'), 1000)
    } catch (e: any) {
      setError(e.message?.includes('unique') ? 'This email is already in use.' : 'Failed to save changes.')
    } finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="pb-nav page-enter">
      <PageHeader title="Edit Employee" subtitle="Update staff details and leave balances" back={() => router.back()} />

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Full Name *">
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
        </Field>
        <Field label="Work Email *">
          <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Department *">
            <input className="input" value={form.department} onChange={e => set('department', e.target.value)} />
          </Field>
          <Field label="Position *">
            <input className="input" value={form.position} onChange={e => set('position', e.target.value)} />
          </Field>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leave Balances</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px' }}>Remaining days available for each leave type.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <BalanceField label="Annual (AL)" type="AL" value={form.al_balance} onChange={v => set('al_balance', v)} />
            <BalanceField label="Emergency/Compassionate (EL)" type="EL" value={form.el_balance} onChange={v => set('el_balance', v)} />
            <BalanceField label="Medical (MC)" type="MC" value={form.mc_balance} onChange={v => set('mc_balance', v)} />
            <BalanceField label="Replacement" type="Replacement" value={form.replacement_balance} onChange={v => set('replacement_balance', v)} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0', fontStyle: 'italic' }}>
            Tip: Use the Dashboard → Replacement Credits section to add/remove credits instead of editing manually.
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#2a0012', border: '1px solid var(--danger)', borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>⚠ {error}</p>
          </div>
        )}
        {saved && (
          <div style={{ padding: '10px 14px', background: '#002a14', border: '1px solid #003d1e', borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--success)' }}>✓ Changes saved!</p>
          </div>
        )}
        <button className="btn-primary" onClick={handleSave} disabled={saving || saved}>
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, color: 'var(--text-soft)', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

function BalanceField({ label, type, value, onChange }: { label: string; type: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, color: 'var(--text-soft)', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span className={`pill-${type}`} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, pointerEvents: 'none' }}>
          {type === 'Replacement' ? 'RL' : type}
        </span>
        <input className="input" type="number" min="0" max="365" value={value}
          onChange={e => onChange(Number(e.target.value))} style={{ textAlign: 'right', paddingLeft: 40 }} />
      </div>
    </div>
  )
}
