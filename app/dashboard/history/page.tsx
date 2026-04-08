'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getLeaveRequests } from '@/lib/api/leave'
import { LeaveRequest, LeaveStatus } from '@/lib/types'
import { LeaveCard } from '@/components/ui/LeaveCard'
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui'

const FILTERS: { label: string; value: LeaveStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
]

export default function HistoryPage() {
  const { employee } = useAuth()
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<LeaveStatus | 'All'>('All')

  useEffect(() => {
    if (!employee) return
    getLeaveRequests({ employeeId: employee.id })
      .then(setLeaves)
      .finally(() => setLoading(false))
  }, [employee])

  const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter)

  return (
    <div className="pb-nav page-enter">
      <PageHeader title="Leave History" subtitle="All your leave requests" />

      {/* Filter tabs */}
      <div style={{ padding: '16px 20px 0', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {FILTERS.map(f => {
          const active = filter === f.value
          const count = f.value === 'All' ? leaves.length : leaves.filter(l => l.status === f.value).length
          return (
            <button key={f.value} onClick={() => setFilter(f.value)}
              style={{
                padding: '7px 14px', borderRadius: 20, border: '1px solid',
                borderColor: active ? 'var(--accent)' : 'var(--border)',
                background: active ? 'rgba(215,223,35,0.12)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>
              {f.label} {count > 0 && <span style={{ fontSize: 11, opacity: 0.7 }}>({count})</span>}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState icon="📭" title={`No ${filter === 'All' ? '' : filter.toLowerCase() + ' '}requests`} subtitle="Your leave history will appear here" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(leave => <LeaveCard key={leave.id} request={leave} />)}
          </div>
        )}
      </div>
    </div>
  )
}
