'use client'

import { LeaveRequest, LEAVE_LABELS } from '@/lib/types'
import { COMPANY } from '@/lib/company-config'
import { formatDate } from '@/lib/utils'

interface LeaveSlipProps {
  request: LeaveRequest
  onClose: () => void
}

export function LeaveSlip({ request, onClose }: LeaveSlipProps) {
  const emp = request.employee
  const handlePrint = () => window.print()

  const slipNumber = `LS-${request.id.slice(0, 8).toUpperCase()}`
  const generatedDate = new Date().toLocaleDateString('en-MY', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  const leaveLabel = request.leave_type === 'Others' && request.leave_other_type
    ? request.leave_other_type
    : LEAVE_LABELS[request.leave_type]

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #leave-slip-doc, #leave-slip-doc * { visibility: visible !important; }
          #leave-slip-doc {
            position: fixed !important;
            inset: 0 !important;
            background: white !important;
            padding: 16mm !important;
            z-index: 9999 !important;
            display: block !important;
          }
          .no-print { display: none !important; }
        }
        @page { size: A4 portrait; margin: 0; }
      `}</style>

      {/* Backdrop */}
      <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200 }}
        onClick={onClose} />

      {/* Scroll wrapper */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 201, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px 60px' }}>

        {/* A4 slip */}
        <div id="leave-slip-doc" style={{
          background: 'white', width: '100%', maxWidth: 560,
          border: '1px solid #ddd', borderRadius: 8,
          fontFamily: 'Arial, sans-serif', color: '#1a1a1a', fontSize: 12,
        }}>

          {/* Header — no background, just border bottom */}
          <div style={{ padding: '18px 24px 14px', borderBottom: '2px solid #D7DF23', display: 'flex', alignItems: 'center', gap: 12 }}>
            {COMPANY.logoPath ? (
              <img src={COMPANY.logoPath} alt="Logo" style={{ height: 40, objectFit: 'contain', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 40, height: 40, border: '1.5px solid #D7DF23', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                📋
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{COMPANY.name}</div>
              {COMPANY.tagline && <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{COMPANY.tagline}</div>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#555' }}>Leave Approval Slip</div>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#888', marginTop: 2 }}>{slipNumber}</div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '16px 24px 20px' }}>

            {/* Approved badge */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <span style={{ background: '#e8faf0', border: '1.5px solid #22c55e', color: '#15803d', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, letterSpacing: '0.5px' }}>
                ✓ APPROVED
              </span>
            </div>

            {/* 2-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>

              {/* Employee */}
              <div style={{ padding: '12px 14px', borderRight: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Employee</div>
                <Field label="Full Name" value={emp?.name ?? '—'} bold />
                <Field label="Position" value={emp?.position ?? '—'} />
                <Field label="Department" value={emp?.department ?? '—'} />
                <Field label="Email" value={emp?.email ?? '—'} small />
              </div>

              {/* Leave details */}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Leave Details</div>
                <Field label="Leave Type" value={leaveLabel} bold />
                <Field label="Duration" value={`${request.days_count} working day${request.days_count !== 1 ? 's' : ''}`} accent />
                <Field label="Start Date" value={new Date(request.start_date).toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} />
                <Field label="End Date" value={new Date(request.end_date).toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} />
              </div>
            </div>

            {/* Reason */}
            {request.reason && (
              <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: '10px 14px', marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: '#aaa', marginBottom: 4 }}>Reason</div>
                <div style={{ fontSize: 12, color: '#333' }}>{request.reason}</div>
              </div>
            )}

            {/* Admin note */}
            {request.admin_note && (
              <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: '10px 14px', marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: '#aaa', marginBottom: 4 }}>Admin Note</div>
                <div style={{ fontSize: 12, color: '#333', fontStyle: 'italic' }}>{request.admin_note}</div>
              </div>
            )}

            {/* Bottom info row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <InfoBox label="Reference No." value={slipNumber} mono />
              <InfoBox label="Submitted" value={formatDate(request.created_at.split('T')[0])} />
              <InfoBox label="Generated" value={generatedDate} />
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #eee', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 9, color: '#aaa' }}>{COMPANY.email} · {COMPANY.phone}</div>
            <div style={{ fontSize: 9, color: '#ccc' }}>System generated · No signature required</div>
          </div>

          {/* Print/Close buttons — hidden on print */}
          <div className="no-print" style={{ borderTop: '1px solid #eee', padding: '14px 24px', display: 'flex', gap: 10 }}>
            <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Close</button>
            <button onClick={handlePrint}
              style={{ flex: 2, background: '#D7DF23', border: 'none', borderRadius: 12, padding: 13, color: '#111', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
              🖨 Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Field({ label, value, bold, accent, small }: {
  label: string; value: string; bold?: boolean; accent?: boolean; small?: boolean
}) {
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ fontSize: 9, color: '#aaa' }}>{label}</div>
      <div style={{
        fontSize: small ? 10 : 12, marginTop: 1,
        fontWeight: bold ? 700 : 400,
        color: accent ? '#b8a000' : '#1a1a1a',
        fontFamily: accent ? 'monospace' : 'Arial, sans-serif',
        wordBreak: 'break-all',
      }}>
        {value}
      </div>
    </div>
  )
}

function InfoBox({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ background: '#f8f8f8', border: '1px solid #eee', borderRadius: 6, padding: '8px 10px' }}>
      <div style={{ fontSize: 9, color: '#aaa' }}>{label}</div>
      <div style={{ fontSize: mono ? 10 : 11, marginTop: 2, fontFamily: mono ? 'monospace' : 'Arial, sans-serif', color: '#333' }}>{value}</div>
    </div>
  )
}
