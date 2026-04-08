'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getEmployees, deleteEmployee } from '@/lib/api/employees'
import { Employee } from '@/lib/types'
import { EmptyState, LoadingSpinner } from '@/components/ui'

export default function AdminEmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { getEmployees().then(setEmployees).finally(() => setLoading(false)) }, [])

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Remove ${emp.name}? This will also delete all their leave records.`)) return
    setDeleting(emp.id)
    try {
      await deleteEmployee(emp.id)
      setEmployees(prev => prev.filter(e => e.id !== emp.id))
    } finally { setDeleting(null) }
  }

  return (
    <div className="pb-nav page-enter">
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 2px' }}>Admin</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', margin: 0 }}>Staff 👥</h1>
        </div>
        <button onClick={() => router.push('/admin/employees/new')}
          style={{ background: 'var(--accent)', border: 'none', borderRadius: 12, padding: '10px 16px', color: '#111', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Add
        </button>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <input className="input" placeholder="Search by name, email, department…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState icon="👥" title="No employees found" subtitle={search ? 'Try a different search' : 'Add your first employee'} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(emp => (
              <EmployeeRow key={emp.id} employee={emp}
                onEdit={() => router.push(`/admin/employees/${emp.id}`)}
                onDelete={() => handleDelete(emp)}
                deleting={deleting === emp.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmployeeRow({ employee: e, onEdit, onDelete, deleting }: {
  employee: Employee; onEdit: () => void; onDelete: () => void; deleting: boolean
}) {
  const initials = e.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.position} · {e.department}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Chip label="AL" value={e.al_balance} />
            <Chip label="EL" value={e.el_balance} />
            <Chip label="MC" value={e.mc_balance} />
            {e.replacement_balance > 0 && <Chip label="RL" value={e.replacement_balance} highlight />}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <button onClick={onEdit} style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text-soft)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
          <button onClick={onDelete} disabled={deleting} style={{ background: 'transparent', border: '1px solid var(--danger)', borderRadius: 8, padding: '6px 12px', color: 'var(--danger)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', opacity: deleting ? 0.5 : 1 }}>
            {deleting ? '…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Chip({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'var(--bg-card2)', border: `1px solid ${highlight ? 'var(--accent)' : 'var(--border)'}`, color: 'var(--text-soft)', fontWeight: 600 }}>
      {label}: <span className="mono" style={{ color: highlight ? 'var(--accent)' : 'var(--accent)' }}>{value}</span>
    </span>
  )
}
