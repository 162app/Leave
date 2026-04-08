'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getLeaveRequests } from '@/lib/api/leave'
import { getEmployees } from '@/lib/api/employees'
import { LeaveRequest, Employee } from '@/lib/types'
import { LeaveCard } from '@/components/ui/LeaveCard'
import { EmptyState, LoadingSpinner, SectionHeader, StatCard } from '@/components/ui'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const router = useRouter()
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [l, e] = await Promise.all([getLeaveRequests(), getEmployees()])
    setLeaves(l); setEmployees(e)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const pending = leaves.filter(l => l.status === 'Pending')
  const approved = leaves.filter(l => l.status === 'Approved')
  const total = leaves.length

  return (
    <div className="pb-nav page-enter">
      {/* Top bar */}
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 2px' }}>Admin Panel</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', margin: 0 }}>Overview ⚙️</h1>
        </div>
        <button onClick={() => { logout(); router.push('/') }}
          style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Sign out
        </button>
      </div>

      {/* Stats */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <StatCard label="Pending" value={pending.length} sub="awaiting review" accent />
          <StatCard label="Staff" value={employees.length} sub="employees" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatCard label="Approved" value={approved.length} sub="this period" />
          <StatCard label="Total Requests" value={total} sub="all time" />
        </div>
      </div>

      {/* Pending leaves */}
      <div style={{ padding: '24px 20px 0' }}>
        <SectionHeader title="Pending Approval"
          action={
            pending.length > 3 ? (
              <button onClick={() => router.push('/admin/leaves')}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                View all →
              </button>
            ) : null
          }
        />
        {loading ? <LoadingSpinner /> : pending.length === 0 ? (
          <EmptyState icon="✅" title="All clear!" subtitle="No pending leave requests" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.slice(0, 5).map(leave => (
              <LeaveCard key={leave.id} request={leave} showEmployee
                onClick={() => router.push(`/admin/leaves?id=${leave.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
