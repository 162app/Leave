'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getLeaveRequests, updateLeaveStatus } from '@/lib/api/leave'
import { LeaveRequest, LeaveStatus, LEAVE_LABELS } from '@/lib/types'
import { LeaveCard } from '@/components/ui/LeaveCard'
import { StatusBadge, LeaveTypePill, EmptyState, LoadingSpinner, PageHeader, SectionHeader } from '@/components/ui'
import { formatDateRange } from '@/lib/utils'

const FILTERS: { label: string; value: LeaveStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: '⏳ Pending', value: 'Pending' },
  { label: '✓ Approved', value: 'Approved' },
  { label: '✕ Rejected', value: 'Rejected' },
]

function AdminLeavesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const focusId = searchParams.get('id')

  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<LeaveStatus | 'All'>('All')
  const [selected, setSelected] = useState<LeaveRequest | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [acting, setActing] = useState(false)

  const load = async () => {
    const data = await getLeaveRequests()
    setLeaves(data)
    if (focusId) {
      const found = data.find(l => l.id === focusId)
      if (found) setSelected(found)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [focusId])

  const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter)

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (!selected) return
    setActing(true)
    try {
      const updated = await updateLeaveStatus(selected.id, status, adminNote.trim() || undefined)
      setLeaves(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l))
      setSelected(null)
      setAdminNote('')
      router.replace('/admin/leaves')
    } finally {
      setActing(false)
    }
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
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(leave => (
              <LeaveCard key={leave.id} request={leave} showEmployee onClick={() => { setSelected(leave); setAdminNote(leave.admin_note ?? '') }} />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setSelected(null); router.replace('/admin/leaves') } }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            {/* Handle bar */}
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />

            {/* Header */}
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

            {/* Employee info */}
            {selected.employee && (
              <div style={{ padding: '14px 16px', background: 'var(--bg-card2)', borderRadius: 12, marginBottom: 16 }}>
                <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>{selected.employee.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 6px' }}>{selected.employee.position} · {selected.employee.department}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{selected.employee.email}</p>
              </div>
            )}

            {/* Leave details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <Detail label="Leave Type" value={LEAVE_LABELS[selected.leave_type]} />
              <Detail label="Duration" value={`${selected.days_count} working day${selected.days_count !== 1 ? 's' : ''}`} accent />
              <Detail label="Start Date" value={new Date(selected.start_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })} />
              <Detail label="End Date" value={new Date(selected.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })} />
            </div>

            {selected.reason && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</p>
                <p style={{ fontSize: 14, color: 'var(--text)', background: 'var(--bg-card2)', padding: '10px 14px', borderRadius: 10, margin: 0 }}>{selected.reason}</p>
              </div>
            )}

            {/* Admin note */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Admin Note (optional)
              </label>
              <textarea className="input" rows={2} placeholder="Add a note for the employee…"
                value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            {/* Action buttons */}
            {selected.status === 'Pending' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={() => handleAction('Rejected')} disabled={acting}
                  style={{ padding: '13px', borderRadius: 12, border: '1.5px solid var(--danger)', background: 'rgba(255,77,109,0.08)', color: 'var(--danger)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, transition: 'all 0.15s' }}>
                  {acting ? '…' : '✕ Reject'}
                </button>
                <button onClick={() => handleAction('Approved')} disabled={acting}
                  style={{ padding: '13px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#111', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, transition: 'all 0.15s' }}>
                  {acting ? '…' : '✓ Approve'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {selected.status === 'Approved' && (
                  <button onClick={() => handleAction('Rejected')} disabled={acting}
                    style={{ padding: '13px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>
                    {acting ? '…' : 'Revoke'}
                  </button>
                )}
                {selected.status === 'Rejected' && (
                  <button onClick={() => handleAction('Approved')} disabled={acting}
                    style={{ padding: '13px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#111', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>
                    {acting ? '…' : 'Re-approve'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
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
