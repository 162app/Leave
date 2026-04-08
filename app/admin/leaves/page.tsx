'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getLeaveRequests, updateLeaveStatus } from '@/lib/api/leave'
import { LeaveRequest, LeaveStatus, LEAVE_LABELS } from '@/lib/types'
import { LeaveCard } from '@/components/ui/LeaveCard'
import { LeaveSlip } from '@/components/ui/LeaveSlip'
import { StatusBadge, LeaveTypePill, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui'
import { formatDate } from '@/lib/utils'

const FILTERS: { label: string; value: LeaveStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: '⏳ Pending', value: 'Pending' },
  { label: '✓ Approved', value: 'Approved' },
  { label: '✕ Rejected', value: 'Rejected' },
]

const PAGE_SIZE = 10

function AdminLeavesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const focusId = searchParams.get('id')

  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<LeaveStatus | 'All'>('All')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<LeaveRequest | null>(null)
  const [slipRequest, setSlipRequest] = useState<LeaveRequest | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [acting, setActing] = useState(false)

  const load = async () => {
    const data = await getLeaveRequests()
    setLeaves(data)
    if (focusId) {
      const found = data.find(l => l.id === focusId)
      if (found) { setSelected(found); setAdminNote(found.admin_note ?? '') }
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [focusId])
  useEffect(() => { setPage(1) }, [filter])

  const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (!selected) return
    setActing(true)
    try {
      const updated = await updateLeaveStatus(selected.id, status, adminNote.trim() || undefined)
      setLeaves(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l))
      // If just approved, offer slip immediately
      if (status === 'Approved') {
        setSlipRequest(updated)
      }
      setSelected(null)
      setAdminNote('')
      router.replace('/admin/leaves')
    } finally { setActing(false) }
  }

  return (
    <div className="pb-nav page-enter">
      <PageHeader title="Leave Requests" subtitle="Review and manage all requests" />

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
          <EmptyState icon="📭" title="No requests found" subtitle="Try a different filter" />
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {paginated.map(leave => (
                <div key={leave.id}>
                  <LeaveCard request={leave} showEmployee
                    onClick={() => { setSelected(leave); setAdminNote(leave.admin_note ?? '') }} />
                  {/* Slip button for approved leaves */}
                  {leave.status === 'Approved' && (
                    <button onClick={() => setSlipRequest(leave)}
                      style={{ width: '100%', marginTop: 6, padding: '8px', borderRadius: 10, border: '1px solid rgba(215,223,35,0.3)', background: 'rgba(215,223,35,0.06)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      🖨 View / Print Leave Slip
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

      {/* Detail / Action modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) { setSelected(null); router.replace('/admin/leaves') } }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <LeaveTypePill type={selected.leave_type} />
                <StatusBadge status={selected.status} />
              </div>
              <button onClick={() => { setSelected(null); router.replace('/admin/leaves') }}
                style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>

            {selected.employee && (
              <div style={{ padding: '14px 16px', background: 'var(--bg-card2)', borderRadius: 12, marginBottom: 16 }}>
                <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>{selected.employee.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px' }}>{selected.employee.position} · {selected.employee.department}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{selected.employee.email}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <Detail label="Leave Type" value={selected.leave_type === 'Others' && selected.leave_other_type ? selected.leave_other_type : LEAVE_LABELS[selected.leave_type]} />
              <Detail label="Duration" value={`${selected.days_count} day${selected.days_count !== 1 ? 's' : ''}`} accent />
              <Detail label="Start" value={formatDate(selected.start_date)} />
              <Detail label="End" value={formatDate(selected.end_date)} />
            </div>

            {selected.reason && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</p>
                <p style={{ fontSize: 14, color: 'var(--text)', background: 'var(--bg-card2)', padding: '10px 14px', borderRadius: 10, margin: 0 }}>{selected.reason}</p>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Admin Note (optional)
              </label>
              <textarea className="input" rows={2} placeholder="Add a note for the employee…"
                value={adminNote} onChange={e => setAdminNote(e.target.value)} style={{ resize: 'none' }} />
            </div>

            {selected.status === 'Pending' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={() => handleAction('Rejected')} disabled={acting}
                  style={{ padding: 13, borderRadius: 12, border: '1.5px solid var(--danger)', background: 'rgba(255,77,109,0.08)', color: 'var(--danger)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700 }}>
                  {acting ? '…' : '✕ Reject'}
                </button>
                <button onClick={() => handleAction('Approved')} disabled={acting}
                  style={{ padding: 13, borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#111', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700 }}>
                  {acting ? '…' : '✓ Approve'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: selected.status === 'Approved' ? '1fr 1fr' : '1fr', gap: 10 }}>
                {selected.status === 'Approved' && (
                  <button onClick={() => handleAction('Rejected')} disabled={acting}
                    style={{ padding: 13, borderRadius: 12, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>
                    {acting ? '…' : 'Revoke'}
                  </button>
                )}
                {selected.status === 'Rejected' && (
                  <button onClick={() => handleAction('Approved')} disabled={acting}
                    style={{ padding: 13, borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#111', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>
                    {acting ? '…' : 'Re-approve'}
                  </button>
                )}
                {selected.status === 'Approved' && (
                  <button onClick={() => { setSlipRequest(selected); setSelected(null) }}
                    style={{ padding: 13, borderRadius: 12, border: '1.5px solid rgba(215,223,35,0.4)', background: 'rgba(215,223,35,0.08)', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>
                    🖨 Print Slip
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leave slip */}
      {slipRequest && (
        <LeaveSlip request={slipRequest} onClose={() => setSlipRequest(null)} />
      )}
    </div>
  )
}

function Detail({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</p>
      <p className={accent ? 'mono' : ''} style={{ fontSize: accent ? 18 : 14, fontWeight: 600, color: accent ? 'var(--accent)' : 'var(--text)', margin: 0 }}>{value}</p>
    </div>
  )
}

export default function AdminLeavesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminLeavesContent />
    </Suspense>
  )
}
