'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getLeaveRequests } from '@/lib/api/leave'
import { getEmployee } from '@/lib/api/employees'
import { LeaveRequest, Employee } from '@/lib/types'
import { LeaveCard } from '@/components/ui/LeaveCard'
import { EmptyState, LoadingSpinner, SectionHeader } from '@/components/ui'

// AL_TOTAL and MC_TOTAL are the default entitlements shown in the progress bar.
// Admin can override per-employee, so we derive "total" from balance + used days from history.
const AL_DEFAULT = 14
const MC_DEFAULT = 14

export default function DashboardHome() {
  const { employee, logout } = useAuth()
  const router = useRouter()
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [freshEmployee, setFreshEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!employee) return
    Promise.all([
      getLeaveRequests({ employeeId: employee.id }),
      getEmployee(employee.id),
    ]).then(([leavesData, empData]) => {
      setLeaves(leavesData)
      setFreshEmployee(empData)
    }).finally(() => setLoading(false))
  }, [employee])

  const emp = freshEmployee ?? employee
  if (!emp) return null

  const pending = leaves.filter(l => l.status === 'Pending').length
  const recent = leaves.slice(0, 3)

  // Compute used days from approved leaves for accurate progress
  const approved = leaves.filter(l => l.status === 'Approved')
  const alUsed = approved.filter(l => l.leave_type === 'AL' || l.leave_type === 'EL')
    .reduce((s, l) => s + l.days_count, 0)
  const mcUsed = approved.filter(l => l.leave_type === 'MC')
    .reduce((s, l) => s + l.days_count, 0)
  const elUsed = approved.filter(l => l.leave_type === 'EL')
    .reduce((s, l) => s + l.days_count, 0)

  const alTotal = emp.al_balance + alUsed
  const mcTotal = emp.mc_balance + mcUsed

  return (
    <div className="pb-nav page-enter">
      {/* Top bar */}
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 2px' }}>Good day,</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', margin: 0 }}>{emp.name.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '4px 0 0' }}>{emp.position} · {emp.department}</p>
        </div>
        <button onClick={() => { logout(); router.push('/') }}
          style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Sign out
        </button>
      </div>

      {/* Pending notice */}
      {pending > 0 && (
        <div style={{ margin: '16px 20px 0', padding: '10px 14px', background: '#2a2000', border: '1px solid #3d3000', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⏳</span>
          <p style={{ margin: 0, fontSize: 13, color: '#fbbf24' }}>
            {pending} leave request{pending > 1 ? 's' : ''} pending approval
          </p>
        </div>
      )}

      {/* Leave balances */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionHeader title="Leave Balance" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* AL card — spans full width, notes EL shares this pool */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="pill-AL" style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>AL</span>
                  <span className="pill-EL" style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>EL</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>Annual · Emergency</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', fontStyle: 'italic' }}>
                  EL shares the Annual Leave pool
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="mono" style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', margin: 0, lineHeight: 1 }}>{emp.al_balance}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>days left</p>
              </div>
            </div>
            <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round((emp.al_balance / alTotal) * 100))}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{alUsed} used / {alTotal} total</p>
              {elUsed > 0 && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>incl. {elUsed}d EL</p>}
            </div>
          </div>

          {/* MC + Apply button row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <span className="pill-MC" style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>MC</span>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>Medical</p>
                </div>
                <p className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', margin: 0 }}>{emp.mc_balance}</p>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.round((emp.mc_balance / mcTotal) * 100))}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>{mcUsed} used / {mcTotal} total</p>
            </div>

            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', gap: 6, borderStyle: 'dashed' }}
              onClick={() => router.push('/dashboard/apply')}>
              <span style={{ fontSize: 24 }}>➕</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Apply Leave</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent requests */}
      <div style={{ padding: '24px 20px 0' }}>
        <SectionHeader title="Recent Requests"
          action={
            <button onClick={() => router.push('/dashboard/history')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
              View all →
            </button>
          }
        />
        {loading ? <LoadingSpinner /> : recent.length === 0 ? (
          <EmptyState icon="📭" title="No leave requests yet" subtitle="Tap Apply to submit your first request" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.map(leave => <LeaveCard key={leave.id} request={leave} />)}
          </div>
        )}
      </div>
    </div>
  )
}
