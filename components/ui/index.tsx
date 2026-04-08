'use client'

import { LeaveStatus, LeaveType, LEAVE_LABELS } from '@/lib/types'

// ─── Status Badge ────────────────────────────────────────────
export function StatusBadge({ status }: { status: LeaveStatus }) {
  const cls = {
    Pending: 'badge-pending',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected',
  }[status]

  const icon = { Pending: '⏳', Approved: '✓', Rejected: '✕' }[status]

  return (
    <span className={cls} style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {icon} {status}
    </span>
  )
}

// ─── Leave Type Pill ─────────────────────────────────────────
export function LeaveTypePill({ type }: { type: LeaveType }) {
  return (
    <span className={`pill-${type}`} style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.3px' }}>
      {type}
    </span>
  )
}

// ─── Loading Spinner ─────────────────────────────────────────
export function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
      <div style={{
        width: 32, height: 32, border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{title}</p>
      {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{subtitle}</p>}
    </div>
  )
}

// ─── Section Header ──────────────────────────────────────────
export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
        {title}
      </h2>
      {action}
    </div>
  )
}

// ─── Page Header ─────────────────────────────────────────────
export function PageHeader({ title, subtitle, back }: { title: string; subtitle?: string; back?: () => void }) {
  return (
    <div style={{ padding: '20px 20px 0', marginBottom: 8 }}>
      {back && (
        <button onClick={back} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 14, padding: '0 0 12px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back
        </button>
      )}
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>{subtitle}</p>}
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────
export function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: 16, flex: 1 }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
      <p className="mono" style={{ fontSize: 26, fontWeight: 700, color: accent ? 'var(--accent)' : 'var(--text)', margin: '0 0 2px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>}
    </div>
  )
}
