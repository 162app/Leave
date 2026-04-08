'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createLeaveRequest } from '@/lib/api/leave'
import { LeaveType, LEAVE_LABELS } from '@/lib/types'
import { countWorkingDays, todayISO } from '@/lib/utils'
import { PageHeader } from '@/components/ui'

const LEAVE_TYPES: LeaveType[] = ['AL', 'EL', 'MC', 'Others']

export default function ApplyLeavePage() {
  const { employee } = useAuth()
  const router = useRouter()

  const [leaveType, setLeaveType] = useState<LeaveType>('AL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const today = todayISO()
  const workingDays = startDate && endDate ? countWorkingDays(startDate, endDate) : 0

  /**
   * EL shares the AL pool — show AL balance for both.
   * MC has its own pool. Others has no balance check.
   */
  const getBalance = (): number | null => {
    if (!employee) return null
    if (leaveType === 'AL' || leaveType === 'EL') return employee.al_balance
    if (leaveType === 'MC') return employee.mc_balance
    return null // Others — no limit
  }

  const balance = getBalance()
  const balanceWarning = balance !== null && workingDays > balance

  const handleSubmit = async () => {
    if (!employee) return
    if (!startDate || !endDate) { setError('Please select start and end dates'); return }
    if (endDate < startDate) { setError('End date must be after start date'); return }
    if (workingDays === 0) { setError('No working days in selected range'); return }
    if (balanceWarning) { setError(`Insufficient ${leaveType === 'EL' ? 'Annual (AL)' : leaveType} leave balance`); return }

    setLoading(true); setError('')
    try {
      await createLeaveRequest({
        employee_id: employee.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        days_count: workingDays,
        reason: reason.trim() || null,
        attachment_url: null,
      })
      setSuccess(true)
    } catch (e: any) {
      setError(e.message || 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Request Submitted!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Your leave request is pending approval from admin.</p>
        <button className="btn-primary" style={{ maxWidth: 280, margin: '0 auto' }} onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="pb-nav page-enter">
      <PageHeader title="Apply Leave" subtitle="Submit a new leave request" />

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Leave type selector */}
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-soft)', marginBottom: 8, fontWeight: 500 }}>Leave Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {LEAVE_TYPES.map((type) => {
              // Balance shown on the card
              const cardBalance = type === 'AL' || type === 'EL'
                ? employee?.al_balance
                : type === 'MC'
                ? employee?.mc_balance
                : null

              const isSelected = leaveType === type

              return (
                <button key={type} onClick={() => setLeaveType(type)}
                  style={{
                    padding: '12px 10px', borderRadius: 12, border: '1.5px solid',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    background: isSelected ? 'rgba(215,223,35,0.08)' : 'var(--bg-card)',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  }}>
                  <span className={`pill-${type}`} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{type}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '6px 0 0' }}>{LEAVE_LABELS[type]}</p>
                  {cardBalance !== null && cardBalance !== undefined ? (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {cardBalance} days left
                      {type === 'EL' && <span style={{ fontStyle: 'italic' }}> (from AL)</span>}
                    </p>
                  ) : (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', fontStyle: 'italic' }}>No balance limit</p>
                  )}
                </button>
              )
            })}
          </div>

          {/* EL info banner */}
          {leaveType === 'EL' && (
            <div style={{ marginTop: 10, padding: '9px 13px', background: 'rgba(215,223,35,0.07)', border: '1px solid rgba(215,223,35,0.25)', borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-soft)' }}>
                💡 Emergency Leave is deducted from your <strong>Annual Leave (AL)</strong> balance. No separate EL allocation.
              </p>
            </div>
          )}
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-soft)', marginBottom: 6, fontWeight: 500 }}>Start Date</label>
            <input className="input" type="date" min={today} value={startDate}
              onChange={(e) => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(e.target.value) }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-soft)', marginBottom: 6, fontWeight: 500 }}>End Date</label>
            <input className="input" type="date" min={startDate || today} value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Working days preview */}
        {workingDays > 0 && (
          <div style={{ padding: '12px 16px', background: balanceWarning ? '#2a0012' : 'rgba(215,223,35,0.08)', border: `1px solid ${balanceWarning ? 'var(--danger)' : 'rgba(215,223,35,0.3)'}`, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft)' }}>Working days</p>
              <p className="mono" style={{ margin: 0, fontSize: 20, fontWeight: 700, color: balanceWarning ? 'var(--danger)' : 'var(--accent)' }}>
                {workingDays}
              </p>
            </div>
            {balance !== null && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: balanceWarning ? 'var(--danger)' : 'var(--text-muted)' }}>
                {balanceWarning
                  ? `⚠ Exceeds your ${leaveType === 'EL' ? 'AL' : leaveType} balance of ${balance} days`
                  : `${balance - workingDays} days remaining after this request`}
              </p>
            )}
          </div>
        )}

        {/* Reason */}
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-soft)', marginBottom: 6, fontWeight: 500 }}>
            Reason <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <textarea className="input" rows={3} placeholder="Briefly describe your reason…"
            value={reason} onChange={(e) => setReason(e.target.value)}
            style={{ resize: 'none', lineHeight: 1.5 }}
          />
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#2a0012', border: '1px solid var(--danger)', borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>⚠ {error}</p>
          </div>
        )}

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || balanceWarning || !startDate || !endDate}>
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </div>
    </div>
  )
}
