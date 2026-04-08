'use client'

import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '🏠', label: 'Home' },
  { href: '/dashboard/apply', icon: '➕', label: 'Apply' },
  { href: '/dashboard/history', icon: '📋', label: 'History' },
]

export function EmployeeNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="bottom-nav">
      <div style={{ display: 'flex', padding: '8px 0' }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <button key={item.href} onClick={() => router.push(item.href)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px 0', fontFamily: 'inherit',
              }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
                {item.label}
              </span>
              {active && <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--accent)' }} />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

const ADMIN_NAV = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/leaves', icon: '📋', label: 'Leaves' },
  { href: '/admin/employees', icon: '👥', label: 'Staff' },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="bottom-nav">
      <div style={{ display: 'flex', padding: '8px 0' }}>
        {ADMIN_NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <button key={item.href} onClick={() => router.push(item.href)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px 0', fontFamily: 'inherit',
              }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
                {item.label}
              </span>
              {active && <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--accent)' }} />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
