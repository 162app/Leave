'use client'

import { LeaveRequest, LEAVE_LABELS } from '@/lib/types'
import { COMPANY } from '@/lib/company-config'
import { formatDateRange, formatDate } from '@/lib/utils'

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
      {/* Print styles — only shows slip, hides everything else */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #leave-slip, #leave-slip * { visibility: visible !important; }
          #leave-slip {
            position: fixed !important;
            inset: 0 !important;
            background: white !important;
            padding: 32px !important;
            z-index: 9999 !important;
          }
          .no-print { display: none !important; }
        }
        @page { size: A4; margin: 20mm; }
      `}</style>

      {/* Backdrop */}
      <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200 }}
        onClick={onClose} />

      {/* Slip container */}
      <div id="leave-slip" style={{
        position: 'fixed', inset: 0, zIndex: 201, overflowY: 'auto',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px 40px',
      }}>
        <div style={{
          background: 'white', borderRadius: 16, width: '100%', maxWidth: 520,
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)', overflow: 'hidden',
          fontFamily: 'Georgia, serif', color: '#1a1a1a',
        }}>

          {/* Header */}
          <div style={{ background: '#111', padding: '24px 28px', textAlign: 'center' }}>
            {COMPANY.logoPath ? (
              <img src={COMPANY.logoPath} alt="Logo" style={{ height: 48, marginBottom: 10, objectFit: 'contain' }} />
            ) : (
              <div style={{ width: 48, height: 48, background: '#D7DF23', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 22 }}>
                📋
              </div>
            )}
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white', fontFamily: 'Georgia, serif' }}>
              {COMPANY.name}
            </h1>
            {COMPANY.tagline && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999', fontFamily: 'Georgia, serif' }}>{COMPANY.tagline}</p>
            )}
          </div>

          {/* Slip title bar */}
          <div style={{ background: '#D7DF23', padding: '10px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Leave Approval Slip
            </span>
            <span style={{ fontSize: 11, color: '#555', fontFamily: 'monospace' }}>{slipNumber}</span>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px' }}>

            {/* Status badge */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span style={{
                display: 'inline-block', padding: '6px 20px', borderRadius: 20,
                background: '#e8faf0', border: '1.5px solid #22c55e',
                fontSize: 13, fontWeight: 700, color: '#15803d', letterSpacing: '0.5px'
              }}>
                ✓ APPROVED
              </span>
            </div>

            {/* Employee details */}
            <Section title="Employee Details">
              <Row label="Full Name" value={emp?.name ?? '—'} bold />
              <Row label="Position" value={emp?.position ?? '—'} />
              <Row label="Department" value={emp?.department ?? '—'} />
              <Row label="Email" value={emp?.email ?? '—'} />
            </Section>

            <Divider />

            {/* Leave details */}
            <Section title="Leave Details">
              <Row label="Leave Type" value={leaveLabel} bold />
              <Row label="Duration" value={`${request.days_count} working day${request.days_count !== 1 ? 's' : ''}`} accent />
              <Row label="Start Date" value={new Date(request.start_date).toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
              <Row label="End Date" value={new Date(request.end_date).toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
              {request.reason && <Row label="Reason" value={request.reason} />}
            </Section>

            {request.admin_note && (
              <>
                <Divider />
                <Section title="Admin Note">
                  <p style={{ margin: 0, fontSize: 13, color: '#444', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{request.admin_note}"
                  </p>
                </Section>
              </>
            )}

            <Divider />

            {/* Generated info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: '#888' }}>Date Generated</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#444' }}>{generatedDate}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#888' }}>Submitted</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#444' }}>{formatDate(request.created_at.split('T')[0])}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: '#f8f8f8', borderTop: '1px solid #eee', padding: '14px 28px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, color: '#888', lineHeight: 1.6 }}>
              {COMPANY.address}<br />
              {COMPANY.phone} · {COMPANY.email}
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 10, color: '#bbb' }}>
              This is a system-generated document. No signature required.
            </p>
          </div>

          {/* Action buttons — hidden on print */}
          <div className="no-print" style={{ padding: '16px 28px 20px', display: 'flex', gap: 10 }}>
            <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Close</button>
            <button onClick={handlePrint}
              style={{ flex: 2, background: '#D7DF23', border: 'none', borderRadius: 12, padding: '13px', color: '#111', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>
              🖨 Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Georgia, serif' }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>{children}</div>
    </div>
  )
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
      <span style={{ fontSize: 12, color: '#888', flexShrink: 0, minWidth: 100 }}>{label}</span>
      <span style={{
        fontSize: 13, textAlign: 'right',
        fontWeight: bold ? 700 : 400,
        color: accent ? '#b8a000' : '#1a1a1a',
        fontFamily: accent ? 'monospace' : 'Georgia, serif',
      }}>
        {value}
      </span>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: '#eee', margin: '16px 0' }} />
}
