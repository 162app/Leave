'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEmployee } from '@/lib/api/employees'
import { PageHeader } from '@/components/ui'

export default function NewEmployeePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', department: '', position: '',
    al_balance: 14, mc_balance: 14,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.department || !form.position) {
      setError('Please fill in all required fields'); return
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email'); return
    }
    setLoading(true); setError('')
    try {
      await createEmployee(form)
      router.push('/admin/employees')
    } catch (e: any) {
      setError(e.message?.includes('unique') ? 'This email is already registered.' : 'Failed to create employee.')
    } finally {
      setLoading(false)
    }
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
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leave Balances (days)</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px' }}>EL shares the Annual Leave pool — no separate allocation needed.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Annual Leave (AL + EL)">
              <input className="input" type="number" min="0" max="365" value={form.al_balance} onChange={e => set('al_balance', Number(e.target.value))} style={{ textAlign: 'center' }} />
            </Field>
            <Field label="Medical Leave (MC)">
              <input className="input" type="number" min="0" max="365" value={form.mc_balance} onChange={e => set('mc_balance', Number(e.target.value))} style={{ textAlign: 'center' }} />
            </Field>
          </div>
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
