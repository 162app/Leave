'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createLeaveRequest } from '@/lib/api/leave'
import { LeaveType, LEAVE_LABELS, LEAVE_DESCRIPTIONS } from '@/lib/types'
import { countWorkingDays, todayISO } from '@/lib/utils'
import { PageHeader } from '@/components/ui'

const LEAVE_TYPES: LeaveType[] = ['AL', 'EL', 'MC', 'Replacement', 'Others']

export default function ApplyLeavePage() {
  const { employee } = useAuth()
  const router = useRouter()

  const [leaveType, setLeaveType] = useState<LeaveType>('AL')
  const [otherType, setOtherType] = useState('')   // only for 'Others'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const today = todayISO()
  const workingDays = startDate && endDate ? countWorkingDays(startDate, endDate) : 0

  /** Get available balance for selected leave type. Others = no limit. */
  const getBalance = (): number | null => {
    if (!employee) return null
    if (leaveType === 'AL') return employee.al_balance
    if (leaveType === 'EL') return employee.el_balance
    if (leaveType === 'MC') return employee.mc_balance
    if (leaveType === 'Replacement') return employee.replacement_balance
    return null // Others — no balance check
  }

  const balance = getBalance()
  const balanceWarning = balance !== null && workingDays > balance
  const noReplacement = leaveType === 'Replacement' && employee?.replacement_balance === 0

  const handleSubmit = async () => {
    if (!employee) return
    if (!startDate || !endDate) { setError('Please select start and end dates'); return }
    if (endDate < startDate) { setError('End date must be after start date'); return }
    if (workingDays === 0) { setError('No working days in selected range'); return }
    if (leaveType === 'Others' && !otherType.trim()) { setError('Please specify the leave type'); return }
    if (balanceWarning) { setError(`Insufficient ${leaveType} balance`); return }
    if (noReplacement) { setError('No replacement leave credits available'); return }

    setLoading(true); setError('')
    try {
      await createLeaveRequest({
        employee_id: employee.id,
        leave_type: leaveType,
        leave_other_type: leaveType === 'Others' ? otherType.trim() : null,
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
              const cardBalance =
                type === 'AL' ? employee?.al_balance :
                type === 'EL' ? employee?.el_balance :
                type === 'MC' ? employee?.mc_balance :
                type === 'Replacement' ? employee?.replacement_balance :
                null
              const isSelected = leaveType === type
              const isEmpty = cardBalance === 0

              return (
                <button key={type} onClick={() => { setLeaveType(type); setError('') }}
                  style={{
                    padding: '12px 10px', borderRadius: 12, border: '1.5px solid',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    background: isSelected ? 'rgba(215,223,35,0.08)' : 'var(--bg-card)',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', opacity: (type === 'Replacement' && isEmpty) ? 0.5 : 1,
                  }}>
                  <span className={`pill-${type}`} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{type}</span>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: '6px 0 2px', lineHeight: 1.3 }}>{LEAVE_LABELS[type]}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>
                    {cardBalance !== null && cardBalance !== undefined
                      ? `${cardBalance} days left`
                      : LEAVE_DESCRIPTIONS[type]}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Others: specify leave type */}
          {leaveType === 'Others' && (
            <div style={{ marginTop: 10 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-soft)', marginBottom: 6, fontWeight: 500 }}>
                Specify Leave Type *
              </label>
              <input className="input" placeholder="e.g. Unpaid Leave, Study Leave, Paternity Leave…"
                value={otherType} onChange={(e) => setOtherType(e.target.value)} />
            </div>
          )}

          {/* Replacement: no credits warning */}
          {noReplacement && (
            <div style={{ marginTop: 10, padding: '9px 13px', background: '#2a0012', border: '1px solid var(--danger)', borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>
                ⚠ You have no replacement leave credits. Credits are added by admin when you work on a public holiday.
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
              <p className="mono" style={{ margin: 0, fontSize: 20, fontWeight: 700, color: balanceWarning ? 'var(--danger)' : 'var(--accent)' }}>{workingDays}</p>
            </div>
            {balance !== null && !balanceWarning && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {balance - workingDays} days remaining after this request
              </p>
            )}
            {balanceWarning && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--danger)' }}>
                ⚠ Exceeds your {leaveType} balance of {balance} days
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

        <button className="btn-primary" onClick={handleSubmit}
          disabled={loading || balanceWarning || !startDate || !endDate || noReplacement}>
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </div>
    </div>
  )
}
