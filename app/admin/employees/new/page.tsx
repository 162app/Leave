'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEmployee } from '@/lib/api/employees'
import { PageHeader } from '@/components/ui'

export default function NewEmployeePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', department: '', position: '',
    al_balance: 14, el_balance: 5, mc_balance: 14, replacement_balance: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.department || !form.position) {
      setError('Please fill in all required fields'); return
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Enter a valid email'); return }
    setLoading(true); setError('')
    try {
      await createEmployee(form)
      router.push('/admin/employees')
    } catch (e: any) {
      setError(e.message?.includes('unique') ? 'This email is already registered.' : 'Failed to create employee.')
    } finally { setLoading(false) }
  }

  return (
    <div className="pb-nav page-enter">
      <PageHeader title="Add Employee" subtitle="Create a new staff account" back={() => router.back()} />

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Full Name *">
          <input className="input" placeholder="e.g. Ahmad Razif" value={form.name} onChange={e => set('name', e.target.value)} />
        </Field>
        <Field label="Work Email *">
          <input className="input" type="email" placeholder="e.g. ahmad@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Department *">
            <input className="input" placeholder="e.g. Engineering" value={form.department} onChange={e => set('department', e.target.value)} />
          </Field>
          <Field label="Position *">
            <input className="input" placeholder="e.g. Developer" value={form.position} onChange={e => set('position', e.target.value)} />
          </Field>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leave Balances (days)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <BalanceField label="Annual (AL)" type="AL" value={form.al_balance} onChange={v => set('al_balance', v)} />
            <BalanceField label="Emergency/Compassionate (EL)" type="EL" value={form.el_balance} onChange={v => set('el_balance', v)} />
            <BalanceField label="Medical (MC)" type="MC" value={form.mc_balance} onChange={v => set('mc_balance', v)} />
            <BalanceField label="Replacement" type="Replacement" value={form.replacement_balance} onChange={v => set('replacement_balance', v)} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0', fontStyle: 'italic' }}>Replacement balance is usually 0 — credited by admin when staff works on public holidays.</p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#2a0012', border: '1px solid var(--danger)', borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>⚠ {error}</p>
          </div>
        )}
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating…' : 'Create Employee'}
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
