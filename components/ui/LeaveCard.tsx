'use client'

import { LeaveRequest } from '@/lib/types'
import { StatusBadge, LeaveTypePill } from '@/components/ui'
import { formatDateRange } from '@/lib/utils'

interface LeaveCardProps {
  request: LeaveRequest
  showEmployee?: boolean
  onClick?: () => void
}

export function LeaveCard({ request, showEmployee = false, onClick }: LeaveCardProps) {
  return (
    <div className="card" onClick={onClick}
      style={{ padding: 16, cursor: onClick ? 'pointer' : 'default', transition: 'border-color 0.15s' }}
      onMouseEnter={(e) => onClick && ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)')}
      onMouseLeave={(e) => onClick && ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <LeaveTypePill type={request.leave_type} />
          <StatusBadge status={request.status} />
        </div>
        <span className="mono" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 8 }}>
          {request.days_count}d
        </span>
      </div>

      {showEmployee && request.employee && (
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
          {request.employee.name}
        </p>
      )}

      <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: showEmployee ? 4 : 0 }}>
        📅 {formatDateRange(request.start_date, request.end_date)}
      </p>

      {showEmployee && request.employee && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {request.employee.department}
        </p>
      )}

      {request.reason && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {request.reason}
        </p>
      )}

      {request.admin_note && (
        <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg)', borderRadius: 8, borderLeft: '2px solid var(--accent)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 2px', fontWeight: 600 }}>Admin note</p>
          <p style={{ fontSize: 12, color: 'var(--text-soft)', margin: 0 }}>{request.admin_note}</p>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, margin: '10px 0 0' }}>
        Submitted {new Date(request.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  )
}
