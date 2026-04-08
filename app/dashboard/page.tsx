'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getLeaveRequests } from '@/lib/api/leave'
import { getEmployee } from '@/lib/api/employees'
import { LeaveRequest, Employee } from '@/lib/types'
import { LeaveCard } from '@/components/ui/LeaveCard'
import { EmptyState, LoadingSpinner, SectionHeader } from '@/components/ui'

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

  // Compute used days from approved leaves
  const approved = leaves.filter(l => l.status === 'Approved')
  const alUsed = approved.filter(l => l.leave_type === 'AL').reduce((s, l) => s + l.days_count, 0)
  const elUsed = approved.filter(l => l.leave_type === 'EL').reduce((s, l) => s + l.days_count, 0)
  const mcUsed = approved.filter(l => l.leave_type === 'MC').reduce((s, l) => s + l.days_count, 0)
  const replUsed = approved.filter(l => l.leave_type === 'Replacement').reduce((s, l) => s + l.days_count, 0)

  const alTotal = emp.al_balance + alUsed
  const elTotal = emp.el_balance + elUsed
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

      {pending > 0 && (
        <div style={{ margin: '16px 20px 0', padding: '10px 14px', background: '#2a2000', border: '1px solid #3d3000', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⏳</span>
          <p style={{ margin: 0, fontSize: 13, color: '#fbbf24' }}>
            {pending} leave request{pending > 1 ? 's' : ''} pending approval
          </p>
        </div>
      )}

      {/* Balance cards */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionHeader title="Leave Balance" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <BalanceCard type="AL" label="Annual" balance={emp.al_balance} used={alUsed} total={alTotal} />
          <BalanceCard type="EL" label="Emergency/Compassionate" balance={emp.el_balance} used={elUsed} total={elTotal} />
          <BalanceCard type="MC" label="Medical" balance={emp.mc_balance} used={mcUsed} total={mcTotal} />
          <BalanceCard type="Replacement" label="Replacement" balance={emp.replacement_balance} used={replUsed} total={emp.replacement_balance + replUsed} noBar={emp.replacement_balance === 0 && replUsed === 0} />
        </div>

        <div className="card" style={{ marginTop: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 8, borderStyle: 'dashed' }}
          onClick={() => router.push('/dashboard/apply')}>
          <span style={{ fontSize: 22 }}>➕</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>Apply Leave</span>
        </div>
      </div>

      {/* Recent */}
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

function BalanceCard({ type, label, balance, used, total, noBar }: {
  type: string; label: string; balance: number; used: number; total: number; noBar?: boolean
}) {
  const pct = total > 0 ? Math.min(100, Math.round((balance / total) * 100)) : 0
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <span className={`pill-${type}`} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{type}</span>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.3 }}>{label}</p>
        </div>
        <p className="mono" style={{ fontSize: 22, fontWeight: 700, color: balance > 0 ? 'var(--accent)' : 'var(--text-muted)', margin: 0 }}>{balance}</p>
      </div>
      {!noBar && (
        <>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>{used} used / {total} total</p>
        </>
      )}
      {noBar && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>No credits yet</p>}
    </div>
  )
}
