'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getLeaveRequests } from '@/lib/api/leave'
import { LeaveRequest, LeaveStatus } from '@/lib/types'
import { LeaveCard } from '@/components/ui/LeaveCard'
import { LeaveSlip } from '@/components/ui/LeaveSlip'
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui'

const FILTERS: { label: string; value: LeaveStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: '⏳ Pending', value: 'Pending' },
  { label: '✓ Approved', value: 'Approved' },
  { label: '✕ Rejected', value: 'Rejected' },
]

const PAGE_SIZE = 10

export default function HistoryPage() {
  const { employee } = useAuth()
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<LeaveStatus | 'All'>('All')
  const [page, setPage] = useState(1)
  const [slipRequest, setSlipRequest] = useState<LeaveRequest | null>(null)

  useEffect(() => {
    if (!employee) return
    getLeaveRequests({ employeeId: employee.id })
      .then(setLeaves)
      .finally(() => setLoading(false))
  }, [employee])

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1) }, [filter])

  const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
              }}>
              {f.label} <span style={{ fontSize: 11, opacity: 0.7 }}>({count})</span>
            </button>
          )
        })}
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState icon="📭" title="No requests found" subtitle="Your leave history will appear here" />
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {paginated.map(leave => (
                <div key={leave.id}>
                  <LeaveCard request={leave} />
                  {/* Show slip button only for approved leaves */}
                  {leave.status === 'Approved' && (
                    <button onClick={() => setSlipRequest(leave)}
                      style={{ width: '100%', marginTop: 6, padding: '8px', borderRadius: 10, border: '1px solid rgba(215,223,35,0.3)', background: 'rgba(215,223,35,0.06)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      🖨 View Leave Slip
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: '0 4px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-ghost" style={{ padding: '9px 16px', opacity: page === 1 ? 0.4 : 1 }}>
                  ← Prev
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Page {page} of {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn-ghost" style={{ padding: '9px 16px', opacity: page === totalPages ? 0.4 : 1 }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Leave slip modal */}
      {slipRequest && (
        <LeaveSlip request={slipRequest} onClose={() => setSlipRequest(null)} />
      )}
    </div>
  )
}
