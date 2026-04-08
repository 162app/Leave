'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getEmployees } from '@/lib/api/employees'
import { getReplacementCredits, addReplacementCredit, deleteReplacementCredit } from '@/lib/api/replacements'
import { Employee, ReplacementCredit } from '@/lib/types'
import { EmptyState, LoadingSpinner, SectionHeader } from '@/components/ui'
import { formatDate } from '@/lib/utils'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [credits, setCredits] = useState<ReplacementCredit[]>([])
  const [loading, setLoading] = useState(true)

  // Add credit form state
  const [showCreditForm, setShowCreditForm] = useState(false)
  const [creditForm, setCreditForm] = useState({
    employee_id: '', work_date: '', public_holiday: '', days_credited: 1, note: ''
  })
  const [creditLoading, setCreditLoading] = useState(false)
  const [creditError, setCreditError] = useState('')

  const load = async () => {
    const [e, c] = await Promise.all([getEmployees(), getReplacementCredits()])
    setEmployees(e); setCredits(c)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAddCredit = async () => {
    if (!creditForm.employee_id || !creditForm.work_date || !creditForm.public_holiday) {
      setCreditError('Please fill in all required fields'); return
    }
    setCreditLoading(true); setCreditError('')
    try {
      await addReplacementCredit({ ...creditForm, note: creditForm.note || undefined })
      setShowCreditForm(false)
      setCreditForm({ employee_id: '', work_date: '', public_holiday: '', days_credited: 1, note: '' })
      load()
    } catch (e: any) {
      setCreditError(e.message || 'Failed to add credit')
    } finally { setCreditLoading(false) }
  }

  const handleDeleteCredit = async (id: string) => {
    if (!confirm('Remove this replacement credit? Balance will be deducted.')) return
    await deleteReplacementCredit(id)
    load()
  }

  return (
    <div className="pb-nav page-enter">
      {/* Top bar */}
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 2px' }}>Admin Panel</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', margin: 0 }}>Dashboard ⚙️</h1>
        </div>
        <button onClick={() => { logout(); router.push('/') }}
          style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Sign out
        </button>
      </div>

      {/* Replacement Credits */}
      <div style={{ padding: '24px 20px 0' }}>
        <SectionHeader title="Replacement Credits"
          action={
            <button onClick={() => setShowCreditForm(v => !v)}
              style={{ background: showCreditForm ? 'var(--bg-card2)' : 'var(--accent)', border: 'none', borderRadius: 10, padding: '7px 14px', color: showCreditForm ? 'var(--text-muted)' : '#111', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {showCreditForm ? 'Cancel' : '+ Add Credit'}
            </button>
          }
        />

        {showCreditForm && (
          <div className="card" style={{ padding: 16, marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 12px', color: 'var(--text-soft)' }}>New Replacement Credit</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>Employee *</label>
                <select className="input" value={creditForm.employee_id} onChange={e => setCreditForm(f => ({ ...f, employee_id: e.target.value }))}>
                  <option value="">Select employee…</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>Date Worked *</label>
                  <input className="input" type="date" value={creditForm.work_date}
                    onChange={e => setCreditForm(f => ({ ...f, work_date: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>Days *</label>
                  <input className="input" type="number" min="0.5" max="2" step="0.5" value={creditForm.days_credited}
                    onChange={e => setCreditForm(f => ({ ...f, days_credited: Number(e.target.value) }))}
                    style={{ textAlign: 'center' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>Public Holiday Name *</label>
                <input className="input" placeholder="e.g. Hari Raya Aidilfitri"
                  value={creditForm.public_holiday}
                  onChange={e => setCreditForm(f => ({ ...f, public_holiday: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>Note (optional)</label>
                <input className="input" placeholder="e.g. Morning shift only"
                  value={creditForm.note}
                  onChange={e => setCreditForm(f => ({ ...f, note: e.target.value }))} />
              </div>
              {creditError && <p style={{ fontSize: 12, color: 'var(--danger)', margin: 0 }}>⚠ {creditError}</p>}
              <button className="btn-primary" onClick={handleAddCredit} disabled={creditLoading}>
                {creditLoading ? 'Adding…' : 'Add Credit & Update Balance'}
              </button>
            </div>
          </div>
        )}

        {loading ? <LoadingSpinner /> : credits.length === 0 ? (
          <EmptyState icon="🔄" title="No replacement credits" subtitle="Add a credit when staff works on a public holiday" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {credits.map(credit => (
              <div key={credit.id} className="card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>+{credit.days_credited}d</span>
                    <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {credit.employee?.name}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    {credit.public_holiday} · {formatDate(credit.work_date)}
                  </p>
                  {credit.note && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', fontStyle: 'italic' }}>{credit.note}</p>}
                </div>
                <button onClick={() => handleDeleteCredit(credit.id)}
                  style={{ background: 'transparent', border: '1px solid var(--danger)', borderRadius: 8, padding: '5px 10px', color: 'var(--danger)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
