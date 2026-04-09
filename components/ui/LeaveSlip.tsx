'use client'

import { useState } from 'react'
import { LeaveRequest, LEAVE_LABELS } from '@/lib/types'
import { formatDateRange } from '@/lib/utils'
import { LeaveTypePill } from '@/components/ui'

interface LeaveSlipProps {
  request: LeaveRequest
  onClose: () => void
}

export function LeaveSlip({ request, onClose }: LeaveSlipProps) {
  const [generating, setGenerating] = useState(false)
  const emp = request.employee

  const leaveLabel = request.leave_type === 'Others' && request.leave_other_type
    ? request.leave_other_type
    : LEAVE_LABELS[request.leave_type]

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      // Dynamic import — avoids SSR issues with jsPDF
      const { generateSlipPDF } = await import('@/lib/generate-slip-pdf')
      generateSlipPDF(request)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200 }}
        onClick={onClose} />

      {/* Bottom sheet */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, background: 'var(--bg-card)', borderRadius: '20px 20px 0 0', padding: '24px 24px 36px' }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>📄</span>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Leave Slip</h2>
        </div>
        
        {/* Summary */}
        <div style={{ background: 'var(--bg-card2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 2px' }}>{emp?.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{emp?.position} · {emp?.department}</p>
            </div>
            <LeaveTypePill type={request.leave_type} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--text-soft)', margin: 0 }}>
              📅 {formatDateRange(request.start_date, request.end_date)}
            </p>
            <p className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', margin: 0 }}>
              {request.days_count}d
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button onClick={handleGenerate} disabled={generating}
            style={{ flex: 2, background: 'var(--accent)', border: 'none', borderRadius: 12, padding: 13, color: '#111', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, opacity: generating ? 0.7 : 1 }}>
            {generating ? 'Opening…' : '👁 View PDF'}
          </button>
        </div>
      </div>
    </>
  )
}
